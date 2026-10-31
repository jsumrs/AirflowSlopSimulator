import { expect, it } from "vitest";
import { lineTiles } from "./raster";

function line(a: number, b: number, c: number, d: number) {
  const pts: [number, number][] = [];
  lineTiles(a, b, c, d, (x, y) => pts.push([x, y]));
  return pts;
}

it("includes both endpoints and has no gaps", () => {
  const pts = line(0, 0, 5, 2);
  expect(pts[0]).toEqual([0, 0]);
  expect(pts.at(-1)).toEqual([5, 2]);
  for (let i = 1; i < pts.length; i++) {
    expect(Math.abs(pts[i]![0] - pts[i - 1]![0])).toBeLessThanOrEqual(1);
    expect(Math.abs(pts[i]![1] - pts[i - 1]![1])).toBeLessThanOrEqual(1);
  }
});

it("handles a single point and reversed lines", () => {
  expect(line(3, 3, 3, 3)).toEqual([[3, 3]]);
  expect(line(4, 0, 0, 0).length).toBe(5);
});
