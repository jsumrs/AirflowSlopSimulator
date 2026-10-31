import type { DirtyTracker } from "../model/dirty";
import { type Shape, tileCoords, tileCount } from "../model/grid";
import type { Layout } from "../model/layout";
import { createProgram } from "../render/gl";
import VERT from "../render/shaders/fullscreen.vert.glsl?raw";
import {
  HEATER_POWER,
  K_OUTSIDE,
  T_MAX,
  T_MIN,
  diffusionSubsteps,
} from "./params";
import { PROPS_STRIDE, tileProps } from "./props";
import DIFFUSE from "./shaders/diffuse.frag.glsl?raw";
import HEAT_SOURCE from "./shaders/heatSource.frag.glsl?raw";
import TILE_AVERAGE from "./shaders/tileAverage.frag.glsl?raw";
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

interface Pass {
  program: WebGLProgram;
  u: Record<string, WebGLUniformLocation | null>;
}

const FULL_UPLOAD_THRESHOLD = 512;

/** WebGL2 solver: fragment-shader passes over float textures. Heat only for now. */
export class GlSolver implements Solver {
  tileShape: Shape = [0, 0];
  quality: SimQuality = 2;
  simShape: Shape = [0, 0];

  private vao: WebGLVertexArrayObject;
  private source: Pass;
  private diffuse: Pass;
  private average: Pass;
  private temp: [Target, Target] | null = null;
  private avg: Target | null = null;
  private props: WebGLTexture;
  private propsData = new Float32Array(0);
  private propsScratch = new Float32Array(PROPS_STRIDE);
  private coords = [0, 0, 0];
  private readBuf = new Float32Array(0);
  private ambientC = 20;
  private layout: Layout | null = null;
  private onDirty = (i: number) => this.uploadTile(i);

  constructor(
    private gl: WebGL2RenderingContext,
    tileShape: Shape,
    quality: SimQuality,
  ) {
    this.vao = gl.createVertexArray()!;
    this.source = this.pass(HEAT_SOURCE, [
      "uTemp", "uProps", "uQuality", "uDt", "uPower", "uAmbient", "uTMin", "uTMax",
    ]);
    this.diffuse = this.pass(DIFFUSE, [
      "uTemp", "uProps", "uSim", "uQuality", "uDt", "uInvH2", "uAmbient", "uKOutside", "uTMin", "uTMax",
    ]);
    this.average = this.pass(TILE_AVERAGE, ["uField", "uQuality"]);
    this.props = gl.createTexture()!;
    this.resize(tileShape, quality);
  }

  /** Current temperature texture (R32F, sim resolution) for the renderer. */
  get temperature(): WebGLTexture {
    return this.temp![0].tex;
  }

  private pass(frag: string, names: string[]): Pass {
    const program = createProgram(this.gl, VERT, frag);
    const u: Pass["u"] = {};
    for (const n of names) u[n] = this.gl.getUniformLocation(program, n);
    return { program, u };
  }

  private texture(w: number, h: number, internal: number, format: number): WebGLTexture {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.FLOAT, null);
    return tex;
  }

  private target(w: number, h: number, internal: number, format: number): Target {
    const gl = this.gl;
    const tex = this.texture(w, h, internal, format);
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

  private freeTarget(t: Target | null): void {
    if (!t) return;
    this.gl.deleteTexture(t.tex);
    this.gl.deleteFramebuffer(t.fbo);
  }

  resize(tileShape: Shape, quality: SimQuality): void {
    const gl = this.gl;
    this.tileShape = [...tileShape];
    this.quality = quality;
    this.simShape = simShapeFor(tileShape, quality);
    const [sw, sh] = this.simShape as [number, number];
    const [tw, th] = this.tileShape as [number, number];

    if (this.temp) {
      this.freeTarget(this.temp[0]);
      this.freeTarget(this.temp[1]);
    }
    this.freeTarget(this.avg);
    this.temp = [this.target(sw, sh, gl.R32F, gl.RED), this.target(sw, sh, gl.R32F, gl.RED)];
    this.avg = this.target(tw, th, gl.RGBA32F, gl.RGBA);
    this.readBuf = new Float32Array(tw * th * 4);

    this.propsData = new Float32Array(tileCount(tileShape) * PROPS_STRIDE);
    gl.bindTexture(gl.TEXTURE_2D, this.props);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, tw, th, 0, gl.RGBA, gl.FLOAT, this.propsData);
    this.layout = null; // force a full props upload on the next setTiles
    this.reset();
  }

  setTiles(layout: Layout, changes: DirtyTracker): void {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.props);
    if (this.layout !== layout || changes.count > FULL_UPLOAD_THRESHOLD) changes.markAll();
    this.layout = layout;
    if (changes.consumeAll()) {
      for (let i = 0; i < layout.types.length; i++) {
        tileProps(layout, i, this.propsData, i * PROPS_STRIDE);
      }
      gl.texSubImage2D(
        gl.TEXTURE_2D, 0, 0, 0, this.tileShape[0]!, this.tileShape[1]!,
        gl.RGBA, gl.FLOAT, this.propsData,
      );
    } else {
      changes.drain(this.onDirty);
    }
  }

  private uploadTile(i: number): void {
    const gl = this.gl;
    tileProps(this.layout!, i, this.propsScratch, 0);
    this.propsData.set(this.propsScratch, i * PROPS_STRIDE);
    tileCoords(this.tileShape, i, this.coords);
    gl.texSubImage2D(
      gl.TEXTURE_2D, 0, this.coords[0]!, this.coords[1]!, 1, 1,
      gl.RGBA, gl.FLOAT, this.propsScratch,
    );
  }

  setParams(params: SimParams): void {
    this.ambientC = params.ambientC;
  }

  reset(): void {
    const gl = this.gl;
    const clear = new Float32Array([this.ambientC, 0, 0, 1]);
    for (const t of this.temp!) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
      gl.clearBufferfv(gl.COLOR, 0, clear);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  /** Run `pass` reading temp[0] and writing temp[1], then swap. */
  private runTempPass(pass: Pass, set: (u: Pass["u"]) => void): void {
    const gl = this.gl;
    const [src, dst] = this.temp!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
    gl.useProgram(pass.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, src.tex);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.props);
    gl.uniform1i(pass.u.uTemp!, 0);
    gl.uniform1i(pass.u.uProps!, 1);
    set(pass.u);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.temp = [dst, src];
  }

  step(dt: number): void {
    const gl = this.gl;
    gl.disable(gl.BLEND);
    gl.bindVertexArray(this.vao);
    gl.viewport(0, 0, this.simShape[0]!, this.simShape[1]!);
    const q = this.quality;
    const amb = this.ambientC;

    this.runTempPass(this.source, (u) => {
      gl.uniform1i(u.uQuality!, q);
      gl.uniform1f(u.uDt!, dt);
      gl.uniform1f(u.uPower!, HEATER_POWER);
      gl.uniform1f(u.uAmbient!, amb);
      gl.uniform1f(u.uTMin!, T_MIN);
      gl.uniform1f(u.uTMax!, T_MAX);
    });

    const n = diffusionSubsteps(dt, q);
    for (let s = 0; s < n; s++) {
      this.runTempPass(this.diffuse, (u) => {
        gl.uniform2i(u.uSim!, this.simShape[0]!, this.simShape[1]!);
        gl.uniform1i(u.uQuality!, q);
        gl.uniform1f(u.uDt!, dt / n);
        gl.uniform1f(u.uInvH2!, q * q);
        gl.uniform1f(u.uAmbient!, amb);
        gl.uniform1f(u.uKOutside!, K_OUTSIDE);
        gl.uniform1f(u.uTMin!, T_MIN);
        gl.uniform1f(u.uTMax!, T_MAX);
      });
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  readField(_field: FieldName, out: Float32Array): void {
    const gl = this.gl;
    const [tw, th] = this.tileShape as [number, number];
    gl.bindVertexArray(this.vao);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.avg!.fbo);
    gl.viewport(0, 0, tw, th);
    gl.useProgram(this.average.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.temp![0].tex);
    gl.uniform1i(this.average.u.uField!, 0);
    gl.uniform1i(this.average.u.uQuality!, this.quality);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.readPixels(0, 0, tw, th, gl.RGBA, gl.FLOAT, this.readBuf);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // Texture rows are tile rows, so texel order is tile index order.
    const n = Math.min(out.length, tw * th);
    for (let i = 0; i < n; i++) out[i] = this.readBuf[i * 4]!;
  }

  dispose(): void {
    const gl = this.gl;
    if (this.temp) {
      this.freeTarget(this.temp[0]);
      this.freeTarget(this.temp[1]);
    }
    this.freeTarget(this.avg);
    gl.deleteTexture(this.props);
    gl.deleteVertexArray(this.vao);
    for (const p of [this.source, this.diffuse, this.average]) gl.deleteProgram(p.program);
  }
}
