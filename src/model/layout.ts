import { type Shape, sameShape, tileCoords, tileCount, tileIndex } from "./grid";
import {
  DEFAULT_FAN,
  DEFAULT_HEATER,
  DEFAULT_WINDOW,
  type FanSettings,
  type HeaterSettings,
  TileType,
  type WindowSettings,
  sanitizeFan,
  sanitizeHeater,
  sanitizeWindow,
} from "./tiles";

export interface TileSnapshot {
  type: TileType;
  fan?: FanSettings;
  heater?: HeaterSettings;
  window?: WindowSettings;
}

/** Full copy of a layout, safe to keep and restore from repeatedly. */
export interface LayoutSnapshot {
  shape: Shape;
  types: Uint8Array;
  fans: [number, FanSettings][];
  heaters: [number, HeaterSettings][];
  windows: [number, WindowSettings][];
}

export function sameTile(a: TileSnapshot, b: TileSnapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Tile grid plus per-tile settings. Pure data, no DOM or GL.
 * Changed tiles are tracked so consumers (renderer, later the solver)
 * upload only what changed.
 */
export class Layout {
  shape: Shape;
  types: Uint8Array;
  readonly fans = new Map<number, FanSettings>();
  readonly heaters = new Map<number, HeaterSettings>();
  readonly windows = new Map<number, WindowSettings>();

  /** New fans/heaters/windows start with the last-used settings of their type. */
  readonly lastUsed = {
    fan: { ...DEFAULT_FAN } as FanSettings,
    heater: { ...DEFAULT_HEATER } as HeaterSettings,
    window: { ...DEFAULT_WINDOW } as WindowSettings,
  };

  private dirtyFlags: Uint8Array;
  private dirtyList: number[] = [];
  private allDirty = true;

  constructor(shape: Shape) {
    this.shape = shape;
    const n = tileCount(shape);
    this.types = new Uint8Array(n);
    this.dirtyFlags = new Uint8Array(n);
  }

  typeAt(i: number): TileType {
    return this.types[i]! as TileType;
  }

  /** Returns true if the tile changed. Same-type paints keep existing settings. */
  setTile(i: number, type: TileType): boolean {
    if (this.types[i] === type) return false;
    this.fans.delete(i);
    this.heaters.delete(i);
    this.windows.delete(i);
    this.types[i] = type;
    if (type === TileType.Fan) this.fans.set(i, { ...this.lastUsed.fan });
    else if (type === TileType.Heater) this.heaters.set(i, { ...this.lastUsed.heater });
    else if (type === TileType.Window) this.windows.set(i, { ...this.lastUsed.window });
    this.markDirty(i);
    return true;
  }

  updateFan(i: number, patch: Partial<FanSettings>): boolean {
    const s = this.fans.get(i);
    if (!s) return false;
    Object.assign(s, sanitizeFan(patch));
    Object.assign(this.lastUsed.fan, s);
    this.markDirty(i);
    return true;
  }

  updateHeater(i: number, patch: Partial<HeaterSettings>): boolean {
    const s = this.heaters.get(i);
    if (!s) return false;
    Object.assign(s, sanitizeHeater(patch));
    Object.assign(this.lastUsed.heater, s);
    this.markDirty(i);
    return true;
  }

  updateWindow(i: number, patch: Partial<WindowSettings>): boolean {
    const s = this.windows.get(i);
    if (!s) return false;
    Object.assign(s, sanitizeWindow(patch));
    Object.assign(this.lastUsed.window, s);
    this.markDirty(i);
    return true;
  }

  tileSnapshot(i: number): TileSnapshot {
    const snap: TileSnapshot = { type: this.typeAt(i) };
    const fan = this.fans.get(i);
    const heater = this.heaters.get(i);
    const window = this.windows.get(i);
    if (fan) snap.fan = { ...fan };
    if (heater) snap.heater = { ...heater };
    if (window) snap.window = { ...window };
    return snap;
  }

  /** Set one tile exactly, including its settings. Does not touch `lastUsed`. */
  setTileSnapshot(i: number, snap: TileSnapshot): void {
    this.fans.delete(i);
    this.heaters.delete(i);
    this.windows.delete(i);
    this.types[i] = snap.type;
    if (snap.fan) this.fans.set(i, { ...snap.fan });
    if (snap.heater) this.heaters.set(i, { ...snap.heater });
    if (snap.window) this.windows.set(i, { ...snap.window });
    this.markDirty(i);
  }

  snapshot(): LayoutSnapshot {
    const copy = <T extends object>(m: Map<number, T>): [number, T][] =>
      Array.from(m, ([i, v]) => [i, { ...v }]);
    return {
      shape: [...this.shape],
      types: this.types.slice(),
      fans: copy(this.fans),
      heaters: copy(this.heaters),
      windows: copy(this.windows),
    };
  }

  restore(snap: LayoutSnapshot): void {
    this.shape = [...snap.shape];
    this.types = snap.types.slice();
    this.dirtyFlags = new Uint8Array(this.types.length);
    this.dirtyList.length = 0;
    this.fans.clear();
    this.heaters.clear();
    this.windows.clear();
    for (const [i, v] of snap.fans) this.fans.set(i, { ...v });
    for (const [i, v] of snap.heaters) this.heaters.set(i, { ...v });
    for (const [i, v] of snap.windows) this.windows.set(i, { ...v });
    this.allDirty = true;
  }

  /** Resize, keeping tiles that still fit anchored at the origin (top-left). */
  resize(next: Shape): void {
    if (sameShape(this.shape, next)) return;
    const old = this.shape;
    const oldTypes = this.types;
    const oldFans = new Map(this.fans);
    const oldHeaters = new Map(this.heaters);
    const oldWindows = new Map(this.windows);

    const n = tileCount(next);
    this.shape = next;
    this.types = new Uint8Array(n);
    this.dirtyFlags = new Uint8Array(n);
    this.dirtyList.length = 0;
    this.fans.clear();
    this.heaters.clear();
    this.windows.clear();

    const c: number[] = [0, 0, 0];
    for (let i = 0; i < oldTypes.length; i++) {
      tileCoords(old, i, c);
      if (c[0]! >= next[0]! || c[1]! >= next[1]! || c[2]! >= (next[2] ?? 1)) continue;
      const ni = tileIndex(next, c[0]!, c[1]!, c[2]!);
      this.types[ni] = oldTypes[i]!;
      const f = oldFans.get(i);
      if (f) this.fans.set(ni, f);
      const h = oldHeaters.get(i);
      if (h) this.heaters.set(ni, h);
      const w = oldWindows.get(i);
      if (w) this.windows.set(ni, w);
    }
    this.allDirty = true;
  }

  // --- change tracking ---

  get dirtyCount(): number {
    return this.dirtyList.length;
  }

  markDirty(i: number): void {
    if (this.dirtyFlags[i]) return;
    this.dirtyFlags[i] = 1;
    this.dirtyList.push(i);
  }

  markAllDirty(): void {
    this.allDirty = true;
  }

  /** True once if everything needs re-uploading; clears the per-tile list. */
  consumeAllDirty(): boolean {
    if (!this.allDirty) return false;
    this.allDirty = false;
    this.dirtyFlags.fill(0);
    this.dirtyList.length = 0;
    return true;
  }

  /** Calls `cb` for each changed tile index, then clears the list. */
  drainDirty(cb: (index: number) => void): void {
    for (let k = 0; k < this.dirtyList.length; k++) {
      const i = this.dirtyList[k]!;
      this.dirtyFlags[i] = 0;
      cb(i);
    }
    this.dirtyList.length = 0;
  }
}
