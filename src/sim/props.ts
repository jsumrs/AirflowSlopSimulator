import type { Layout } from "../model/layout";
import { DIR_VECTORS, TileType } from "../model/tiles";
import { FAN_SPEED_PER_LEVEL, K_AIR, K_WALL, K_WINDOW } from "./params";

/** Floats per tile: two RGBA32F texels (props A and props B). */
export const PROPS_STRIDE = 8;

/**
 * Per-tile solver properties, shared by the GPU solver and the CPU reference.
 *   A: [0] conductivity, [1] solid (blocks air, 0/1), [2] heater target C, [3] heater output level (0 = none)
 *   B: [4] fan direction x, [5] fan direction y (unit vector, y down), [6] fan target speed tiles/s (0 = none),
 *      [7] fan sweep-speed level while oscillating (0 = fixed direction)
 */
export function tileProps(layout: Layout, i: number, out: Float32Array, o: number): void {
  let k = K_AIR;
  let solid = 0;
  let target = 0;
  let rate = 0;
  let fx = 0;
  let fy = 0;
  let speed = 0;
  let sweep = 0;
  switch (layout.typeAt(i)) {
    case TileType.Wall:
      k = K_WALL;
      solid = 1;
      break;
    case TileType.Fan: {
      const f = layout.fans.get(i);
      if (f && f.on) {
        const [dx, dy] = DIR_VECTORS[f.dir]!;
        const len = Math.hypot(dx, dy);
        fx = dx / len;
        fy = dy / len;
        speed = f.level * FAN_SPEED_PER_LEVEL;
        if (f.oscillate) sweep = f.sweepSpeed;
      }
      break;
    }
    case TileType.Heater: {
      const h = layout.heaters.get(i);
      if (h) {
        target = h.targetC;
        rate = h.on ? h.outputRate : 0;
      }
      break;
    }
    case TileType.Window:
      if (!layout.windows.get(i)?.open) {
        k = K_WINDOW;
        solid = 1;
      }
      break;
    default:
      break;
  }
  out[o] = k;
  out[o + 1] = solid;
  out[o + 2] = target;
  out[o + 3] = rate;
  out[o + 4] = fx;
  out[o + 5] = fy;
  out[o + 6] = speed;
  out[o + 7] = sweep;
}

export function buildProps(layout: Layout): Float32Array {
  const out = new Float32Array(layout.types.length * PROPS_STRIDE);
  for (let i = 0; i < layout.types.length; i++) tileProps(layout, i, out, i * PROPS_STRIDE);
  return out;
}
