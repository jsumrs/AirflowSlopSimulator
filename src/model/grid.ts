/** Grid shape: `[w, h]` now, `[w, h, d]` later. */
export type Shape = readonly number[];

export const MIN_DIM = 1;
export const MAX_DIM = 100;
export const DEFAULT_SHAPE: Shape = [15, 15];

export function tileCount(shape: Shape): number {
  let n = 1;
  for (const d of shape) n *= d;
  return n;
}

/** The one place tile indices are computed. `z` is 0 for 2D grids. */
export function tileIndex(shape: Shape, x: number, y: number, z = 0): number {
  return x + shape[0]! * (y + shape[1]! * z);
}

/** Inverse of `tileIndex`. Writes `[x, y, z]` into `out` and returns it. */
export function tileCoords(shape: Shape, index: number, out: number[]): number[] {
  const w = shape[0]!;
  const h = shape[1]!;
  const row = Math.floor(index / w);
  out[0] = index - row * w;
  out[1] = row % h;
  out[2] = Math.floor(row / h);
  return out;
}

export function inBounds(shape: Shape, x: number, y: number, z = 0): boolean {
  return (
    x >= 0 &&
    y >= 0 &&
    z >= 0 &&
    x < shape[0]! &&
    y < shape[1]! &&
    z < (shape[2] ?? 1)
  );
}

export function sameShape(a: Shape, b: Shape): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
