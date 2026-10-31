import { signal } from "@preact/signals";
import {
  ReplaceSceneCommand,
  SettingsCommand,
  TileEditCommand,
  type TileChange,
} from "../history/commands";
import { History } from "../history/history";
import { Autosave, loadAutosave } from "../io/autosave";
import { SaveFormatError, parseSave, toJson } from "../io/format";
import {
  DEFAULT_SHAPE,
  MAX_DIM,
  MIN_DIM,
  inBounds,
  sameShape,
  tileIndex,
} from "../model/grid";
import { Layout, sameTile, type TileSnapshot } from "../model/layout";
import { Scene } from "../model/scene";
import { DEFAULT_SETTINGS, type Settings, cloneSettings, sanitizeSettings } from "../model/settings";
import {
  type Direction,
  type FanSettings,
  type HeaterSettings,
  TileType,
  type WindowSettings,
} from "../model/tiles";
import {
  type Stamp,
  captureStamp,
  forEachStampTile,
  rectIndices,
  rotateStamp,
} from "../input/stamp";
import type { Tool } from "../input/canvasInput";
import type { Gesture } from "../render/selectionOverlay";
import { createView, fitView } from "../render/view";

// --- Document state ---

function browserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
const storage = browserStorage();

export const scene = new Scene(new Layout(DEFAULT_SHAPE), cloneSettings(DEFAULT_SETTINGS));
const restored = loadAutosave(storage);
if (restored) scene.restore(restored);

/** The layout object is never replaced, only mutated or restored in place. */
export const layout = scene.layout;
const history = new History();
const autosave = new Autosave(storage, exportJson);

// --- View and UI state ---

export const view = createView();
/** Canvas size in CSS px, kept current by App. */
export const viewport = { w: 0, h: 0 };

export const tool = signal<Tool>("pointer");
export const activeType = signal(TileType.Wall);
export const settings = signal<Settings>(scene.settings);
export const gridShape = signal(layout.shape);
/** Selected tile index, or null. */
export const selected = signal<number | null>(null);
/** Tiles picked with the Select tool. Replaced, never mutated. A single tile also sets `selected`. */
export const selection = signal<ReadonlySet<number>>(new Set());
/** Marquee / rectangle drag in progress. Plain object: written by input, read by the overlay. */
export const gesture: Gesture = { kind: "none", x0: 0, y0: 0, x1: 0, y1: 0, mode: "replace" };
/** A stamp following the cursor (paste) or the drag (move). Plain object, read by the overlay. */
export const floating: { stamp: Stamp | null; ox: number; oy: number; kind: "paste" | "move"; baseX: number; baseY: number } = {
  stamp: null, ox: 0, oy: 0, kind: "paste", baseX: 0, baseY: 0,
};
let clipboard: Stamp | null = null;
export const hasClipboard = signal(false);
/** Bumped on every layout change so the panel re-reads tile settings. */
export const layoutRev = signal(0);
/** Bumped whenever the undo/redo stacks change. */
export const historyRev = signal(0);
/** A message for the user (e.g. a failed import), or null. */
export const notice = signal<string | null>(null);
/** Sim playback. Sim state is not part of the scene: never saved, never undone. */
export const playing = signal(true);
/** Sim speed multiplier. A playback control like `playing`: not saved, not undone. */
export const SPEEDS = [0.25, 0.5, 1, 2, 4] as const;
export const speed = signal<number>(1);
/** Current heat map scale range in C (fixed from settings, or auto from the field). */
export const heatRange = signal({ lo: DEFAULT_SETTINGS.heatScale.minC, hi: DEFAULT_SETTINGS.heatScale.maxC });
/**
 * Latest per-tile readings from the GPU, in tile index order: temperature (C) and
 * velocity (2 per tile, tiles/s, y down). Refreshed by the frame loop while something
 * is selected or hovered; `readingsRev` bumps on each refresh.
 */
export const readings = {
  temp: new Float32Array(MAX_DIM * MAX_DIM),
  vel: new Float32Array(MAX_DIM * MAX_DIM * 2),
  /** Tile count the readings were taken at (guards against reading after a resize). */
  count: 0,
};
export const readingsRev = signal(0);
/** Hovered tile index, or null. */
export const hoverTile = signal<number | null>(null);
/** One-shot requests consumed by the frame loop. */
export const simRequests = { steps: 0, reset: false };

export function togglePlay(): void {
  playing.value = !playing.value;
  requestRender();
}

/** Advance one frame. Only while paused. */
export function stepSim(): void {
  if (playing.peek()) return;
  simRequests.steps++;
  requestRender();
}

/** Air and heat back to ambient; the layout stays. */
export function resetSim(): void {
  simRequests.reset = true;
  requestRender();
}

/** Hovered tile coords, or -1. Plain object: read by the render loop only. */
export const hover: [number, number] = [-1, -1];

export function canUndo(): boolean {
  historyRev.value;
  return history.canUndo;
}
export function canRedo(): boolean {
  historyRev.value;
  return history.canRedo;
}

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

/** Sync UI state after the scene changed (edit, undo, redo, import). */
function changed(): void {
  layoutRev.value++;
  historyRev.value++;
  settings.value = scene.settings;
  if (!sameShape(gridShape.value, layout.shape)) {
    gridShape.value = layout.shape;
    clearSelection();
    cancelPaste();
    fit();
  }
  if (selected.value !== null && selected.value >= layout.types.length) selected.value = null;
  pruneSelection();
  requestRender();
  autosave.schedule();
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => autosave.flush());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") autosave.flush();
  });
}

// --- Layout edits ---
// Every layout and settings edit goes through History, so undo covers it.

/** Brush stroke in progress: tile index -> its state before the stroke touched it. */
let stroke: Map<number, TileSnapshot> | null = null;

export function beginStroke(): void {
  endStroke();
  stroke = new Map();
}

/** Close the current stroke as a single undo step. */
export function endStroke(): void {
  if (!stroke) return;
  const changes = new Map<number, TileChange>();
  for (const [i, before] of stroke) {
    const after = layout.tileSnapshot(i);
    if (!sameTile(before, after)) changes.set(i, { before, after });
  }
  stroke = null;
  if (changes.size > 0) {
    history.record(new TileEditCommand(scene, changes));
    changed();
  }
}

export function paintTile(x: number, y: number, type: TileType): void {
  if (!inBounds(layout.shape, x, y)) return;
  const standalone = stroke === null;
  if (standalone) beginStroke();
  const i = tileIndex(layout.shape, x, y);
  if (!stroke!.has(i)) stroke!.set(i, layout.tileSnapshot(i));
  if (layout.setTile(i, type)) {
    layoutRev.value++;
    requestRender();
    autosave.schedule();
  }
  if (standalone) endStroke();
}

export function selectTile(x: number, y: number): void {
  if (!inBounds(layout.shape, x, y)) {
    selected.value = null;
    return;
  }
  selected.value = tileIndex(layout.shape, x, y);
}

// --- Selection and bulk edits ---

const EMPTY: ReadonlySet<number> = new Set();

export function setSelection(next: ReadonlySet<number>): void {
  selection.value = next.size === 0 ? EMPTY : next;
  selected.value = next.size === 1 ? next.values().next().value! : null;
  requestRender();
}

export function clearSelection(): void {
  if (selection.peek().size > 0) selection.value = EMPTY;
}

/** Drop selected tiles that no longer exist (after undo, resize, import). */
function pruneSelection(): void {
  const sel = selection.peek();
  for (const i of sel) {
    if (i >= layout.types.length) {
      setSelection(new Set([...sel].filter((j) => j < layout.types.length)));
      return;
    }
  }
}

/** Something is selected: a Select-tool selection or a single clicked tile. */
export function hasSelection(): boolean {
  return selection.peek().size > 0 || selected.peek() !== null;
}
export function inSelection(x: number, y: number): boolean {
  return inBounds(layout.shape, x, y) && selection.peek().has(tileIndex(layout.shape, x, y));
}

/** Combine a marquee rectangle with the current selection. */
export function commitMarquee(
  x0: number, y0: number, x1: number, y1: number, mode: Gesture["mode"],
): void {
  const hit = rectIndices(layout.shape, x0, y0, x1, y1);
  const next = new Set(mode === "replace" ? [] : selection.peek());
  for (const i of hit) {
    if (mode === "subtract") next.delete(i);
    else next.add(i);
  }
  setSelection(next);
}

/** Set many tiles exactly as one undo step. */
function commitTiles(snaps: Map<number, TileSnapshot>): void {
  endStroke();
  const changes = new Map<number, TileChange>();
  for (const [i, after] of snaps) {
    const before = layout.tileSnapshot(i);
    if (!sameTile(before, after)) changes.set(i, { before, after });
  }
  if (changes.size === 0) return;
  const cmd = new TileEditCommand(scene, changes);
  cmd.apply();
  history.record(cmd);
  changed();
}

const AIR: TileSnapshot = { type: TileType.Air };

function deleteSelection(): void {
  const snaps = new Map<number, TileSnapshot>();
  for (const i of selection.peek()) snaps.set(i, AIR);
  commitTiles(snaps);
}

export function copySelection(): boolean {
  const cap = captureStamp(layout, selection.peek());
  if (!cap) return false;
  clipboard = cap.stamp;
  hasClipboard.value = true;
  return true;
}

export function cutSelection(): void {
  if (copySelection()) deleteSelection();
}

/** Move the selection's tiles to a stamp at (ox, oy): clear sources, place, reselect. */
function relocate(stamp: Stamp, ox: number, oy: number): void {
  const snaps = new Map<number, TileSnapshot>();
  for (const i of selection.peek()) snaps.set(i, AIR);
  const dest = new Set<number>();
  forEachStampTile(layout.shape, stamp, ox, oy, (i, t) => {
    snaps.set(i, t);
    dest.add(i);
  });
  commitTiles(snaps);
  setSelection(dest);
}

/** Rotate 90 degrees. Works on the floating paste if there is one, else on the selection. */
export function transform(op: "cw" | "ccw"): void {
  const apply = (s: Stamp) => rotateStamp(s, op === "cw");
  if (floating.stamp && floating.kind === "paste") {
    floating.stamp = apply(floating.stamp);
    clipboard = floating.stamp;
    updateFloating();
    requestRender();
    return;
  }
  const cap = captureStamp(layout, selection.peek());
  if (!cap) return;
  const next = apply(cap.stamp);
  const [gw, gh] = layout.shape as [number, number];
  if (next.w > gw || next.h > gh) {
    notice.value = "That selection doesn't fit the grid once rotated.";
    return;
  }
  const ox = cap.x + Math.floor((cap.stamp.w - next.w) / 2);
  const oy = cap.y + Math.floor((cap.stamp.h - next.h) / 2);
  relocate(next, Math.min(gw - next.w, Math.max(0, ox)), Math.min(gh - next.h, Math.max(0, oy)));
}

// Move (drag inside the selection)

export function beginMove(): boolean {
  const cap = captureStamp(layout, selection.peek());
  if (!cap) return false;
  floating.stamp = cap.stamp;
  floating.kind = "move";
  floating.baseX = floating.ox = cap.x;
  floating.baseY = floating.oy = cap.y;
  return true;
}

/** Offset in tiles from where the drag started. Keeps the whole stamp inside the grid. */
export function moveBy(dx: number, dy: number): void {
  const s = floating.stamp;
  if (!s || floating.kind !== "move") return;
  floating.ox = Math.min(layout.shape[0]! - s.w, Math.max(0, floating.baseX + dx));
  floating.oy = Math.min(layout.shape[1]! - s.h, Math.max(0, floating.baseY + dy));
  requestRender();
}

export function endMove(commit: boolean): void {
  const s = floating.stamp;
  if (s && floating.kind === "move" && commit && (floating.ox !== floating.baseX || floating.oy !== floating.baseY)) {
    relocate(s, floating.ox, floating.oy);
  }
  floating.stamp = null;
  requestRender();
}

// Paste

export function isPasting(): boolean {
  return floating.stamp !== null && floating.kind === "paste";
}

/** Centre the floating paste on the cursor, kept inside the grid. */
export function updateFloating(): void {
  const s = floating.stamp;
  if (!s || floating.kind !== "paste") return;
  const hx = hover[0] < 0 ? 0 : hover[0];
  const hy = hover[1] < 0 ? 0 : hover[1];
  floating.ox = Math.max(0, Math.min(layout.shape[0]! - s.w, hx - Math.floor(s.w / 2)));
  floating.oy = Math.max(0, Math.min(layout.shape[1]! - s.h, hy - Math.floor(s.h / 2)));
}

export function startPaste(): void {
  if (!clipboard) return;
  endMove(false);
  floating.stamp = clipboard;
  floating.kind = "paste";
  tool.value = "select";
  updateFloating();
  requestRender();
}

export function cancelPaste(): void {
  if (!isPasting()) return;
  floating.stamp = null;
  requestRender();
}

export function placePaste(): void {
  const s = floating.stamp;
  if (!s || floating.kind !== "paste") return;
  updateFloating();
  const snaps = new Map<number, TileSnapshot>();
  const placed = new Set<number>();
  forEachStampTile(layout.shape, s, floating.ox, floating.oy, (i, t) => {
    snaps.set(i, t);
    placed.add(i);
  });
  floating.stamp = null;
  commitTiles(snaps);
  setSelection(placed);
}

// Shortcuts that act on a target

/** Selection if it has several tiles, else the hovered tile, else the selected tile. */
function targets(): number[] {
  const sel = selection.peek();
  if (sel.size > 1) return [...sel];
  const h = hoverTile.peek();
  if (h !== null && layout.typeAt(h) !== TileType.Air && layout.typeAt(h) !== TileType.Wall) return [h];
  const s = selected.peek();
  return s === null ? [] : [s];
}

function ofType(idx: number[], type: TileType): number[] {
  return idx.filter((i) => layout.typeAt(i) === type);
}

/** True if there is a fan, heater or window for a shortcut to act on. */
export function hasObjectTarget(): boolean {
  return targets().some((i) => {
    const t = layout.typeAt(i);
    return t === TileType.Fan || t === TileType.Heater || t === TileType.Window;
  });
}

/** Rotate target fans by one 45 degree step (1 = clockwise). */
export function turnFans(step: 1 | -1): void {
  const fans = ofType(targets(), TileType.Fan);
  editTiles(fans, ["dir"], (i) =>
    layout.updateFan(i, { dir: ((layout.fans.get(i)!.dir + step + 8) % 8) as Direction }),
  );
}

/** `[` / `]`: fan level or heater target. `secondary` (Shift): sweep speed or heater output rate. */
export function adjustTargets(secondary: boolean, step: 1 | -1): void {
  const t = targets();
  const fans = ofType(t, TileType.Fan);
  const heaters = ofType(t, TileType.Heater);
  const field = secondary ? "secondary" : "primary";
  editTiles(fans, [field], (i) => {
    const f = layout.fans.get(i)!;
    return layout.updateFan(i, secondary ? { sweepSpeed: f.sweepSpeed + step } : { level: f.level + step });
  });
  editTiles(heaters, [field], (i) => {
    const h = layout.heaters.get(i)!;
    return layout.updateHeater(i, secondary ? { outputRate: h.outputRate + step } : { targetC: h.targetC + 5 * step });
  });
}

/** O: toggle fan oscillation, heater power, window open. Mixed values turn everything on. */
export function toggleTargets(): void {
  const t = targets();
  const fans = ofType(t, TileType.Fan);
  const wins = ofType(t, TileType.Window);
  const heaters = ofType(t, TileType.Heater);
  const osc = !fans.every((i) => layout.fans.get(i)!.oscillate);
  const open = !wins.every((i) => layout.windows.get(i)!.open);
  updateFans(fans, { oscillate: osc });
  updateWindows(wins, { open });
  updateHeaters(heaters, { on: !heaters.every((i) => layout.heaters.get(i)!.on) });
}

/** E/Q: rotate the selected tiles 90 degrees (Select tool) or a floating paste; else turn the target fan 45 degrees. */
export function rotateAction(clockwise: boolean): void {
  if (isPasting() || (tool.peek() === "select" && selection.peek().size > 0)) transform(clockwise ? "cw" : "ccw");
  else turnFans(clockwise ? 1 : -1);
}

/** Edit the settings of several tiles as one undo step. Rapid edits to the same fields merge. */
function editTiles(indices: readonly number[], fields: string[], mutate: (i: number) => boolean): void {
  if (indices.length === 0) return;
  endStroke();
  const changes = new Map<number, TileChange>();
  for (const i of indices) {
    const before = layout.tileSnapshot(i);
    if (!mutate(i)) continue;
    const after = layout.tileSnapshot(i);
    if (!sameTile(before, after)) changes.set(i, { before, after });
  }
  if (changes.size === 0) return;
  history.record(
    new TileEditCommand(scene, changes, `tiles:${indices[0]}:${indices.length}:${fields.join(",")}`),
  );
  changed();
}

export function updateFan(i: number, patch: Partial<FanSettings>): void {
  updateFans([i], patch);
}
export function updateHeater(i: number, patch: Partial<HeaterSettings>): void {
  updateHeaters([i], patch);
}
export function updateWindow(i: number, patch: Partial<WindowSettings>): void {
  updateWindows([i], patch);
}
export function updateFans(indices: readonly number[], patch: Partial<FanSettings>): void {
  editTiles(indices, Object.keys(patch), (i) => layout.updateFan(i, patch));
}
export function updateHeaters(indices: readonly number[], patch: Partial<HeaterSettings>): void {
  editTiles(indices, Object.keys(patch), (i) => layout.updateHeater(i, patch));
}
export function updateWindows(indices: readonly number[], patch: Partial<WindowSettings>): void {
  editTiles(indices, Object.keys(patch), (i) => layout.updateWindow(i, patch));
}

/** Change global settings. `key` names what changed so slider drags merge. */
export function updateSettings(key: string, next: Settings): void {
  endStroke();
  const before = scene.settings;
  const after = sanitizeSettings(next);
  if (JSON.stringify(before) === JSON.stringify(after)) return;
  history.execute(new SettingsCommand(scene, before, after, `settings:${key}`));
  changed();
}

export function setOverlay(name: keyof Settings["overlays"], on: boolean): void {
  const s = scene.settings;
  updateSettings(`overlay:${name}`, { ...s, overlays: { ...s.overlays, [name]: on } });
}

export function setGridLines(on: boolean): void {
  setOverlay("gridLines", on);
}

export function setGravity(gravity: boolean): void {
  updateSettings("gravity", { ...scene.settings, gravity });
}

export function setSwirl(swirl: number): void {
  updateSettings("swirl", { ...scene.settings, swirl });
}

export function setSimQuality(simQuality: Settings["simQuality"]): void {
  updateSettings("simQuality", { ...scene.settings, simQuality });
}

export function setAutoScale(auto: boolean): void {
  const s = scene.settings;
  updateSettings("heatScale.auto", { ...s, heatScale: { ...s.heatScale, auto } });
}

/** Replace the whole scene as one undo step. */
function replaceScene(next: ReturnType<Scene["snapshot"]>): void {
  endStroke();
  const cmd = new ReplaceSceneCommand(scene, scene.snapshot(), next);
  history.execute(cmd);
  selected.value = null;
  clearSelection();
  changed();
}

/** Everything back to air. Keeps the grid size and settings. Undoable. */
export function clearLayout(): void {
  if (layout.types.every((t) => t === TileType.Air)) return;
  const before = scene.snapshot();
  replaceScene({
    layout: { shape: before.layout.shape, types: new Uint8Array(layout.types.length), fans: [], heaters: [], windows: [] },
    settings: before.settings,
  });
}

export function resizeGrid(w: number, h: number): void {
  const clamp = (v: number) => Math.min(MAX_DIM, Math.max(MIN_DIM, Math.round(v) || MIN_DIM));
  const shape = [clamp(w), clamp(h)];
  if (sameShape(layout.shape, shape)) return;
  endStroke();
  const before = scene.snapshot();
  layout.resize(shape);
  const after = scene.snapshot();
  history.record(new ReplaceSceneCommand(scene, before, after));
  selected.value = null;
  clearSelection();
  changed();
}

export function undo(): void {
  endStroke();
  if (history.undo()) changed();
}

export function redo(): void {
  endStroke();
  if (history.redo()) changed();
}

// --- Import / export ---

export function exportJson(): string {
  return toJson(scene.snapshot());
}

/** Load a saved layout. Returns false (and sets `notice`) if the file is invalid. */
export function importJson(text: string): boolean {
  try {
    const next = parseSave(text);
    replaceScene(next);
    resetSim();
    fit();
    notice.value = null;
    return true;
  } catch (e) {
    if (e instanceof SaveFormatError) {
      notice.value = `Could not import: ${e.message}`;
      return false;
    }
    throw e;
  }
}
