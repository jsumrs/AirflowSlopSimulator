import { describe, expect, it } from "vitest";
import type { Shape } from "../model/grid";
import { Layout } from "../model/layout";
import { CpuSim } from "./cpuReference";
import { buildProps } from "./props";

const AMB = 20;
const params = { ambientC: AMB, gravity: false, swirl: 0 };

function make(shape: Shape, quality: number): CpuSim {
  return new CpuSim(shape, quality, buildProps(new Layout(shape)), params);
}

/** Fill temperature and velocity with smooth functions of tile coordinates. */
function paint(cpu: CpuSim, temp: (x: number, y: number) => number, vel: (x: number, y: number) => [number, number]) {
  for (let y = 0; y < cpu.h; y++)
    for (let x = 0; x < cpu.w; x++) {
      const tx = (x + 0.5) / cpu.q;
      const ty = (y + 0.5) / cpu.q;
      const i = cpu.idx(x, y);
      cpu.temp[i] = temp(tx, ty);
      const [u, v] = vel(tx, ty);
      cpu.vel[i * 2] = u;
      cpu.vel[i * 2 + 1] = v;
    }
}

describe("field resampling (quality / grid changes)", () => {
  it("keeps a uniform field exactly, at every quality", () => {
    for (const [from, to] of [[1, 2], [2, 4], [4, 1], [2, 1]] as const) {
      const src = make([6, 5], from);
      paint(src, () => 42, () => [1.5, -0.5]);
      const dst = make([6, 5], to);
      dst.resampleFrom(src);
      for (const t of dst.temp) expect(t).toBeCloseTo(42, 5);
      for (let i = 0; i < dst.vel.length; i += 2) {
        expect(dst.vel[i]).toBeCloseTo(1.5, 5);
        expect(dst.vel[i + 1]).toBeCloseTo(-0.5, 5);
      }
    }
  });

  it("keeps a smooth field's shape and tile means when refining", () => {
    const src = make([10, 8], 2);
    const temp = (x: number, y: number) => 20 + 3 * x - 2 * y;
    paint(src, temp, (x) => [x * 0.1, 0]);
    const dst = make([10, 8], 4);
    dst.resampleFrom(src);
    // Away from the clamped edge cells, a linear field is reproduced exactly.
    for (let ty = 1; ty < 7; ty++)
      for (let tx = 1; tx < 9; tx++) {
        expect(dst.tileMean("temp", tx, ty)).toBeCloseTo(src.tileMean("temp", tx, ty), 4);
        expect(dst.tileMean("u", tx, ty)).toBeCloseTo(src.tileMean("u", tx, ty), 4);
      }
  });

  it("anchors at the top-left when the grid grows: old tiles keep their state, new ones are ambient", () => {
    const src = make([4, 4], 2);
    paint(src, () => 60, () => [2, 0]);
    const dst = make([7, 5], 2);
    dst.resampleFrom(src);
    expect(dst.tileMean("temp", 1, 1)).toBeCloseTo(60, 5);
    expect(dst.tileMean("u", 2, 3)).toBeCloseTo(2, 5);
    expect(dst.tileMean("temp", 5, 1)).toBe(AMB);
    expect(dst.tileMean("temp", 1, 4)).toBe(AMB);
    expect(dst.tileMean("u", 6, 4)).toBe(0);
  });

  it("drops tiles that no longer fit when the grid shrinks", () => {
    const src = make([6, 6], 2);
    paint(src, (x, y) => (x < 3 && y < 3 ? 50 : 30), () => [0, 0]);
    const dst = make([2, 2], 2);
    dst.resampleFrom(src);
    for (const t of dst.temp) expect(t).toBeCloseTo(50, 5);
  });
});
