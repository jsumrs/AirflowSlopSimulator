import { DIR_NAMES } from "../model/tiles";
import { readings } from "./store";

export interface TileReading {
  tempC: number;
  /** Velocity, tiles/s, y down. */
  u: number;
  v: number;
  speed: number;
}

/** Latest GPU reading for a tile, or null if none is available yet. */
export function tileReading(i: number): TileReading | null {
  if (i >= readings.count) return null;
  const u = readings.vel[i * 2]!;
  const v = readings.vel[i * 2 + 1]!;
  return { tempC: readings.temp[i]!, u, v, speed: Math.hypot(u, v) };
}

/** Compass direction air is moving toward. y is down, so north is -y. */
export function compass(u: number, v: number): string {
  const bearing = Math.atan2(u, -v); // 0 = north, clockwise
  const k = Math.round(bearing / (Math.PI / 4));
  return DIR_NAMES[((k % 8) + 8) % 8]!;
}

export function formatTemp(c: number): string {
  return `${c.toFixed(1)} °C`;
}

export function formatAirflow(r: TileReading): string {
  if (r.speed < 0.05) return "Still";
  return `${r.speed.toFixed(1)} tiles/s ${compass(r.u, r.v)}`;
}
