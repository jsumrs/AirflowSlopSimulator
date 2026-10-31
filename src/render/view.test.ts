import { describe, expect, it } from "vitest";
import { MAX_SCALE, createView, fitScale, fitView, screenToTile, zoomAt } from "./view";

const shape = [64, 48];

describe("view", () => {
  it("fit centers the grid", () => {
    const v = createView();
    fitView(v, shape, 1000, 800);
    expect(v.x + (64 * v.scale) / 2).toBeCloseTo(500);
    expect(v.y + (48 * v.scale) / 2).toBeCloseTo(400);
    expect(v.fitted).toBe(true);
  });

  it("zoom keeps the tile under the cursor fixed", () => {
    const v = createView();
    fitView(v, shape, 1000, 800);
    const out = [0, 0];
    const before = [...screenToTile(v, 400, 300, out)];
    zoomAt(v, shape, 1000, 800, 400, 300, 2);
    const after = screenToTile(v, 400, 300, out);
    expect(after[0]).toBeCloseTo(before[0]!);
    expect(after[1]).toBeCloseTo(before[1]!);
    expect(v.fitted).toBe(false);
  });

  it("limits zoom between fit and max", () => {
    const v = createView();
    fitView(v, shape, 1000, 800);
    zoomAt(v, shape, 1000, 800, 500, 400, 1000);
    expect(v.scale).toBe(MAX_SCALE);
    zoomAt(v, shape, 1000, 800, 500, 400, 1e-6);
    expect(v.scale).toBeCloseTo(fitScale(shape, 1000, 800));
  });
});
