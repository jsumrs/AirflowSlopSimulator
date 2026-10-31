import { MAX_DIM, MIN_DIM, tileCoords, tileIndex } from "../model/grid";
import type { LayoutSnapshot } from "../model/layout";
import type { SceneSnapshot } from "../model/scene";
import {
  DEFAULT_FAN,
  DEFAULT_HEATER,
  DEFAULT_WINDOW,
  DIR_NAMES,
  type Direction,
  type FanSettings,
  type HeaterSettings,
  TileType,
  type WindowSettings,
  sanitizeFan,
  sanitizeHeater,
  sanitizeWindow,
} from "../model/tiles";
import { type Settings, sanitizeSettings } from "../model/settings";
import { CURRENT_VERSION, SaveFormatError, migrate } from "./migrate";

export { CURRENT_VERSION, SaveFormatError };

export type SaveTile =
  | { x: number; y: number; type: "wall" }
  | ({ x: number; y: number; type: "fan"; dir: string } & Omit<FanSettings, "dir">)
  | ({ x: number; y: number; type: "heater" } & HeaterSettings)
  | ({ x: number; y: number; type: "window" } & WindowSettings);

export interface SaveFile {
  version: number;
  grid: { width: number; height: number };
  settings: Settings;
  tiles: SaveTile[];
}

/** Tiles are listed row by row, so the same scene always serializes identically. */
export function serialize(scene: SceneSnapshot): SaveFile {
  const { layout: l, settings } = scene;
  const fans = new Map(l.fans);
  const heaters = new Map(l.heaters);
  const windows = new Map(l.windows);
  const tiles: SaveTile[] = [];
  const c = [0, 0, 0];
  for (let i = 0; i < l.types.length; i++) {
    const type = l.types[i] as TileType;
    if (type === TileType.Air) continue;
    tileCoords(l.shape, i, c);
    const x = c[0]!;
    const y = c[1]!;
    if (type === TileType.Wall) tiles.push({ x, y, type: "wall" });
    else if (type === TileType.Fan) {
      const { dir, ...rest } = fans.get(i) ?? DEFAULT_FAN;
      tiles.push({ x, y, type: "fan", dir: DIR_NAMES[dir]!, ...rest });
    } else if (type === TileType.Heater) {
      tiles.push({ x, y, type: "heater", ...(heaters.get(i) ?? DEFAULT_HEATER) });
    } else if (type === TileType.Window) {
      tiles.push({ x, y, type: "window", ...(windows.get(i) ?? DEFAULT_WINDOW) });
    }
  }
  return {
    version: CURRENT_VERSION,
    grid: { width: l.shape[0]!, height: l.shape[1]! },
    settings,
    tiles,
  };
}

export function toJson(scene: SceneSnapshot): string {
  return JSON.stringify(serialize(scene), null, 2);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function dim(v: unknown, what: string): number {
  if (typeof v !== "number" || !Number.isInteger(v) || v < MIN_DIM || v > MAX_DIM) {
    throw new SaveFormatError(`Grid ${what} must be a whole number from ${MIN_DIM} to ${MAX_DIM}.`);
  }
  return v;
}

/** Parse and validate a save file. Throws `SaveFormatError` with a user-readable message. */
export function parseSave(text: string): SceneSnapshot {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new SaveFormatError("This is not a valid JSON file.");
  }
  return fromRaw(migrate(raw));
}

export function fromRaw(file: Record<string, unknown>): SceneSnapshot {
  if (!isRecord(file.grid)) throw new SaveFormatError("The file has no grid size.");
  const shape = [dim(file.grid.width, "width"), dim(file.grid.height, "height")];
  if (!Array.isArray(file.tiles)) throw new SaveFormatError("The file has no tile list.");

  const types = new Uint8Array(shape[0]! * shape[1]!);
  const fans = new Map<number, FanSettings>();
  const heaters = new Map<number, HeaterSettings>();
  const windows = new Map<number, WindowSettings>();

  file.tiles.forEach((t: unknown, n: number) => {
    if (!isRecord(t)) throw new SaveFormatError(`Tile ${n} is not an object.`);
    const { x, y } = t;
    if (
      typeof x !== "number" || typeof y !== "number" ||
      !Number.isInteger(x) || !Number.isInteger(y) ||
      x < 0 || y < 0 || x >= shape[0]! || y >= shape[1]!
    ) {
      throw new SaveFormatError(`Tile ${n} is outside the grid.`);
    }
    const i = tileIndex(shape, x, y);
    fans.delete(i);
    heaters.delete(i);
    windows.delete(i);
    switch (t.type) {
      case "wall":
        types[i] = TileType.Wall;
        break;
      case "fan": {
        types[i] = TileType.Fan;
        const dir = DIR_NAMES.indexOf(String(t.dir));
        fans.set(i, {
          ...DEFAULT_FAN,
          ...sanitizeFan({
            ...(dir >= 0 ? { dir: dir as Direction } : {}),
            ...(typeof t.on === "boolean" ? { on: t.on } : {}),
            ...(typeof t.level === "number" ? { level: t.level } : {}),
            ...(typeof t.oscillate === "boolean" ? { oscillate: t.oscillate } : {}),
            ...(typeof t.sweepSpeed === "number" ? { sweepSpeed: t.sweepSpeed } : {}),
          }),
        });
        break;
      }
      case "heater":
        types[i] = TileType.Heater;
        heaters.set(i, {
          ...DEFAULT_HEATER,
          ...sanitizeHeater({
            ...(typeof t.on === "boolean" ? { on: t.on } : {}),
            ...(typeof t.targetC === "number" ? { targetC: t.targetC } : {}),
            ...(typeof t.outputRate === "number" ? { outputRate: t.outputRate } : {}),
          }),
        });
        break;
      case "window":
        types[i] = TileType.Window;
        windows.set(i, {
          ...DEFAULT_WINDOW,
          ...sanitizeWindow(typeof t.open === "boolean" ? { open: t.open } : {}),
        });
        break;
      default:
        throw new SaveFormatError(`Tile ${n} has an unknown type "${String(t.type)}".`);
    }
  });

  const layout: LayoutSnapshot = {
    shape,
    types,
    fans: [...fans],
    heaters: [...heaters],
    windows: [...windows],
  };
  return { layout, settings: sanitizeSettings(file.settings) };
}
