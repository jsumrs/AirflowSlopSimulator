import type { Shape } from "../model/grid";

/** Pan/zoom state. `x`,`y` is the grid's top-left in CSS px; `scale` is CSS px per tile. */
export interface View {
  x: number;
  y: number;
  scale: number;
  /** True while the view is exactly the fit view, so viewport resizes can re-fit. */
  fitted: boolean;
}

export const MAX_SCALE = 64;
export const FIT_MARGIN = 16;
/** Minimum number of CSS px of the grid that must stay on screen when panning. */
const KEEP_VISIBLE = 48;

export function createView(): View {
  return { x: 0, y: 0, scale: 10, fitted: true };
}

export function fitScale(shape: Shape, vw: number, vh: number): number {
  const s = Math.min(
    (vw - 2 * FIT_MARGIN) / shape[0]!,
    (vh - 2 * FIT_MARGIN) / shape[1]!,
  );
  return Math.min(MAX_SCALE, Math.max(0.5, s));
}

export function fitView(view: View, shape: Shape, vw: number, vh: number): void {
  const s = fitScale(shape, vw, vh);
  view.scale = s;
  view.x = (vw - shape[0]! * s) / 2;
  view.y = (vh - shape[1]! * s) / 2;
  view.fitted = true;
}

export function clampView(view: View, shape: Shape, vw: number, vh: number): void {
  const gw = shape[0]! * view.scale;
  const gh = shape[1]! * view.scale;
  const kx = Math.min(KEEP_VISIBLE, gw);
  const ky = Math.min(KEEP_VISIBLE, gh);
  view.x = Math.min(vw - kx, Math.max(kx - gw, view.x));
  view.y = Math.min(vh - ky, Math.max(ky - gh, view.y));
}

/** Zoom by `factor`, keeping the point under (cx, cy) fixed. Limits: fit .. MAX_SCALE. */
export function zoomAt(
  view: View,
  shape: Shape,
  vw: number,
  vh: number,
  cx: number,
  cy: number,
  factor: number,
): void {
  const next = Math.min(MAX_SCALE, Math.max(fitScale(shape, vw, vh), view.scale * factor));
  const k = next / view.scale;
  view.x = cx - (cx - view.x) * k;
  view.y = cy - (cy - view.y) * k;
  view.scale = next;
  view.fitted = false;
  clampView(view, shape, vw, vh);
}

export function panBy(
  view: View,
  shape: Shape,
  vw: number,
  vh: number,
  dx: number,
  dy: number,
): void {
  view.x += dx;
  view.y += dy;
  view.fitted = false;
  clampView(view, shape, vw, vh);
}

/** Fractional tile coordinates under a viewport point. Writes `[tx, ty]` into `out`. */
export function screenToTile(view: View, sx: number, sy: number, out: number[]): number[] {
  out[0] = (sx - view.x) / view.scale;
  out[1] = (sy - view.y) / view.scale;
  return out;
}
