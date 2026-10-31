import type { Layout } from "../model/layout";
import { TileType } from "../model/tiles";

/**
 * Packs one tile into 4 bytes (RGBA8UI texel) for the tile shader.
 *   r: tile type
 *   Fan:    g = dir | oscillate << 3 | sweepSpeed << 4 | on << 7, b = level
 *   Heater: g = output rate, b = target C
 *   Window: g = open (0/1)
 */
export function packTile(layout: Layout, i: number, out: Uint8Array, o: number): void {
  const type = layout.typeAt(i);
  out[o] = type;
  out[o + 1] = 0;
  out[o + 2] = 0;
  out[o + 3] = 0;
  if (type === TileType.Fan) {
    const f = layout.fans.get(i);
    if (f) {
      out[o + 1] = f.dir | (f.oscillate ? 8 : 0) | (f.sweepSpeed << 4) | (f.on ? 128 : 0);
      out[o + 2] = f.level;
    }
  } else if (type === TileType.Heater) {
    const h = layout.heaters.get(i);
    if (h) {
      out[o + 1] = h.outputRate;
      out[o + 2] = h.targetC;
    }
  } else if (type === TileType.Window) {
    const w = layout.windows.get(i);
    if (w) out[o + 1] = w.open ? 1 : 0;
  }
}
