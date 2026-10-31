import { type Shape, sameShape, tileCount } from "../model/grid";
import {
  type FloatTarget,
  createFloatTarget,
  createProgram,
  deleteFloatTarget,
  resolveIncludes,
  uniformsOf,
} from "./gl";
import FIELD from "./shaders/field.glsl?raw";
import FULLSCREEN_VERT from "./shaders/fullscreen.vert.glsl?raw";
import PARTICLE_UPDATE from "./shaders/particleUpdate.frag.glsl?raw";
import POLYLINE from "./shaders/polyline.glsl?raw";
import POLYLINE_FRAG from "./shaders/polyline.frag.glsl?raw";
import POLYLINE_VERT from "./shaders/polyline.vert.glsl?raw";
import RANDOM from "./shaders/random.glsl?raw";
import STREAM_TRACE from "./shaders/streamTrace.frag.glsl?raw";
import type { View } from "./view";

const CHUNKS = { field: FIELD, random: RANDOM, polyline: POLYLINE };

/** What the flow overlays read: the solver's velocity field and the tile data. */
export interface FlowInputs {
  /** RG32F, sim resolution, tiles/s, y down. */
  velocity: WebGLTexture;
  simShape: Shape;
  quality: number;
  /** RGBA8UI tile data (tileTexture.ts). */
  tiles: WebGLTexture;
  tileShape: Shape;
}

export interface Placement {
  view: View;
  dpr: number;
}

type Uniforms = Record<string, WebGLUniformLocation>;

const UNIT_STATE = 0;
const UNIT_VEL = 1;
const UNIT_TILES = 2;

/** Lines are packed side by side in rows of at most this many texels. */
const MAX_ROW_TEXELS = 1024;

/** Polylines stored in a float texture: point k of line i at ((i % perRow) * len + k, i / perRow). */
interface LineStore {
  count: number;
  len: number;
  perRow: number;
  w: number;
  h: number;
}

function lineStore(count: number, len: number): LineStore {
  const perRow = Math.max(1, Math.floor(MAX_ROW_TEXELS / len));
  return { count, len, perRow, w: perRow * len, h: Math.ceil(count / perRow) };
}

function bindTexture(gl: WebGL2RenderingContext, loc: WebGLUniformLocation | undefined, unit: number, tex: WebGLTexture) {
  gl.activeTexture(gl.TEXTURE0 + unit);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  if (loc) gl.uniform1i(loc, unit);
}

function bindField(gl: WebGL2RenderingContext, u: Uniforms, f: FlowInputs): void {
  bindTexture(gl, u.uVel, UNIT_VEL, f.velocity);
  bindTexture(gl, u.uTiles, UNIT_TILES, f.tiles);
  gl.uniform2i(u.uSim!, f.simShape[0]!, f.simShape[1]!);
  gl.uniform1i(u.uQuality!, f.quality);
  gl.uniform2i(u.uGrid!, f.tileShape[0]!, f.tileShape[1]!);
}

/** Run a fullscreen fragment pass into `dst`. */
function runPass(gl: WebGL2RenderingContext, vao: WebGLVertexArrayObject, dst: FloatTarget): void {
  gl.disable(gl.BLEND);
  gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
  gl.viewport(0, 0, dst.w, dst.h);
  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

enum LineKind {
  ParticleTrail = 0,
  Streamline = 1,
  ParticleHead = 2,
}

/** Draws a LineStore onto the canvas with premultiplied alpha. No vertex buffers. */
class PolylineRenderer {
  private program: WebGLProgram;
  private u: Uniforms;

  constructor(
    private gl: WebGL2RenderingContext,
    private vao: WebGLVertexArrayObject,
  ) {
    this.program = createProgram(gl, resolveIncludes(POLYLINE_VERT, CHUNKS), POLYLINE_FRAG);
    this.u = uniformsOf(gl, this.program);
  }

  draw(
    store: LineStore,
    state: WebGLTexture,
    kind: LineKind,
    color: Float32Array,
    widthPx: number,
    p: Placement,
    fullSpeed = 1,
  ): void {
    const gl = this.gl;
    const u = this.u;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    bindTexture(gl, u.uState, UNIT_STATE, state);
    gl.uniform1i(u.uKind!, kind);
    gl.uniform1i(u.uLen!, store.len);
    gl.uniform1i(u.uPerRow!, store.perRow);
    gl.uniform2f(u.uRes!, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform2f(u.uOrigin!, p.view.x * p.dpr, p.view.y * p.dpr);
    gl.uniform1f(u.uScale!, p.view.scale * p.dpr);
    gl.uniform1f(u.uWidth!, widthPx);
    if (u.uFullSpeed) gl.uniform1f(u.uFullSpeed, fullSpeed);
    gl.uniform4fv(u.uColor!, color);
    if (kind === LineKind.ParticleHead) gl.drawArrays(gl.POINTS, 0, store.count);
    else gl.drawArrays(gl.TRIANGLES, 0, store.count * (store.len - 1) * 6);
    gl.disable(gl.BLEND);
  }

  dispose(): void {
    this.gl.deleteProgram(this.program);
  }
}

/** Points per particle trail (the head plus its recent positions, one per update). */
export const TRAIL_POINTS = 12;
const PARTICLES_PER_TILE = 3;
const MIN_PARTICLES = 512;
const MAX_PARTICLES = 8192;

/**
 * Particle overlay: dots that drift with the air, with short fading trails, and
 * respawn at random open spots when they die, leave the grid, or hit a wall.
 * Runs at full sim resolution on the GPU.
 */
export class Particles {
  private vao: WebGLVertexArrayObject;
  private program: WebGLProgram;
  private u: Uniforms;
  private lines: PolylineRenderer;
  private store: LineStore = lineStore(0, TRAIL_POINTS);
  private a: FloatTarget | null = null;
  private b: FloatTarget | null = null;
  private shape: Shape = [0, 0];
  private trailColor = new Float32Array([0.08, 0.09, 0.11, 0.55]);
  private headColor = new Float32Array([0.08, 0.09, 0.11, 0.85]);
  /** Every particle is hidden and waiting for its first spawn. */
  needsSpawn = true;

  constructor(private gl: WebGL2RenderingContext) {
    this.vao = gl.createVertexArray()!;
    this.program = createProgram(gl, FULLSCREEN_VERT, resolveIncludes(PARTICLE_UPDATE, CHUNKS));
    this.u = uniformsOf(gl, this.program);
    this.lines = new PolylineRenderer(gl, this.vao);
  }

  private resize(shape: Shape): void {
    if (this.a && sameShape(this.shape, shape)) return;
    this.free();
    this.shape = [...shape];
    const n = Math.round(tileCount(shape) * PARTICLES_PER_TILE);
    this.store = lineStore(Math.min(MAX_PARTICLES, Math.max(MIN_PARTICLES, n)), TRAIL_POINTS);
    const { w, h } = this.store;
    const init = new Float32Array(w * h * 4);
    for (let i = 2; i < init.length; i += 4) init[i] = -1; // hidden until spawned
    this.a = createFloatTarget(this.gl, w, h, init);
    this.b = createFloatTarget(this.gl, w, h);
    this.needsSpawn = true;
  }

  /** Move every particle `dt` sim seconds along the air (dt 0 just spawns them). */
  step(dt: number, f: FlowInputs): void {
    const gl = this.gl;
    const u = this.u;
    this.resize(f.tileShape);
    gl.useProgram(this.program);
    bindTexture(gl, u.uState, UNIT_STATE, this.a!.tex);
    bindField(gl, u, f);
    gl.uniform1i(u.uLen!, this.store.len);
    gl.uniform1i(u.uPerRow!, this.store.perRow);
    gl.uniform1f(u.uDt!, dt);
    runPass(gl, this.vao, this.b!);
    const t = this.a;
    this.a = this.b;
    this.b = t;
    this.needsSpawn = false;
  }

  draw(p: Placement): void {
    if (!this.a) return;
    const width = Math.min(3, Math.max(1.25, p.view.scale * 0.05)) * p.dpr;
    this.lines.draw(this.store, this.a.tex, LineKind.ParticleTrail, this.trailColor, width, p);
    this.lines.draw(this.store, this.a.tex, LineKind.ParticleHead, this.headColor, width, p);
  }

  private free(): void {
    if (this.a) deleteFloatTarget(this.gl, this.a);
    if (this.b) deleteFloatTarget(this.gl, this.b);
    this.a = this.b = null;
  }

  dispose(): void {
    this.free();
    this.lines.dispose();
    this.gl.deleteProgram(this.program);
    this.gl.deleteVertexArray(this.vao);
  }
}

/** Streamline trace step, tiles. */
const STREAM_STEP = 0.25;
/** Aim for about this many seeds across the longer grid side. */
const STREAM_SEEDS_ACROSS = 40;
/** Air speed (tiles/s) drawn at full strength. */
const STREAM_FULL_SPEED = 3;

/**
 * Streamline overlay: curves traced through the velocity field from a fixed,
 * jittered grid of seeds. Re-traced on demand (every few frames while the air moves).
 */
export class Streamlines {
  private vao: WebGLVertexArrayObject;
  private program: WebGLProgram;
  private u: Uniforms;
  private lines: PolylineRenderer;
  private store: LineStore = lineStore(0, 1);
  private target: FloatTarget | null = null;
  private shape: Shape = [0, 0];
  private spacing = 2;
  private seedCols = 1;
  private half = 1;
  private color = new Float32Array([0.1, 0.12, 0.16, 0.6]);
  /** At least one trace has run since the last resize. */
  traced = false;

  constructor(private gl: WebGL2RenderingContext) {
    this.vao = gl.createVertexArray()!;
    this.program = createProgram(gl, FULLSCREEN_VERT, resolveIncludes(STREAM_TRACE, CHUNKS));
    this.u = uniformsOf(gl, this.program);
    this.lines = new PolylineRenderer(gl, this.vao);
  }

  private resize(shape: Shape): void {
    if (this.target && sameShape(this.shape, shape)) return;
    if (this.target) deleteFloatTarget(this.gl, this.target);
    this.shape = [...shape];
    const [w, h] = shape as [number, number];
    this.spacing = Math.max(2, Math.ceil(Math.max(w, h) / STREAM_SEEDS_ACROSS));
    this.seedCols = Math.ceil(w / this.spacing);
    const seeds = this.seedCols * Math.ceil(h / this.spacing);
    // Each line runs about 2 x spacing tiles each way from its seed.
    this.half = Math.round((2 * this.spacing) / STREAM_STEP);
    this.store = lineStore(seeds, 2 * this.half + 1);
    this.target = createFloatTarget(this.gl, this.store.w, this.store.h);
    this.traced = false;
  }

  trace(f: FlowInputs): void {
    const gl = this.gl;
    const u = this.u;
    this.resize(f.tileShape);
    gl.useProgram(this.program);
    bindField(gl, u, f);
    gl.uniform1i(u.uLen!, this.store.len);
    gl.uniform1i(u.uPerRow!, this.store.perRow);
    gl.uniform1i(u.uHalf!, this.half);
    gl.uniform1i(u.uSeedCols!, this.seedCols);
    gl.uniform1f(u.uSpacing!, this.spacing);
    gl.uniform1f(u.uStep!, STREAM_STEP);
    runPass(gl, this.vao, this.target!);
    this.traced = true;
  }

  draw(p: Placement): void {
    if (!this.target || !this.traced) return;
    const width = Math.min(2, Math.max(1, p.view.scale * 0.035)) * p.dpr;
    this.lines.draw(this.store, this.target.tex, LineKind.Streamline, this.color, width, p, STREAM_FULL_SPEED);
  }

  dispose(): void {
    if (this.target) deleteFloatTarget(this.gl, this.target);
    this.lines.dispose();
    this.gl.deleteProgram(this.program);
    this.gl.deleteVertexArray(this.vao);
  }
}
