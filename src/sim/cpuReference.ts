import { type Shape, tileIndex } from "../model/grid";
import {
  HEATER_POWER,
  K_OUTSIDE,
  T_MAX,
  T_MIN,
  diffusionSubsteps,
} from "./params";
import { PROPS_STRIDE } from "./props";

/**
 * CPU reference of the heat step, for tests. Mirrors the GPU passes in
 * `shaders/heatSource.frag.glsl` and `shaders/diffuse.frag.glsl` exactly.
 */
export interface HeatGrid {
  tileShape: Shape;
  quality: number;
  /** `PROPS_STRIDE` floats per tile, from `buildProps`. */
  props: Float32Array;
}

function propAt(g: HeatGrid, x: number, y: number, field: number): number {
  const q = g.quality;
  const ti = tileIndex(g.tileShape, Math.floor(x / q), Math.floor(y / q));
  return g.props[ti * PROPS_STRIDE + field]!;
}

const OFFS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

function sanitize(t: number, ambient: number): number {
  if (!Number.isFinite(t)) return ambient;
  return Math.min(T_MAX, Math.max(T_MIN, t));
}

/** One sim step: heater source with the full dt, then diffusion substeps. Updates `temp` in place. */
export function cpuHeatStep(
  temp: Float32Array,
  scratch: Float32Array,
  g: HeatGrid,
  ambient: number,
  dt: number,
): void {
  const sim = g.tileShape.map((d) => d * g.quality);
  const w = sim[0]!;
  const h = sim[1]!;

  // Source: thermostat.
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = tileIndex(sim, x, y);
      let t = temp[i]!;
      const rate = propAt(g, x, y, 3);
      const target = propAt(g, x, y, 2);
      if (rate > 0 && t < target) t = Math.min(target, t + rate * HEATER_POWER * dt);
      temp[i] = sanitize(t, ambient);
    }
  }

  // Diffusion: explicit, flux form with harmonic-mean face conductivity.
  const n = diffusionSubsteps(dt, g.quality);
  const sub = dt / n;
  const invH2 = g.quality * g.quality;
  let src = temp;
  let dst = scratch;
  for (let s = 0; s < n; s++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = tileIndex(sim, x, y);
        const t = src[i]!;
        const k = propAt(g, x, y, 0);
        let sum = 0;
        for (const [dx, dy] of OFFS) {
          const nx = x + dx;
          const ny = y + dy;
          let tn: number;
          let kn: number;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) {
            tn = ambient;
            kn = K_OUTSIDE;
          } else {
            tn = src[tileIndex(sim, nx, ny)]!;
            kn = propAt(g, nx, ny, 0);
          }
          const kf = (2 * k * kn) / Math.max(k + kn, 1e-6);
          sum += kf * (tn - t);
        }
        dst[i] = sanitize(t + sub * invH2 * sum, ambient);
      }
    }
    const tmp = src;
    src = dst;
    dst = tmp;
  }
  if (src !== temp) temp.set(src);
}
