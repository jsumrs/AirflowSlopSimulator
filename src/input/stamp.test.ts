import { describe, expect, it } from "vitest";
import { Layout } from "../model/layout";
import { tileIndex } from "../model/grid";
import { Direction, TileType, rotateDir } from "../model/tiles";
import { captureStamp, forEachStampTile, rectIndices, rotateStamp } from "./stamp";

describe("direction transforms", () => {
  it("rotates in 90 degree steps", () => {
    expect(rotateDir(Direction.N, true)).toBe(Direction.E);
    expect(rotateDir(Direction.N, false)).toBe(Direction.W);
    expect(rotateDir(Direction.NW, true)).toBe(Direction.NE);
  });
});

function layoutWith() {
  const l = new Layout([6, 6]);
  const a = tileIndex(l.shape, 1, 1);
  const b = tileIndex(l.shape, 3, 1);
  l.setTile(a, TileType.Wall);
  l.setTile(b, TileType.Fan);
  l.updateFan(b, { dir: Direction.E });
  return { l, a, b };
}

describe("stamps", () => {
  it("captures a bounding box with holes", () => {
    const { l, a, b } = layoutWith();
    const cap = captureStamp(l, [a, b])!;
    expect([cap.x, cap.y, cap.stamp.w, cap.stamp.h]).toEqual([1, 1, 3, 1]);
    expect(cap.stamp.cells[1]).toBeNull();
    expect(cap.stamp.cells[2]?.type).toBe(TileType.Fan);
  });
  it("rotates clockwise, turning fans", () => {
    const { l, a, b } = layoutWith();
    const r = rotateStamp(captureStamp(l, [a, b])!.stamp, true);
    expect([r.w, r.h]).toEqual([1, 3]);
    expect(r.cells[0]?.type).toBe(TileType.Wall);
    expect(r.cells[2]?.fan?.dir).toBe(Direction.S);
  });
  it("rotating cw then ccw is the identity", () => {
    const { l, a, b } = layoutWith();
    const s = captureStamp(l, [a, b])!.stamp;
    expect(rotateStamp(rotateStamp(s, true), false)).toEqual(s);
  });
  it("clips to the grid when placed", () => {
    const { l, a, b } = layoutWith();
    const s = captureStamp(l, [a, b])!.stamp;
    const hit: number[] = [];
    forEachStampTile(l.shape, s, 4, 0, (i) => hit.push(i));
    expect(hit).toEqual([tileIndex(l.shape, 4, 0)]);
  });
});

describe("rectIndices", () => {
  it("fills a rectangle given in any corner order, clipped to the grid", () => {
    expect(rectIndices([5, 5], 0, 0, 2, 2)).toHaveLength(9);
    expect(rectIndices([5, 5], 3, 3, 1, 1)).toHaveLength(9);
    expect(rectIndices([3, 3], 1, 1, 5, 5)).toHaveLength(4);
  });
});
