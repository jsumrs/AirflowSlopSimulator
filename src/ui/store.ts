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
  type FanSettings,
  type HeaterSettings,
  TileType,
  type WindowSettings,
} from "../model/tiles";
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

export const tool = signal<"pointer" | "brush">("pointer");
/** What plain scroll does: pan (trackpad) or zoom (mouse wheel). */
export const scrollMode = signal<"pan" | "zoom">("pan");
export const activeType = signal(TileType.Wall);
export const settings = signal<Settings>(scene.settings);
export const gridShape = signal(layout.shape);
/** Selected tile index, or null. */
export const selected = signal<number | null>(null);
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
    fit();
  }
  if (selected.value !== null && selected.value >= layout.types.length) selected.value = null;
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

/** Edit one tile's settings. Rapid edits to the same fields merge into one undo step. */
function editTile(i: number, fields: string[], mutate: () => boolean): void {
  endStroke();
  const before = layout.tileSnapshot(i);
  if (!mutate()) return;
  const after = layout.tileSnapshot(i);
  if (sameTile(before, after)) return;
  history.record(
    new TileEditCommand(scene, new Map([[i, { before, after }]]), `tile:${i}:${fields.join(",")}`),
  );
  changed();
}

export function updateFan(i: number, patch: Partial<FanSettings>): void {
  editTile(i, Object.keys(patch), () => layout.updateFan(i, patch));
}
export function updateHeater(i: number, patch: Partial<HeaterSettings>): void {
  editTile(i, Object.keys(patch), () => layout.updateHeater(i, patch));
}
export function updateWindow(i: number, patch: Partial<WindowSettings>): void {
  editTile(i, Object.keys(patch), () => layout.updateWindow(i, patch));
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
