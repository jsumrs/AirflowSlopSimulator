import type { DirtyTracker } from "../model/dirty";
import type { Shape } from "../model/grid";
import type { Layout } from "../model/layout";

export type SimQuality = 1 | 2 | 4;

/** Sim grid shape: tiles x quality along every axis. */
export function simShapeFor(tileShape: Shape, quality: number): Shape {
  return tileShape.map((d) => d * quality);
}

export interface SimParams {
  ambientC: number;
  /** Side view with buoyancy (warm air rises) when true. */
  gravity: boolean;
  /** Vorticity confinement strength, 0-1. */
  swirl: number;
}

/** "temperature": 1 value per tile (C). "velocity": one value per axis per tile (tiles/s, y down). */
export type FieldName = "temperature" | "velocity";

/**
 * Simulation core. Implementations work on a generic grid shape so a 3D solver
 * can replace the 2D one without touching UI or input.
 */
export interface Solver {
  readonly tileShape: Shape;
  readonly quality: SimQuality;
  readonly simShape: Shape;

  /** New grid size or quality. Resets the fields to ambient. */
  resize(tileShape: Shape, quality: SimQuality): void;
  /** Upload changed tiles (drains `changes`). */
  setTiles(layout: Layout, changes: DirtyTracker): void;
  setParams(params: SimParams): void;
  /** Advance by `dt` sim seconds. */
  step(dt: number): void;
  /** Air and heat back to ambient. */
  reset(): void;
  /** Per-tile averages of a field, written into `out` in tile index order. */
  readField(field: FieldName, out: Float32Array): void;
  dispose(): void;
}
