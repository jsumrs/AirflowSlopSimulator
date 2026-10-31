import { type Shape, inBounds, tileCoords, tileIndex } from "../model/grid";
import type { Layout, TileSnapshot } from "../model/layout";
import { rotateDir } from "../model/tiles";

/**
 * A rectangular piece of layout, used for copy/paste, move and rotate.
 * Editing tools are 2D, so this lives with the input layer. A `null` cell is a hole
 * (not part of the selection) and leaves the tile underneath alone.
 */
export interface Stamp {
  w: number;
  h: number;
  cells: (TileSnapshot | null)[];
}

const cellIndex = (s: { w: number; h: number }, x: number, y: number) => tileIndex([s.w, s.h], x, y);

/** Copy the given tiles. Returns the stamp and its top-left tile, or null if empty. */
export function captureStamp(
  layout: Layout,
  indices: Iterable<number>,
): { stamp: Stamp; x: number; y: number } | null {
  const c = [0, 0, 0];
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const i of indices) {
    tileCoords(layout.shape, i, c);
    x0 = Math.min(x0, c[0]!);
    y0 = Math.min(y0, c[1]!);
    x1 = Math.max(x1, c[0]!);
    y1 = Math.max(y1, c[1]!);
  }
  if (x0 > x1) return null;
  const stamp: Stamp = { w: x1 - x0 + 1, h: y1 - y0 + 1, cells: [] };
  stamp.cells = new Array(stamp.w * stamp.h).fill(null);
  for (const i of indices) {
    tileCoords(layout.shape, i, c);
    stamp.cells[cellIndex(stamp, c[0]! - x0, c[1]! - y0)] = layout.tileSnapshot(i);
  }
  return { stamp, x: x0, y: y0 };
}

function mapCells(
  src: Stamp,
  w: number,
  h: number,
  where: (x: number, y: number) => [number, number],
  tile: (t: TileSnapshot) => TileSnapshot,
): Stamp {
  const out: Stamp = { w, h, cells: new Array(w * h).fill(null) };
  for (let y = 0; y < src.h; y++)
    for (let x = 0; x < src.w; x++) {
      const t = src.cells[cellIndex(src, x, y)];
      if (!t) continue;
      const [nx, ny] = where(x, y);
      out.cells[cellIndex(out, nx, ny)] = tile(t);
    }
  return out;
}

function withFan(t: TileSnapshot, f: (d: NonNullable<TileSnapshot["fan"]>["dir"]) => NonNullable<TileSnapshot["fan"]>["dir"]): TileSnapshot {
  return t.fan ? { ...t, fan: { ...t.fan, dir: f(t.fan.dir) } } : t;
}

/** Rotate 90 degrees. Fan directions turn with the tiles. */
export function rotateStamp(s: Stamp, clockwise: boolean): Stamp {
  return mapCells(
    s,
    s.h,
    s.w,
    (x, y) => (clockwise ? [s.h - 1 - y, x] : [y, s.w - 1 - x]),
    (t) => withFan(t, (d) => rotateDir(d, clockwise)),
  );
}

/** Visit each stamp cell that has a tile and lands inside the grid, with its grid index. */
export function forEachStampTile(
  shape: Shape,
  s: Stamp,
  ox: number,
  oy: number,
  cb: (index: number, tile: TileSnapshot) => void,
): void {
  for (let y = 0; y < s.h; y++)
    for (let x = 0; x < s.w; x++) {
      const t = s.cells[cellIndex(s, x, y)];
      if (t && inBounds(shape, ox + x, oy + y)) cb(tileIndex(shape, ox + x, oy + y), t);
    }
}

/** Tile indices of a filled rectangle (corners in any order, clipped to the grid). */
export function rectIndices(shape: Shape, ax: number, ay: number, bx: number, by: number): number[] {
  const x0 = Math.max(0, Math.min(ax, bx));
  const x1 = Math.min(shape[0]! - 1, Math.max(ax, bx));
  const y0 = Math.max(0, Math.min(ay, by));
  const y1 = Math.min(shape[1]! - 1, Math.max(ay, by));
  const out: number[] = [];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) out.push(tileIndex(shape, x, y));
  return out;
}
