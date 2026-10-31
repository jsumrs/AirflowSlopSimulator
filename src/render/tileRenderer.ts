import { type Shape, sameShape, tileCoords, tileCount } from "../model/grid";
import type { DirtyTracker } from "../model/dirty";
import type { Layout } from "../model/layout";
import { DIR_VECTORS } from "../model/tiles";
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
  /** Selected / hovered tile coords, or -1 for none. */
  selected: readonly [number, number];
  hover: readonly [number, number];
}

/** Above this many changed tiles, re-upload the whole texture instead. */
const FULL_UPLOAD_THRESHOLD = 512;

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
    ]) {
      this.u[name] = gl.getUniformLocation(this.program, name);
    }
    DIR_VECTORS.forEach(([x, y], i) => {
      const len = Math.hypot(x, y);
      this.dirs[i * 2] = x / len;
      this.dirs[i * 2 + 1] = y / len;
    });
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

  draw(o: DrawOptions): void {
    const gl = this.gl;
    const { u } = this;
    gl.useProgram(this.program);
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
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
