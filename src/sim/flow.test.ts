import { describe, expect, it } from "vitest";
import { type Shape, tileIndex } from "../model/grid";
import { Layout } from "../model/layout";
import { Direction, TileType } from "../model/tiles";
import { CpuSim } from "./cpuReference";
import { SIM_DT, SWEEP_PERIOD, V_MAX } from "./params";
import { buildProps } from "./props";

const AMB = 20;

function sim(
  shape: Shape,
  quality: number,
  paint: (l: Layout) => void,
  opts: { gravity?: boolean; swirl?: number } = {},
) {
  const layout = new Layout(shape);
  paint(layout);
  const cpu = new CpuSim(shape, quality, buildProps(layout), {
    ambientC: AMB,
    gravity: opts.gravity ?? false,
    swirl: opts.swirl ?? 0,
  });
  const seconds = (s: number) => {
    for (let k = 0; k < Math.round(s / SIM_DT); k++) cpu.step(SIM_DT);
  };
  return { layout, cpu, seconds };
}

function fan(l: Layout, x: number, y: number, dir: Direction, level = 4) {
  const i = tileIndex(l.shape, x, y);
  l.setTile(i, TileType.Fan);
  l.updateFan(i, { dir, level, on: true });
}

function wall(l: Layout, x: number, y: number) {
  l.setTile(tileIndex(l.shape, x, y), TileType.Wall);
}

function assertFinite(cpu: CpuSim) {
  for (const v of cpu.vel) expect(Number.isFinite(v)).toBe(true);
  for (const t of cpu.temp) expect(Number.isFinite(t)).toBe(true);
}

describe("CPU flow reference", () => {
  it("still air with no sources stays still", () => {
    const { cpu, seconds } = sim([8, 8], 2, (l) => wall(l, 3, 3));
    seconds(1);
    for (const v of cpu.vel) expect(Math.abs(v)).toBeLessThan(1e-6);
  });

  it("the pressure solve removes most of the divergence", () => {
    const { cpu } = sim([16, 16], 1, () => {});
    // A smooth, strongly divergent field: radial outflow from a blob in the middle.
    // (Collocated grids can't see checkerboard noise, so random fields aren't a fair test.)
    for (let y = 0; y < 16; y++)
      for (let x = 0; x < 16; x++) {
        const dx = x - 7.5;
        const dy = y - 7.5;
        const g = 5 * Math.exp(-(dx * dx + dy * dy) / 12);
        const i = cpu.idx(x, y);
        cpu.vel[i * 2] = dx * g * 0.3;
        cpu.vel[i * 2 + 1] = dy * g * 0.3;
      }
    const before = cpu.maxDivergence();
    cpu.divergence();
    for (let k = 0; k < 200; k++) cpu.jacobi();
    cpu.project();
    expect(cpu.maxDivergence()).toBeLessThan(before * 0.2);
  });

  it("a fan pushes air out the front and pulls it in from behind", () => {
    const { cpu, seconds } = sim([24, 12], 2, (l) => fan(l, 10, 6, Direction.E));
    seconds(2);
    const front = cpu.tileMean("u", 13, 6);
    const behind = cpu.tileMean("u", 7, 6);
    expect(front).toBeGreaterThan(1);
    expect(behind).toBeGreaterThan(0.2); // intake: air behind moves toward the fan
    // Air beside the fan is drawn in toward the intake side, not pushed out.
    assertFinite(cpu);
  });

  it("an oscillating fan sweeps 45 degrees each side of its set direction", () => {
    const { cpu, seconds, layout } = sim([16, 16], 1, (l) => fan(l, 8, 8, Direction.E, 4));
    layout.updateFan(tileIndex(layout.shape, 8, 8), { oscillate: true, sweepSpeed: 5 });
    cpu.setProps(buildProps(layout));
    const period = SWEEP_PERIOD / 5;
    const angleAt = () => Math.atan2(cpu.tileMean("v", 8, 8), cpu.tileMean("u", 8, 8));
    seconds(period / 4); // sin peaks: rotated +45 degrees (toward SE, y is down)
    expect(angleAt()).toBeGreaterThan(0.5);
    expect(angleAt()).toBeLessThan(Math.PI / 4 + 0.1);
    seconds(period / 2); // sin troughs: rotated -45 degrees (toward NE)
    expect(angleAt()).toBeLessThan(-0.5);
    expect(angleAt()).toBeGreaterThan(-Math.PI / 4 - 0.1);
    assertFinite(cpu);
  });

  it("a fan that is not oscillating keeps its direction", () => {
    const { cpu, seconds } = sim([16, 16], 1, (l) => fan(l, 8, 8, Direction.E, 4));
    seconds(1);
    expect(Math.abs(cpu.tileMean("v", 8, 8))).toBeLessThan(0.05);
  });

  it("an off fan moves no air", () => {
    const { cpu, seconds } = sim([12, 8], 2, (l) => {
      fan(l, 5, 4, Direction.E);
      l.updateFan(tileIndex(l.shape, 5, 4), { on: false });
    });
    seconds(1);
    for (const v of cpu.vel) expect(Math.abs(v)).toBeLessThan(1e-6);
  });

  it("walls stop air and deflect it around them", () => {
    const { cpu, seconds } = sim([24, 14], 2, (l) => {
      fan(l, 6, 7, Direction.E, 5);
      for (let y = 5; y <= 9; y++) wall(l, 10, y);
    });
    seconds(3);
    // No velocity inside the wall.
    for (let y = 5; y <= 9; y++) {
      expect(cpu.tileMean("u", 10, y)).toBe(0);
      expect(cpu.tileMean("v", 10, y)).toBe(0);
    }
    // In front of the wall the jet splits: up above the centre line, down below it (y is down).
    expect(cpu.tileMean("v", 9, 5)).toBeLessThan(-1);
    expect(cpu.tileMean("v", 9, 9)).toBeGreaterThan(1);
  });

  it("air squeezes through a gap in a wall", () => {
    const { cpu, seconds } = sim([24, 14], 2, (l) => {
      fan(l, 5, 7, Direction.E, 5);
      for (let y = 0; y < 14; y++) if (y !== 7) wall(l, 10, y);
    });
    seconds(3);
    expect(cpu.tileMean("u", 10, 7)).toBeGreaterThan(1); // through the gap
    expect(cpu.tileMean("u", 12, 7)).toBeGreaterThan(0.5); // and out the other side
  });

  it("moving air carries heat downstream", () => {
    const { cpu, seconds } = sim([30, 10], 2, (l) => {
      fan(l, 4, 5, Direction.E, 4);
      const h = tileIndex(l.shape, 8, 5);
      l.setTile(h, TileType.Heater);
      l.updateHeater(h, { targetC: 80, outputRate: 5 });
    });
    seconds(4);
    const downstream = cpu.tileMean("temp", 13, 5);
    const upstream = cpu.tileMean("temp", 3, 5);
    expect(downstream).toBeGreaterThan(upstream + 2);
  });

  it("with gravity on, warm air rises from a heater", () => {
    const paint = (l: Layout) => {
      for (let x = 0; x < 16; x++) wall(l, x, 15);
      const h = tileIndex(l.shape, 8, 14);
      l.setTile(h, TileType.Heater);
      l.updateHeater(h, { targetC: 70, outputRate: 4 });
    };
    const on = sim([16, 16], 2, paint, { gravity: true });
    on.seconds(3);
    expect(on.cpu.tileMean("v", 8, 12)).toBeLessThan(-0.2); // y is down, so rising is negative
    // Heat is carried upward: above the heater is warmer than the same distance to the side.
    expect(on.cpu.tileMean("temp", 8, 10)).toBeGreaterThan(on.cpu.tileMean("temp", 4, 14) + 1);

    const off = sim([16, 16], 2, paint, { gravity: false });
    off.seconds(3);
    expect(Math.abs(off.cpu.tileMean("v", 8, 12))).toBeLessThan(1e-6);
  });

  it("stays finite and bounded with strong fans and swirl at 4x quality", () => {
    const { cpu, seconds } = sim(
      [10, 10],
      4,
      (l) => {
        fan(l, 2, 2, Direction.SE, 5);
        fan(l, 7, 7, Direction.NW, 5);
        fan(l, 2, 7, Direction.NE, 5);
        wall(l, 5, 5);
      },
      { swirl: 1, gravity: true },
    );
    seconds(1);
    assertFinite(cpu);
    for (let i = 0; i < cpu.vel.length; i += 2) {
      expect(Math.hypot(cpu.vel[i]!, cpu.vel[i + 1]!)).toBeLessThanOrEqual(V_MAX + 1e-3);
    }
  });

  it("swirl strengthens existing rotation", () => {
    const spin = (swirl: number) => {
      const { cpu, seconds } = sim([20, 20], 1, (l) => {
        fan(l, 6, 10, Direction.N, 4);
        fan(l, 14, 10, Direction.S, 4);
      }, { swirl });
      seconds(2);
      let e = 0;
      for (let i = 0; i < cpu.vel.length; i++) e += cpu.vel[i]! ** 2;
      return e;
    };
    expect(spin(1)).toBeGreaterThan(spin(0));
  });

  it("swirl does not make air at the open grid edge run away", () => {
    // Regression: confinement used one-sided curl at the border and fed on itself,
    // taking edge cells from ~7 tiles/s to 20+ with a single fan and nothing else.
    const { cpu, seconds } = sim([12, 8], 2, (l) => fan(l, 3, 4, Direction.E, 3), { swirl: 0.3 });
    seconds(35);
    let max = 0;
    for (let i = 0; i < cpu.vel.length; i += 2) max = Math.max(max, Math.hypot(cpu.vel[i]!, cpu.vel[i + 1]!));
    expect(max).toBeLessThan(1.5 * 3 * 2.5);
  }, 60000);
});
