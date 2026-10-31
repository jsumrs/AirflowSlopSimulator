export enum TileType {
  Air = 0,
  Wall = 1,
  Fan = 2,
  Heater = 3,
  Window = 4,
}

export const TILE_TYPES: readonly TileType[] = [
  TileType.Air,
  TileType.Wall,
  TileType.Fan,
  TileType.Heater,
  TileType.Window,
];

/** Eight facing directions, clockwise from north. */
export enum Direction {
  N = 0,
  NE = 1,
  E = 2,
  SE = 3,
  S = 4,
  SW = 5,
  W = 6,
  NW = 7,
}

export const DIR_NAMES: readonly string[] = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

/** Direction vectors in grid coordinates (y grows downward on screen). */
export const DIR_VECTORS: readonly (readonly [number, number])[] = [
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
];

export interface FanSettings {
  dir: Direction;
  /** Power switch. Level is kept while off. */
  on: boolean;
  /** 1-5. */
  level: number;
  oscillate: boolean;
  /** 1-5. */
  sweepSpeed: number;
}

export interface HeaterSettings {
  /** Power switch. Target and rate are kept while off. */
  on: boolean;
  /** Target temperature in C. */
  targetC: number;
  /** 1-5. */
  outputRate: number;
}

export interface WindowSettings {
  open: boolean;
}

export const FAN_LEVEL_RANGE = [1, 5] as const;
export const SWEEP_SPEED_RANGE = [1, 5] as const;
export const HEATER_TARGET_RANGE = [20, 100] as const;
export const HEATER_RATE_RANGE = [1, 5] as const;

export const DEFAULT_FAN: Readonly<FanSettings> = {
  dir: Direction.E,
  on: true,
  level: 3,
  oscillate: false,
  sweepSpeed: 2,
};
export const DEFAULT_HEATER: Readonly<HeaterSettings> = {
  on: true,
  targetC: 50,
  outputRate: 3,
};
export const DEFAULT_WINDOW: Readonly<WindowSettings> = { open: false };

function clampInt(v: number, [lo, hi]: readonly [number, number]): number {
  if (!Number.isFinite(v)) return lo;
  return Math.min(hi, Math.max(lo, Math.round(v)));
}

export function sanitizeFan(p: Partial<FanSettings>): Partial<FanSettings> {
  const out: Partial<FanSettings> = {};
  if (p.dir !== undefined) out.dir = (((Math.round(p.dir) % 8) + 8) % 8) as Direction;
  if (p.on !== undefined) out.on = !!p.on;
  if (p.level !== undefined) out.level = clampInt(p.level, FAN_LEVEL_RANGE);
  if (p.oscillate !== undefined) out.oscillate = !!p.oscillate;
  if (p.sweepSpeed !== undefined) out.sweepSpeed = clampInt(p.sweepSpeed, SWEEP_SPEED_RANGE);
  return out;
}

export function sanitizeHeater(p: Partial<HeaterSettings>): Partial<HeaterSettings> {
  const out: Partial<HeaterSettings> = {};
  if (p.on !== undefined) out.on = !!p.on;
  if (p.targetC !== undefined) out.targetC = clampInt(p.targetC, HEATER_TARGET_RANGE);
  if (p.outputRate !== undefined) out.outputRate = clampInt(p.outputRate, HEATER_RATE_RANGE);
  return out;
}

export function sanitizeWindow(p: Partial<WindowSettings>): Partial<WindowSettings> {
  const out: Partial<WindowSettings> = {};
  if (p.open !== undefined) out.open = !!p.open;
  return out;
}
