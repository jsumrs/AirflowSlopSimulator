import { describe, expect, it } from "vitest";
import { inBounds, tileCoords, tileIndex } from "./grid";
import { Layout } from "./layout";
import { Direction, TileType } from "./tiles";

describe("grid helpers", () => {
  it("round-trips index and coords", () => {
    const shape = [7, 5];
    const out = [0, 0, 0];
    for (let y = 0; y < 5; y++)
      for (let x = 0; x < 7; x++) {
        expect(tileCoords(shape, tileIndex(shape, x, y), out)).toEqual([x, y, 0]);
      }
  });
  it("checks bounds", () => {
    expect(inBounds([3, 3], 2, 2)).toBe(true);
    expect(inBounds([3, 3], 3, 0)).toBe(false);
    expect(inBounds([3, 3], -1, 0)).toBe(false);
  });
});

describe("Layout", () => {
  it("keeps settings when repainting the same type", () => {
    const l = new Layout([4, 4]);
    const i = tileIndex(l.shape, 1, 1);
    l.setTile(i, TileType.Fan);
    l.updateFan(i, { level: 5, dir: Direction.W });
    expect(l.setTile(i, TileType.Fan)).toBe(false);
    expect(l.fans.get(i)).toMatchObject({ level: 5, dir: Direction.W });
  });

  it("new tiles use last-used settings", () => {
    const l = new Layout([4, 4]);
    l.setTile(0, TileType.Heater);
    l.updateHeater(0, { targetC: 80 });
    l.setTile(1, TileType.Heater);
    expect(l.heaters.get(1)!.targetC).toBe(80);
  });

  it("keeps fan level when switched off", () => {
    const l = new Layout([4, 4]);
    l.setTile(0, TileType.Fan);
    l.updateFan(0, { level: 4 });
    l.updateFan(0, { on: false });
    expect(l.fans.get(0)).toMatchObject({ on: false, level: 4 });
  });

  it("drops settings when the type changes", () => {
    const l = new Layout([4, 4]);
    l.setTile(0, TileType.Window);
    l.setTile(0, TileType.Wall);
    expect(l.windows.has(0)).toBe(false);
  });

  it("clamps out-of-range settings", () => {
    const l = new Layout([4, 4]);
    l.setTile(0, TileType.Fan);
    l.updateFan(0, { level: 99, sweepSpeed: -3 });
    expect(l.fans.get(0)).toMatchObject({ level: 5, sweepSpeed: 1 });
    l.updateFan(0, { level: 0 });
    expect(l.fans.get(0)!.level).toBe(1);
    l.setTile(1, TileType.Heater);
    l.updateHeater(1, { targetC: 500 });
    expect(l.heaters.get(1)!.targetC).toBe(100);
  });

  it("resize keeps the top-left and drops the rest", () => {
    const l = new Layout([4, 4]);
    l.setTile(tileIndex(l.shape, 1, 1), TileType.Fan);
    l.updateFan(tileIndex(l.shape, 1, 1), { level: 4 });
    l.setTile(tileIndex(l.shape, 3, 3), TileType.Wall);
    l.resize([6, 2]);
    expect(l.types.length).toBe(12);
    const i = tileIndex(l.shape, 1, 1);
    expect(l.typeAt(i)).toBe(TileType.Fan);
    expect(l.fans.get(i)!.level).toBe(4);
    expect(l.types.filter((t) => t === TileType.Wall).length).toBe(0);
    expect(l.fans.size).toBe(1);
  });

  it("tracks dirty tiles once per consumer", () => {
    const l = new Layout([4, 4]);
    const a = l.track();
    const b = l.track();
    expect(a.consumeAll()).toBe(true);
    expect(b.consumeAll()).toBe(true);
    l.setTile(2, TileType.Wall);
    l.setTile(2, TileType.Fan);
    l.setTile(5, TileType.Wall);
    const seen: number[] = [];
    a.drain((i) => seen.push(i));
    expect(seen).toEqual([2, 5]);
    a.drain((i) => seen.push(i));
    expect(seen).toEqual([2, 5]);
    // b still sees the changes a drained.
    expect(b.count).toBe(2);
  });

  it("marks every tracker fully dirty on resize and restore", () => {
    const l = new Layout([4, 4]);
    const t = l.track();
    t.consumeAll();
    l.resize([5, 5]);
    expect(t.consumeAll()).toBe(true);
    l.restore(l.snapshot());
    expect(t.consumeAll()).toBe(true);
  });
});
