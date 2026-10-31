import { signal } from "@preact/signals";
import { DEFAULT_SHAPE, MAX_DIM, MIN_DIM, type Shape, inBounds, tileIndex } from "../model/grid";
import { Layout } from "../model/layout";
import {
  type FanSettings,
  type HeaterSettings,
  TileType,
  type WindowSettings,
} from "../model/tiles";
import { createView, fitView } from "../render/view";

export const layout = new Layout(DEFAULT_SHAPE);
export const view = createView();
/** Canvas size in CSS px, kept current by App. */
export const viewport = { w: 0, h: 0 };

export const tool = signal<"pointer" | "brush">("pointer");
/** What plain scroll does: pan (trackpad) or zoom (mouse wheel). */
export const scrollMode = signal<"pan" | "zoom">("pan");
export const activeType = signal(TileType.Wall);
export const showGrid = signal(true);
export const ambientC = signal(20);
export const gridShape = signal<Shape>(layout.shape);
/** Selected tile index, or null. */
export const selected = signal<number | null>(null);
/** Bumped on every layout change so the panel re-reads tile settings. */
export const layoutRev = signal(0);
/** Hovered tile coords, or -1. Plain object: read by the render loop only. */
export const hover: [number, number] = [-1, -1];

let renderPending = true;
export function requestRender(): void {
  renderPending = true;
}
export function consumeRender(): boolean {
  const r = renderPending;
  renderPending = false;
  return r;
}

export function fit(): void {
  fitView(view, layout.shape, viewport.w, viewport.h);
  requestRender();
}

// --- Layout edits ---
// Every layout/settings edit funnels through these functions. Milestone 2 wraps
// them in history commands so undo covers them.

function changed(): void {
  layoutRev.value++;
  requestRender();
}

export function paintTile(x: number, y: number, type: TileType): void {
  if (!inBounds(layout.shape, x, y)) return;
  const i = tileIndex(layout.shape, x, y);
  if (!layout.setTile(i, type)) return;
  if (selected.value === i) selected.value = null;
  changed();
}

export function selectTile(x: number, y: number): void {
  if (!inBounds(layout.shape, x, y)) {
    selected.value = null;
    return;
  }
  const i = tileIndex(layout.shape, x, y);
  const t = layout.typeAt(i);
  selected.value =
    t === TileType.Fan || t === TileType.Heater || t === TileType.Window ? i : null;
}

export function resizeGrid(w: number, h: number): void {
  const clamp = (v: number) => Math.min(MAX_DIM, Math.max(MIN_DIM, Math.round(v) || MIN_DIM));
  layout.resize([clamp(w), clamp(h)]);
  gridShape.value = layout.shape;
  selected.value = null;
  fit();
  changed();
}

export function updateFan(i: number, patch: Partial<FanSettings>): void {
  if (layout.updateFan(i, patch)) changed();
}
export function updateHeater(i: number, patch: Partial<HeaterSettings>): void {
  if (layout.updateHeater(i, patch)) changed();
}
export function updateWindow(i: number, patch: Partial<WindowSettings>): void {
  if (layout.updateWindow(i, patch)) changed();
}
