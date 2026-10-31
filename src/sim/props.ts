import type { Layout } from "../model/layout";
import { TileType } from "../model/tiles";
import { K_AIR, K_WALL, K_WINDOW } from "./params";

/** Floats per tile in the property texture. */
export const PROPS_STRIDE = 4;

/**
 * Per-tile solver properties, 4 floats (one RGBA32F texel), shared by the GPU
 * solver and the CPU reference:
 *   [0] conductivity, [1] solid (blocks air, 0/1), [2] heater target C, [3] heater output level (0 = no heater)
 */
export function tileProps(layout: Layout, i: number, out: Float32Array, o: number): void {
  let k = K_AIR;
  let solid = 0;
  let target = 0;
  let rate = 0;
  switch (layout.typeAt(i)) {
    case TileType.Wall:
      k = K_WALL;
      solid = 1;
      break;
    case TileType.Heater: {
      const h = layout.heaters.get(i);
      if (h) {
        target = h.targetC;
        rate = h.outputRate;
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
}

export function buildProps(layout: Layout): Float32Array {
  const out = new Float32Array(layout.types.length * PROPS_STRIDE);
  for (let i = 0; i < layout.types.length; i++) tileProps(layout, i, out, i * PROPS_STRIDE);
  return out;
}
