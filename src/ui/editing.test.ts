import { beforeEach, describe, expect, it } from "vitest";
import { tileIndex } from "../model/grid";
import { Direction, TileType } from "../model/tiles";
import {
  clearLayout, commitMarquee, copySelection, cutSelection, endMove,
  beginMove, moveBy, hover, hoverTile, layout, tool, placePaste, redo,
  resizeGrid, rotateAction, selection, startPaste, toggleTargets, adjustTargets, transform, undo,
  updateFans, setSelection, paintTile,
} from "./store";

const at = (x: number, y: number) => tileIndex(layout.shape, x, y);


describe("editing actions", () => {
  beforeEach(() => {
    for (let i = 0; i < 40; i++) undo();
    resizeGrid(8, 8);
    for (let i = 0; i < layout.types.length; i++) layout.types[i] = 0;
    layout.fans.clear(); layout.heaters.clear(); layout.windows.clear();
    setSelection(new Set());
    hover[0] = hover[1] = -1;
    hoverTile.value = null;
  });

  it("selects, subtracts and deletes with undo", () => {
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) paintTile(x, y, TileType.Wall);
    commitMarquee(0, 0, 3, 3, "replace");
    expect(selection.value.size).toBe(16);
    commitMarquee(0, 0, 1, 3, "subtract");
    expect(selection.value.size).toBe(8);
    cutSelection();
    expect(layout.typeAt(at(3, 3))).toBe(TileType.Air);
    expect(layout.typeAt(at(0, 0))).toBe(TileType.Wall);
    undo();
    expect(layout.typeAt(at(3, 3))).toBe(TileType.Wall);
  });

  it("moves a selection and clamps to the grid", () => {
    paintTile(1, 1, TileType.Wall);
    commitMarquee(1, 1, 1, 1, "replace");
    expect(beginMove()).toBe(true);
    moveBy(100, 2);
    endMove(true);
    expect(layout.typeAt(at(1, 1))).toBe(TileType.Air);
    expect(layout.typeAt(at(7, 3))).toBe(TileType.Wall);
    expect([...selection.value]).toEqual([at(7, 3)]);
    undo();
    expect(layout.typeAt(at(1, 1))).toBe(TileType.Wall);
    expect(layout.typeAt(at(7, 3))).toBe(TileType.Air);
  });

  it("rotates a selection and turns its fans", () => {
    paintTile(1, 1, TileType.Wall);
    paintTile(2, 1, TileType.Fan);
    updateFans([at(2, 1)], { dir: Direction.E });
    commitMarquee(1, 1, 2, 1, "replace");
    tool.value = "select";
    rotateAction(true);
    const fan = [...layout.fans].find(([, f]) => f)!;
    expect(fan[1].dir).toBe(Direction.S);
    expect(layout.types.filter((t) => t === TileType.Wall)).toHaveLength(1);
    expect(selection.value.size).toBe(2);
    undo();
    expect(layout.typeAt(at(2, 1))).toBe(TileType.Fan);
    expect(layout.fans.get(at(2, 1))!.dir).toBe(Direction.E);
  });

  it("copies, cuts and pastes", () => {
    paintTile(1, 1, TileType.Wall);
    commitMarquee(1, 1, 1, 1, "replace");
    copySelection();
    hover[0] = 5; hover[1] = 5;
    startPaste();
    placePaste();
    expect(layout.typeAt(at(5, 5))).toBe(TileType.Wall);
    undo();
    expect(layout.typeAt(at(5, 5))).toBe(TileType.Air);
    commitMarquee(1, 1, 1, 1, "replace");
    cutSelection();
    expect(layout.typeAt(at(1, 1))).toBe(TileType.Air);
    undo();
    expect(layout.typeAt(at(1, 1))).toBe(TileType.Wall);
  });

  it("adjusts and toggles targets in bulk", () => {
    paintTile(0, 0, TileType.Fan);
    paintTile(1, 0, TileType.Fan);
    paintTile(2, 0, TileType.Heater);
    updateFans([at(1, 0)], { level: 5 });
    commitMarquee(0, 0, 2, 0, "replace");
    adjustTargets(false, -1);
    expect(layout.fans.get(at(0, 0))!.level).toBe(2);
    expect(layout.fans.get(at(1, 0))!.level).toBe(4);
    expect(layout.heaters.get(at(2, 0))!.targetC).toBe(45);
    adjustTargets(true, 1);
    expect(layout.heaters.get(at(2, 0))!.outputRate).toBe(4);
    toggleTargets();
    expect(layout.fans.get(at(0, 0))!.oscillate).toBe(true);
    toggleTargets();
    expect(layout.fans.get(at(0, 0))!.oscillate).toBe(false);
  });

  it("clears the layout and undoes it", () => {
    paintTile(3, 3, TileType.Wall);
    clearLayout();
    expect(layout.typeAt(at(3, 3))).toBe(TileType.Air);
    undo();
    expect(layout.typeAt(at(3, 3))).toBe(TileType.Wall);
  });
});

describe("heater power", () => {
  it("toggles with O and undoes", () => {
    paintTile(0, 0, TileType.Heater);
    setSelection(new Set([at(0, 0)]));
    toggleTargets();
    expect(layout.heaters.get(at(0, 0))!.on).toBe(false);
    undo();
    expect(layout.heaters.get(at(0, 0))!.on).toBe(true);
  });
});
