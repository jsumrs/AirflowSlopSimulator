/**
 * Solver constants. Units: length in tiles, time in sim seconds, temperature in C.
 * Tuned by eye against the example layouts (SPEC.md section 10.1).
 */

/** Fixed sim timestep. One rendered frame at 1x speed advances this much. */
export const SIM_DT = 1 / 60;
/** Most sim steps run in one rendered frame before we drop time instead (avoids a death spiral). */
export const MAX_STEPS_PER_FRAME = 8;

/** Thermal diffusivity, tiles^2/s. */
export const K_AIR = 2.0;
export const K_WALL = 0.03;
/** Closed window: glass leaks heat noticeably faster than a wall. */
export const K_WINDOW = 0.25;
/** Outside the grid is open air at ambient. */
export const K_OUTSIDE = K_AIR;
export const K_MAX = K_AIR;

/** Heater output, C/s added to each of its cells per output level while below target. */
export const HEATER_POWER = 40;

/** Fan target air speed per level, tiles/s. */
export const FAN_SPEED_PER_LEVEL = 2.5;
/** How fast a fan pulls the air in its cells toward its target velocity, 1/s. */
export const FAN_RESPONSE = 20;
/** Buoyancy (gravity on): upward acceleration per C above ambient, tiles/s^2. */
export const BUOYANCY = 0.08;
/** Vorticity confinement strength at Swirl = 1. */
export const VORTICITY_STRENGTH = 1.5;
/** Jacobi iterations for the pressure solve. */
export const PRESSURE_ITERATIONS = 30;
/** Sanity clamp for air speed, tiles/s. */
export const V_MAX = 40;

/** Sanity clamp for temperature. */
export const T_MIN = -100;
export const T_MAX = 300;

/** Explicit diffusion is stable for dt * k / h^2 <= 1/4 in 2D; stay under with margin. */
const DIFFUSION_LIMIT = 0.2;

/** Diffusion substeps needed for one step of `dt` at this sim quality (cells per tile edge). */
export function diffusionSubsteps(dt: number, quality: number): number {
  const invH2 = quality * quality;
  return Math.max(1, Math.ceil((dt * K_MAX * invH2) / DIFFUSION_LIMIT));
}
