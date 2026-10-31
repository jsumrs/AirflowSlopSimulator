import { type Shape, sameShape, tileCoords, tileCount } from "../model/grid";
import type { DirtyTracker } from "../model/dirty";
import type { Layout } from "../model/layout";
import { DIR_VECTORS } from "../model/tiles";
import { SWEEP_HALF_ANGLE, sweepPhase } from "../sim/params";
import { createProgram } from "./gl";
import VERT from "./shaders/fullscreen.vert.glsl?raw";
import FRAG from "./shaders/tile.frag.glsl?raw";
import { packTile } from "./tileTexture";
import type { View } from "./view";

export interface DrawOptions {
  view: View;
  dpr: number;
  showGrid: boolean;
  ambientC: number;
  /** Sim seconds (wrapped), for the oscillating fan arrow and the heater pulse. */
  simTime: number;
  heat: {
    /** R32F temperature texture at sim resolution. */
    texture: WebGLTexture;
    simShape: Shape;
    quality: number;
    on: boolean;
    /** Heat scale range in C. */
    lo: number;
    hi: number;
  };
  flow: {
    /** RGBA32F per-tile means: g/b = velocity in tiles/s. */
    texture: WebGLTexture;
    arrows: boolean;
  };
  /** Selected / hovered tile coords, or -1 for none. */
  selected: readonly [number, number];
  hover: readonly [number, number];
}

/** Air speed (tiles/s) drawn as a full-length arrow. */
const ARROW_FULL_SPEED = 6;

/** Above this many changed tiles, re-upload the whole texture instead. */
const FULL_UPLOAD_THRESHOLD = 512;

/** Base fill (air or heat map), drawn under the particle and streamline overlays. */
export const LAYER_BASE = 0;
/** Glyphs, arrows, hover, grid lines and selection, drawn over everything else. */
export const LAYER_GLYPHS = 1;

/** Draws the tile grid (fills, glyphs, grid lines) from a tile-data texture. */
export class TileRenderer {
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private texture: WebGLTexture;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private shape: Shape = [0, 0];
  private data = new Uint8Array(0);
  private scratch = new Uint8Array(4);
  private coords: number[] = [0, 0, 0];
  private dirs = new Float32Array(16);
  private layout: Layout | null = null;
  private tracker: DirtyTracker | null = null;
  private onDirty = (i: number) => this.uploadOne(i);

  constructor(private gl: WebGL2RenderingContext) {
    this.program = createProgram(gl, VERT, FRAG);
    this.vao = gl.createVertexArray()!;
    this.texture = gl.createTexture()!;
    for (const name of [
      "uTiles", "uRes", "uOrigin", "uScale", "uDpr", "uGrid", "uGridLines",
      "uAmbient", "uSelected", "uHover", "uDirs",
      "uTemp", "uSim", "uQuality", "uHeatOn", "uLo", "uHi",
      "uTileAvg", "uArrows", "uArrowFull",
      "uLayer", "uSimTime", "uSweepPhase", "uSweepHalf",
    ]) {
      this.u[name] = gl.getUniformLocation(this.program, name);
    }
    DIR_VECTORS.forEach(([x, y], i) => {
      const len = Math.hypot(x, y);
      this.dirs[i * 2] = x / len;
      this.dirs[i * 2 + 1] = y / len;
    });
  }

  /** RGBA8UI tile data (tileTexture.ts), also read by the flow overlays. */
  get tiles(): WebGLTexture {
    return this.texture;
  }

  /** Upload changed tiles (or everything after a resize). */
  sync(layout: Layout): void {
    const gl = this.gl;
    if (this.layout !== layout) {
      this.layout = layout;
      this.tracker = layout.track();
    }
    const tracker = this.tracker!;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    if (!sameShape(this.shape, layout.shape)) {
      this.shape = layout.shape;
      this.data = new Uint8Array(tileCount(layout.shape) * 4);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA8UI, layout.shape[0]!, layout.shape[1]!, 0,
        gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, this.data,
      );
      tracker.markAll();
    }
    if (tracker.count > FULL_UPLOAD_THRESHOLD) tracker.markAll();
    if (tracker.consumeAll()) {
      for (let i = 0; i < layout.types.length; i++) packTile(layout, i, this.data, i * 4);
      gl.texSubImage2D(
        gl.TEXTURE_2D, 0, 0, 0, layout.shape[0]!, layout.shape[1]!,
        gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, this.data,
      );
    } else {
      tracker.drain(this.onDirty);
    }
  }

  private uploadOne(i: number): void {
    const gl = this.gl;
    const layout = this.layout!;
    packTile(layout, i, this.data, i * 4);
    tileCoords(layout.shape, i, this.coords);
    this.scratch.set(this.data.subarray(i * 4, i * 4 + 4));
    gl.texSubImage2D(
      gl.TEXTURE_2D, 0, this.coords[0]!, this.coords[1]!, 1, 1,
      gl.RGBA_INTEGER, gl.UNSIGNED_BYTE, this.scratch,
    );
  }

  /** Draw one layer. The base layer is opaque; the glyph layer blends over it. */
  draw(o: DrawOptions, layer: typeof LAYER_BASE | typeof LAYER_GLYPHS): void {
    const gl = this.gl;
    const { u } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    if (layer === LAYER_GLYPHS) {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    } else {
      gl.disable(gl.BLEND);
    }
    gl.useProgram(this.program);
    gl.uniform1i(u.uLayer!, layer);
    gl.uniform1f(u.uSimTime!, o.simTime);
    gl.uniform1f(u.uSweepPhase!, sweepPhase(o.simTime));
    gl.uniform1f(u.uSweepHalf!, SWEEP_HALF_ANGLE);
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(u.uTiles!, 0);
    gl.uniform2f(u.uRes!, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform2f(u.uOrigin!, o.view.x * o.dpr, o.view.y * o.dpr);
    gl.uniform1f(u.uScale!, o.view.scale * o.dpr);
    gl.uniform1f(u.uDpr!, o.dpr);
    gl.uniform2i(u.uGrid!, this.shape[0]!, this.shape[1]!);
    gl.uniform1f(u.uGridLines!, o.showGrid ? 1 : 0);
    gl.uniform1f(u.uAmbient!, o.ambientC);
    gl.uniform2i(u.uSelected!, o.selected[0], o.selected[1]);
    gl.uniform2i(u.uHover!, o.hover[0], o.hover[1]);
    gl.uniform2fv(u.uDirs!, this.dirs);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, o.heat.texture);
    gl.uniform1i(u.uTemp!, 1);
    gl.uniform2i(u.uSim!, o.heat.simShape[0]!, o.heat.simShape[1]!);
    gl.uniform1i(u.uQuality!, o.heat.quality);
    gl.uniform1f(u.uHeatOn!, o.heat.on ? 1 : 0);
    gl.uniform1f(u.uLo!, o.heat.lo);
    gl.uniform1f(u.uHi!, o.heat.hi);
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, o.flow.texture);
    gl.uniform1i(u.uTileAvg!, 2);
    gl.uniform1f(u.uArrows!, o.flow.arrows ? 1 : 0);
    gl.uniform1f(u.uArrowFull!, ARROW_FULL_SPEED);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disable(gl.BLEND);
  }
}
