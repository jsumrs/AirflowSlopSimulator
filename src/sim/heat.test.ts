import { describe, expect, it } from "vitest";
import { type Shape, tileIndex } from "../model/grid";
import { Layout } from "../model/layout";
import { TileType } from "../model/tiles";
import { cpuHeatStep, type HeatGrid } from "./cpuReference";
import { SIM_DT, diffusionSubsteps } from "./params";
import { buildProps } from "./props";
import { simShapeFor } from "./solver";

const AMB = 20;

function setup(shape: Shape, quality: number, paint?: (l: Layout) => void) {
  const layout = new Layout(shape);
  paint?.(layout);
  const g: HeatGrid = { tileShape: shape, quality, props: buildProps(layout) };
  const sim = simShapeFor(shape, quality);
  const n = sim[0]! * sim[1]!;
  const temp = new Float32Array(n).fill(AMB);
  const scratch = new Float32Array(n);
  const run = (steps: number) => {
    for (let s = 0; s < steps; s++) cpuHeatStep(temp, scratch, g, AMB, SIM_DT);
  };
  /** Mean temperature over one tile's cells. */
  const tileTemp = (x: number, y: number) => {
    let sum = 0;
    for (let j = 0; j < quality; j++)
      for (let i = 0; i < quality; i++) sum += temp[tileIndex(sim, x * quality + i, y * quality + j)]!;
    return sum / (quality * quality);
  };
  return { layout, sim, temp, run, tileTemp };
}

/** Walled room with its outline at `inset` tiles from the edge. */
function room(l: Layout, inset: number) {
  const [w, h] = l.shape as [number, number];
  for (let x = inset; x < w - inset; x++) {
    l.setTile(tileIndex(l.shape, x, inset), TileType.Wall);
    l.setTile(tileIndex(l.shape, x, h - 1 - inset), TileType.Wall);
  }
  for (let y = inset; y < h - inset; y++) {
    l.setTile(tileIndex(l.shape, inset, y), TileType.Wall);
    l.setTile(tileIndex(l.shape, w - 1 - inset, y), TileType.Wall);
  }
}

describe("CPU heat reference", () => {
  it("leaves a uniform ambient field unchanged", () => {
    const { temp, run } = setup([6, 5], 2, (l) => room(l, 1));
    run(10);
    for (const t of temp) expect(t).toBeCloseTo(AMB, 6);
  });

  it("conserves heat away from the edges", () => {
    const { temp, sim, run } = setup([20, 20], 1);
    temp[tileIndex(sim, 10, 10)] = 100;
    const total = () => temp.reduce((a, t) => a + (t - AMB), 0);
    const before = total();
    run(5);
    expect(total()).toBeCloseTo(before, 3);
    expect(temp[tileIndex(sim, 10, 10)]).toBeLessThan(100);
    expect(temp[tileIndex(sim, 11, 10)]).toBeGreaterThan(AMB);
  });

  it("never overshoots: values stay within the initial range at every quality", () => {
    for (const q of [1, 2, 4]) {
      const { temp, sim, run } = setup([8, 8], q, (l) => room(l, 1));
      temp[tileIndex(sim, 3 * q, 3 * q)] = 90;
      temp[tileIndex(sim, 4 * q, 4 * q)] = -10;
      run(30);
      for (const t of temp) {
        expect(t).toBeLessThanOrEqual(90 + 1e-4);
        expect(t).toBeGreaterThanOrEqual(-10 - 1e-4);
      }
    }
  });

  it("uses more diffusion substeps at higher quality", () => {
    expect(diffusionSubsteps(SIM_DT, 1)).toBe(1);
    expect(diffusionSubsteps(SIM_DT, 4)).toBeGreaterThan(1);
  });

  it("heats toward the heater's target and never above it", () => {
    const { layout, run, tileTemp } = setup([12, 12], 2, (l) => {
      room(l, 1);
      const i = tileIndex(l.shape, 6, 6);
      l.setTile(i, TileType.Heater);
      l.updateHeater(i, { targetC: 45, outputRate: 3 });
    });
    void layout;
    let peak = 0;
    for (let s = 0; s < 60; s++) {
      run(60); // one sim second per loop
      peak = Math.max(peak, tileTemp(6, 6));
    }
    expect(peak).toBeLessThanOrEqual(45 + 1e-3);
    expect(tileTemp(6, 6)).toBeGreaterThan(40);
    // The room warmed up, and it is warmer than outside.
    expect(tileTemp(3, 3)).toBeGreaterThan(AMB + 5);
    expect(tileTemp(0, 0)).toBeLessThan(tileTemp(3, 3));
  });

  it("leaks faster through a closed window than through a wall", () => {
    const hotRoom = (withWindow: boolean) => {
      const s = setup([10, 10], 2, (l) => {
        room(l, 1);
        if (withWindow) {
          l.setTile(tileIndex(l.shape, 1, 4), TileType.Window);
          l.setTile(tileIndex(l.shape, 1, 5), TileType.Window);
        }
      });
      // Fill the inside with hot air.
      for (let y = 2; y < 8; y++)
        for (let x = 2; x < 8; x++)
          for (let j = 0; j < 2; j++)
            for (let i = 0; i < 2; i++) s.temp[tileIndex(s.sim, x * 2 + i, y * 2 + j)] = 80;
      s.run(300);
      return s.tileTemp(5, 5);
    };
    const wallOnly = hotRoom(false);
    const withWindow = hotRoom(true);
    expect(withWindow).toBeLessThan(wallOnly - 1);
  });

  it("open windows leak faster than closed ones", () => {
    const leak = (open: boolean) => {
      const s = setup([10, 10], 1, (l) => {
        room(l, 1);
        const i = tileIndex(l.shape, 1, 5);
        l.setTile(i, TileType.Window);
        l.updateWindow(i, { open });
      });
      for (let y = 2; y < 8; y++) for (let x = 2; x < 8; x++) s.temp[tileIndex(s.sim, x, y)] = 80;
      s.run(300);
      return s.tileTemp(5, 5);
    };
    expect(leak(true)).toBeLessThan(leak(false));
  });

  it("fades back to ambient through the open edges", () => {
    const { temp, sim, run } = setup([6, 6], 1);
    temp.fill(70);
    run(600);
    for (const t of temp) expect(t).toBeLessThan(AMB + 1);
    expect(temp[tileIndex(sim, 0, 0)]).toBeGreaterThanOrEqual(AMB - 1e-4);
  });

  it("replaces NaN and Inf with ambient", () => {
    const { temp, sim, run } = setup([4, 4], 1);
    temp[tileIndex(sim, 1, 1)] = NaN;
    temp[tileIndex(sim, 2, 2)] = Infinity;
    run(1);
    for (const t of temp) expect(Number.isFinite(t)).toBe(true);
  });
});
