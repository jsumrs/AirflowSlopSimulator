import type { DirtyTracker } from "../model/dirty";
import { type Shape, tileCoords, tileCount } from "../model/grid";
import type { Layout } from "../model/layout";
import { createProgram } from "../render/gl";
import VERT from "../render/shaders/fullscreen.vert.glsl?raw";
import {
  BUOYANCY,
  FAN_RESPONSE,
  HEATER_POWER,
  K_OUTSIDE,
  PRESSURE_ITERATIONS,
  SWEEP_HALF_ANGLE,
  SWEEP_PERIOD,
  T_MAX,
  T_MIN,
  V_MAX,
  VORTICITY_STRENGTH,
  diffusionSubsteps,
  sweepPhase,
} from "./params";
import { PROPS_STRIDE, tileProps } from "./props";
import ADVECT_TEMP from "./shaders/advectTemp.frag.glsl?raw";
import ADVECT_VEL from "./shaders/advectVel.frag.glsl?raw";
import COMMON from "./shaders/common.glsl?raw";
import CURL from "./shaders/curl.frag.glsl?raw";
import DIFFUSE from "./shaders/diffuse.frag.glsl?raw";
import DIVERGENCE from "./shaders/divergence.frag.glsl?raw";
import HEAT_SOURCE from "./shaders/heatSource.frag.glsl?raw";
import PRESSURE from "./shaders/pressure.frag.glsl?raw";
import PROJECT from "./shaders/project.frag.glsl?raw";
import RESAMPLE from "./shaders/resample.frag.glsl?raw";
import TILE_AVERAGE from "./shaders/tileAverage.frag.glsl?raw";
import VEL_SOURCE from "./shaders/velSource.frag.glsl?raw";
import VORTICITY from "./shaders/vorticity.frag.glsl?raw";
import {
  type FieldName,
  type SimParams,
  type SimQuality,
  type Solver,
  simShapeFor,
} from "./solver";

interface Target {
  tex: WebGLTexture;
  fbo: WebGLFramebuffer;
}

type Uniforms = Record<string, WebGLUniformLocation>;

interface Pass {
  program: WebGLProgram;
  u: Uniforms;
}

/** Every render target that depends on the grid size. */
interface Fields {
  temp: Pair;
  vel: Pair;
  pressure: Pair;
  div: Target;
  curl: Target;
  avg: Target;
}

/** A ping-pong pair: read `a`, write `b`, then swap. */
class Pair {
  constructor(
    public a: Target,
    public b: Target,
  ) {}
  swap(): void {
    const t = this.a;
    this.a = this.b;
    this.b = t;
  }
}

// Texture units, fixed across passes.
const UNIT_MAIN = 0;
const UNIT_PROPS_A = 1;
const UNIT_PROPS_B = 2;
const UNIT_AUX = 3;

const FULL_UPLOAD_THRESHOLD = 512;

/**
 * WebGL2 solver: fragment-shader passes over float textures. Each pass mirrors a
 * method of CpuSim (cpuReference.ts); keep the two in step.
 */
export class GlSolver implements Solver {
  tileShape: Shape = [0, 0];
  quality: SimQuality = 2;
  simShape: Shape = [0, 0];
  time = 0;

  private vao: WebGLVertexArrayObject;
  private passes: Record<string, Pass> = {};
  private fields: Fields | null = null;
  private propsA: WebGLTexture;
  private propsB: WebGLTexture;
  private propsDataA = new Float32Array(0);
  private propsDataB = new Float32Array(0);
  private propsScratch = new Float32Array(PROPS_STRIDE);
  private coords = [0, 0, 0];
  private readBuf = new Float32Array(0);
  private params: SimParams = { ambientC: 20, gravity: false, swirl: 0 };
  private layout: Layout | null = null;
  /** Tile averages need recomputing / reading back. */
  private avgStale = true;
  private readStale = true;
  private clearColor = new Float32Array(4);
  private onDirty = (i: number) => this.uploadTile(i);

  constructor(
    private gl: WebGL2RenderingContext,
    tileShape: Shape,
    quality: SimQuality,
  ) {
    this.vao = gl.createVertexArray()!;
    const sources: Record<string, string> = {
      heatSource: HEAT_SOURCE,
      velSource: VEL_SOURCE,
      advectTemp: ADVECT_TEMP,
      advectVel: ADVECT_VEL,
      diffuse: DIFFUSE,
      curl: CURL,
      vorticity: VORTICITY,
      divergence: DIVERGENCE,
      pressure: PRESSURE,
      project: PROJECT,
      tileAverage: TILE_AVERAGE,
      resample: RESAMPLE,
    };
    for (const [name, src] of Object.entries(sources)) this.passes[name] = this.compile(src);
    this.propsA = gl.createTexture()!;
    this.propsB = gl.createTexture()!;
    this.resize(tileShape, quality);
  }

  private get temp(): Pair {
    return this.fields!.temp;
  }
  private get vel(): Pair {
    return this.fields!.vel;
  }
  private get pressure(): Pair {
    return this.fields!.pressure;
  }
  private get div(): Target {
    return this.fields!.div;
  }
  private get curl(): Target {
    return this.fields!.curl;
  }
  private get avg(): Target {
    return this.fields!.avg;
  }

  /** Current temperature texture (R32F, sim resolution) for the renderer. */
  get temperature(): WebGLTexture {
    return this.temp.a.tex;
  }

  /** Current velocity texture (RG32F, sim resolution, tiles/s, y down) for the renderer. */
  get velocity(): WebGLTexture {
    return this.vel.a.tex;
  }

  /** Per-tile means (RGBA32F, tile resolution): r = temperature, g/b = velocity. */
  get tileAverages(): WebGLTexture {
    this.refreshAverages();
    return this.avg.tex;
  }

  private compile(src: string): Pass {
    const gl = this.gl;
    const program = createProgram(gl, VERT, src.replace("// #include common", COMMON));
    const u: Uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
    for (let i = 0; i < count; i++) {
      const name = gl.getActiveUniform(program, i)!.name;
      u[name] = gl.getUniformLocation(program, name)!;
    }
    return { program, u };
  }

  private texture(w: number, h: number, internal: number, format: number, data: Float32Array | null): WebGLTexture {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    this.setupTexture(tex, w, h, internal, format, data);
    return tex;
  }

  private setupTexture(
    tex: WebGLTexture,
    w: number,
    h: number,
    internal: number,
    format: number,
    data: Float32Array | null,
  ): void {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.FLOAT, data);
  }

  private target(w: number, h: number, internal: number, format: number): Target {
    const gl = this.gl;
    const tex = this.texture(w, h, internal, format, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error(`Float render target incomplete (0x${status.toString(16)}).`);
    }
    return { tex, fbo };
  }

  private free(t: Target): void {
    this.gl.deleteTexture(t.tex);
    this.gl.deleteFramebuffer(t.fbo);
  }

  private freeFields(f: Fields): void {
    for (const p of [f.temp, f.vel, f.pressure]) {
      this.free(p.a);
      this.free(p.b);
    }
    this.free(f.div);
    this.free(f.curl);
    this.free(f.avg);
  }

  resize(tileShape: Shape, quality: SimQuality): void {
    const gl = this.gl;
    const old = this.fields;
    const oldSim = this.simShape;
    const oldQuality = this.quality;
    this.tileShape = [...tileShape];
    this.quality = quality;
    this.simShape = simShapeFor(tileShape, quality);
    const [sw, sh] = this.simShape as [number, number];
    const [tw, th] = this.tileShape as [number, number];

    const r = () => this.target(sw, sh, gl.R32F, gl.RED);
    const rg = () => this.target(sw, sh, gl.RG32F, gl.RG);
    this.fields = {
      temp: new Pair(r(), r()),
      vel: new Pair(rg(), rg()),
      pressure: new Pair(r(), r()),
      div: r(),
      curl: r(),
      avg: this.target(tw, th, gl.RGBA32F, gl.RGBA),
    };
    this.readBuf = new Float32Array(tw * th * 4);

    const n = tileCount(tileShape);
    this.propsDataA = new Float32Array(n * 4);
    this.propsDataB = new Float32Array(n * 4);
    this.setupTexture(this.propsA, tw, th, gl.RGBA32F, gl.RGBA, this.propsDataA);
    this.setupTexture(this.propsB, tw, th, gl.RGBA32F, gl.RGBA, this.propsDataB);
    this.layout = null; // force a full props upload on the next setTiles

    if (!old) {
      this.reset();
      return;
    }
    // Carry the air and heat over to the new grid, then drop the old targets.
    this.clear(this.temp.b, this.params.ambientC);
    for (const t of [this.vel.b, this.pressure.a, this.pressure.b, this.div, this.curl]) this.clear(t, 0);
    this.resample(old.temp.a, this.temp.a, oldSim, oldQuality, this.params.ambientC);
    this.resample(old.vel.a, this.vel.a, oldSim, oldQuality, 0);
    this.freeFields(old);
    this.avgStale = true;
    this.readStale = true;
  }

  private resample(src: Target, dst: Target, srcSim: Shape, srcQuality: number, fill: number): void {
    const gl = this.gl;
    gl.disable(gl.BLEND);
    gl.bindVertexArray(this.vao);
    gl.viewport(0, 0, this.simShape[0]!, this.simShape[1]!);
    const u = this.begin(this.passes.resample!, dst);
    this.bind(u.uSrc, UNIT_MAIN, src.tex);
    if (u.uSrcSim) gl.uniform2i(u.uSrcSim, srcSim[0]!, srcSim[1]!);
    if (u.uSrcQuality) gl.uniform1i(u.uSrcQuality, srcQuality);
    if (u.uFill) gl.uniform4f(u.uFill, fill, 0, 0, 0);
    this.draw();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  setTiles(layout: Layout, changes: DirtyTracker): void {
    if (this.layout !== layout || changes.count > FULL_UPLOAD_THRESHOLD) changes.markAll();
    this.layout = layout;
    if (changes.consumeAll()) {
      const gl = this.gl;
      const s = this.propsScratch;
      for (let i = 0; i < layout.types.length; i++) {
        tileProps(layout, i, s, 0);
        this.propsDataA.set(s.subarray(0, 4), i * 4);
        this.propsDataB.set(s.subarray(4, 8), i * 4);
      }
      const [tw, th] = this.tileShape as [number, number];
      gl.bindTexture(gl.TEXTURE_2D, this.propsA);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, tw, th, gl.RGBA, gl.FLOAT, this.propsDataA);
      gl.bindTexture(gl.TEXTURE_2D, this.propsB);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, tw, th, gl.RGBA, gl.FLOAT, this.propsDataB);
    } else {
      changes.drain(this.onDirty);
    }
  }

  private uploadTile(i: number): void {
    const gl = this.gl;
    const s = this.propsScratch;
    tileProps(this.layout!, i, s, 0);
    tileCoords(this.tileShape, i, this.coords);
    const x = this.coords[0]!;
    const y = this.coords[1]!;
    gl.bindTexture(gl.TEXTURE_2D, this.propsA);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, 1, 1, gl.RGBA, gl.FLOAT, s, 0);
    gl.bindTexture(gl.TEXTURE_2D, this.propsB);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, 1, 1, gl.RGBA, gl.FLOAT, s, 4);
  }

  setParams(params: SimParams): void {
    this.params.ambientC = params.ambientC;
    this.params.gravity = params.gravity;
    this.params.swirl = params.swirl;
  }

  private clear(t: Target, v: number): void {
    const gl = this.gl;
    this.clearColor[0] = v;
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
    gl.clearBufferfv(gl.COLOR, 0, this.clearColor);
  }

  reset(): void {
    const gl = this.gl;
    this.clear(this.temp.a, this.params.ambientC);
    this.clear(this.temp.b, this.params.ambientC);
    for (const t of [this.vel.a, this.vel.b, this.pressure.a, this.pressure.b, this.div, this.curl]) {
      this.clear(t, 0);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.time = 0;
    this.avgStale = true;
    this.readStale = true;
  }

  // --- pass plumbing (no allocation) ---

  /** Bind `pass` to write into `dst`, with the shared uniforms and property textures. */
  private begin(pass: Pass, dst: Target): Uniforms {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
    gl.useProgram(pass.program);
    const u = pass.u;
    if (u.uSim) gl.uniform2i(u.uSim, this.simShape[0]!, this.simShape[1]!);
    if (u.uQuality) gl.uniform1i(u.uQuality, this.quality);
    if (u.uPropsA) this.bind(u.uPropsA, UNIT_PROPS_A, this.propsA);
    if (u.uPropsB) this.bind(u.uPropsB, UNIT_PROPS_B, this.propsB);
    return u;
  }

  private bind(loc: WebGLUniformLocation | undefined, unit: number, tex: WebGLTexture): void {
    if (!loc) return;
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(loc, unit);
  }

  private f(loc: WebGLUniformLocation | undefined, v: number): void {
    if (loc) this.gl.uniform1f(loc, v);
  }

  private draw(): void {
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
  }

  step(dt: number): void {
    const gl = this.gl;
    const P = this.passes;
    const amb = this.params.ambientC;
    const q = this.quality;
    gl.disable(gl.BLEND);
    gl.bindVertexArray(this.vao);
    gl.viewport(0, 0, this.simShape[0]!, this.simShape[1]!);

    // 1. Sources: heaters (temperature), then fans and buoyancy (velocity).
    let u = this.begin(P.heatSource!, this.temp.b);
    this.bind(u.uTemp, UNIT_MAIN, this.temp.a.tex);
    this.f(u.uDt, dt);
    this.f(u.uPower, HEATER_POWER);
    this.f(u.uAmbient, amb);
    this.f(u.uTMin, T_MIN);
    this.f(u.uTMax, T_MAX);
    this.draw();
    this.temp.swap();

    u = this.begin(P.velSource!, this.vel.b);
    this.bind(u.uVel, UNIT_MAIN, this.vel.a.tex);
    this.bind(u.uTemp, UNIT_AUX, this.temp.a.tex);
    this.f(u.uDt, dt);
    this.f(u.uFanK, 1 - Math.exp(-FAN_RESPONSE * dt));
    this.f(u.uGravity, this.params.gravity ? 1 : 0);
    this.f(u.uBuoyancy, BUOYANCY);
    this.f(u.uAmbient, amb);
    this.f(u.uSweepPhase, sweepPhase(this.time));
    this.f(u.uSweepHalf, SWEEP_HALF_ANGLE);
    this.draw();
    this.vel.swap();

    // 2. Advect temperature, then velocity, both along the current velocity.
    u = this.begin(P.advectTemp!, this.temp.b);
    this.bind(u.uTemp, UNIT_MAIN, this.temp.a.tex);
    this.bind(u.uVel, UNIT_AUX, this.vel.a.tex);
    this.f(u.uDt, dt);
    this.f(u.uAmbient, amb);
    this.f(u.uTMin, T_MIN);
    this.f(u.uTMax, T_MAX);
    this.draw();
    this.temp.swap();

    u = this.begin(P.advectVel!, this.vel.b);
    this.bind(u.uVel, UNIT_MAIN, this.vel.a.tex);
    this.f(u.uDt, dt);
    this.draw();
    this.vel.swap();

    // 3. Diffuse temperature (explicit substeps).
    const n = diffusionSubsteps(dt, q);
    for (let s = 0; s < n; s++) {
      u = this.begin(P.diffuse!, this.temp.b);
      this.bind(u.uTemp, UNIT_MAIN, this.temp.a.tex);
      this.f(u.uDt, dt / n);
      this.f(u.uInvH2, q * q);
      this.f(u.uAmbient, amb);
      this.f(u.uKOutside, K_OUTSIDE);
      this.f(u.uTMin, T_MIN);
      this.f(u.uTMax, T_MAX);
      this.draw();
      this.temp.swap();
    }

    // 4. Vorticity confinement.
    if (this.params.swirl > 0) {
      u = this.begin(P.curl!, this.curl);
      this.bind(u.uVel, UNIT_MAIN, this.vel.a.tex);
      this.draw();

      u = this.begin(P.vorticity!, this.vel.b);
      this.bind(u.uVel, UNIT_MAIN, this.vel.a.tex);
      this.bind(u.uCurl, UNIT_AUX, this.curl.tex);
      this.f(u.uDt, dt);
      this.f(u.uEps, (VORTICITY_STRENGTH * this.params.swirl) / q);
      this.draw();
      this.vel.swap();
    }

    // 5. Project: divergence, Jacobi pressure (warm-started from last step), subtract gradient.
    u = this.begin(P.divergence!, this.div);
    this.bind(u.uVel, UNIT_MAIN, this.vel.a.tex);
    this.draw();

    for (let k = 0; k < PRESSURE_ITERATIONS; k++) {
      u = this.begin(P.pressure!, this.pressure.b);
      this.bind(u.uPressure, UNIT_MAIN, this.pressure.a.tex);
      this.bind(u.uDiv, UNIT_AUX, this.div.tex);
      this.f(u.uH2, 1 / (q * q));
      this.draw();
      this.pressure.swap();
    }

    // 6-7. Boundaries (solids zeroed) and sanitize happen in the project pass.
    u = this.begin(P.project!, this.vel.b);
    this.bind(u.uVel, UNIT_MAIN, this.vel.a.tex);
    this.bind(u.uPressure, UNIT_AUX, this.pressure.a.tex);
    this.f(u.uVMax, V_MAX);
    this.draw();
    this.vel.swap();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.time = (this.time + dt) % SWEEP_PERIOD;
    this.avgStale = true;
    this.readStale = true;
  }

  private refreshAverages(): void {
    if (!this.avgStale) return;
    const gl = this.gl;
    gl.bindVertexArray(this.vao);
    gl.viewport(0, 0, this.tileShape[0]!, this.tileShape[1]!);
    const u = this.begin(this.passes.tileAverage!, this.avg);
    this.bind(u.uTemp, UNIT_MAIN, this.temp.a.tex);
    this.bind(u.uVel, UNIT_AUX, this.vel.a.tex);
    this.draw();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.avgStale = false;
  }

  /** Reads tile averages back. Only stalls the GPU when the field changed since the last read. */
  readField(field: FieldName, out: Float32Array): void {
    if (this.readStale) {
      const gl = this.gl;
      this.refreshAverages();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.avg.fbo);
      gl.readPixels(0, 0, this.tileShape[0]!, this.tileShape[1]!, gl.RGBA, gl.FLOAT, this.readBuf);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.readStale = false;
    }
    // Texture rows are tile rows, so texel order is tile index order.
    const n = this.readBuf.length / 4;
    if (field === "temperature") {
      for (let i = 0; i < n && i < out.length; i++) out[i] = this.readBuf[i * 4]!;
    } else {
      for (let i = 0; i < n && i * 2 + 1 < out.length; i++) {
        out[i * 2] = this.readBuf[i * 4 + 1]!;
        out[i * 2 + 1] = this.readBuf[i * 4 + 2]!;
      }
    }
  }

  dispose(): void {
    const gl = this.gl;
    if (this.fields) this.freeFields(this.fields);
    this.fields = null;
    gl.deleteTexture(this.propsA);
    gl.deleteTexture(this.propsB);
    gl.deleteVertexArray(this.vao);
    for (const p of Object.values(this.passes)) gl.deleteProgram(p.program);
  }
}
