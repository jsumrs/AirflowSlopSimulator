import { describe, expect, it } from "vitest";
import { Layout } from "../model/layout";
import { Scene } from "../model/scene";
import { DEFAULT_SETTINGS, cloneSettings } from "../model/settings";
import { TileType } from "../model/tiles";
import { ReplaceSceneCommand, SettingsCommand, TileEditCommand } from "./commands";
import { type Command, History, MAX_DEPTH, MERGE_WINDOW_MS } from "./history";

function counter() {
  const state = { n: 0 };
  const cmd = (by: number, mergeKey?: string) => {
    const c = {
      by,
      mergeKey,
      apply() {
        state.n += this.by;
      },
      revert() {
        state.n -= this.by;
      },
      merge(next: Command) {
        this.by += (next as unknown as { by: number }).by;
      },
    };
    return c satisfies Command;
  };
  return { state, cmd };
}

describe("History", () => {
  it("undoes and redoes in order", () => {
    const h = new History();
    const { state, cmd } = counter();
    h.execute(cmd(1));
    h.execute(cmd(10));
    expect(state.n).toBe(11);
    h.undo();
    expect(state.n).toBe(1);
    h.undo();
    expect(state.n).toBe(0);
    expect(h.undo()).toBe(false);
    h.redo();
    h.redo();
    expect(state.n).toBe(11);
    expect(h.redo()).toBe(false);
  });

  it("clears redo on a new edit", () => {
    const h = new History();
    const { cmd } = counter();
    h.execute(cmd(1));
    h.undo();
    expect(h.canRedo).toBe(true);
    h.execute(cmd(2));
    expect(h.canRedo).toBe(false);
  });

  it("merges close commands with the same key into one undo step", () => {
    const h = new History();
    const { state, cmd } = counter();
    h.execute(cmd(1, "slider"), 1000);
    h.execute(cmd(1, "slider"), 1100);
    h.execute(cmd(1, "slider"), 1200);
    expect(state.n).toBe(3);
    h.undo();
    expect(state.n).toBe(0);
    expect(h.canUndo).toBe(false);
  });

  it("does not merge across the time window or different keys", () => {
    const h = new History();
    const { state, cmd } = counter();
    h.execute(cmd(1, "a"), 1000);
    h.execute(cmd(1, "a"), 1000 + MERGE_WINDOW_MS + 1);
    h.execute(cmd(1, "b"), 1000 + MERGE_WINDOW_MS + 2);
    h.undo();
    h.undo();
    h.undo();
    expect(state.n).toBe(0);
    expect(h.canUndo).toBe(false);
  });

  it("caps its depth", () => {
    const h = new History();
    const { state, cmd } = counter();
    for (let i = 0; i < MAX_DEPTH + 5; i++) h.execute(cmd(1));
    let undone = 0;
    while (h.undo()) undone++;
    expect(undone).toBe(MAX_DEPTH);
    expect(state.n).toBe(5);
  });
});

describe("commands", () => {
  const make = () => new Scene(new Layout([4, 4]), cloneSettings(DEFAULT_SETTINGS));

  it("tile edits undo and redo including settings", () => {
    const scene = make();
    const h = new History();
    const before = scene.layout.tileSnapshot(5);
    scene.layout.setTile(5, TileType.Fan);
    scene.layout.updateFan(5, { level: 5 });
    const after = scene.layout.tileSnapshot(5);
    h.record(new TileEditCommand(scene, new Map([[5, { before, after }]])));

    h.undo();
    expect(scene.layout.typeAt(5)).toBe(TileType.Air);
    expect(scene.layout.fans.has(5)).toBe(false);
    h.redo();
    expect(scene.layout.typeAt(5)).toBe(TileType.Fan);
    expect(scene.layout.fans.get(5)!.level).toBe(5);
  });

  it("merged settings edits keep the first 'before'", () => {
    const scene = make();
    const h = new History();
    scene.layout.setTile(0, TileType.Heater);
    const edit = (c: number, t: number) => {
      const before = scene.layout.tileSnapshot(0);
      scene.layout.updateHeater(0, { targetC: c });
      h.record(
        new TileEditCommand(scene, new Map([[0, { before, after: scene.layout.tileSnapshot(0) }]]), "heater:0:targetC"),
        t,
      );
    };
    edit(60, 0);
    edit(70, 100);
    edit(80, 200);
    h.undo();
    expect(scene.layout.heaters.get(0)!.targetC).toBe(50);
    h.redo();
    expect(scene.layout.heaters.get(0)!.targetC).toBe(80);
  });

  it("settings commands swap settings", () => {
    const scene = make();
    const h = new History();
    const before = cloneSettings(scene.settings);
    const after = { ...before, gravity: true };
    h.execute(new SettingsCommand(scene, before, after));
    expect(scene.settings.gravity).toBe(true);
    h.undo();
    expect(scene.settings.gravity).toBe(false);
  });

  it("replace-scene restores shape and tiles", () => {
    const scene = make();
    scene.layout.setTile(0, TileType.Wall);
    const before = scene.snapshot();
    scene.layout.resize([2, 2]);
    const after = scene.snapshot();
    const h = new History();
    h.record(new ReplaceSceneCommand(scene, before, after));
    h.undo();
    expect(scene.layout.shape).toEqual([4, 4]);
    expect(scene.layout.typeAt(0)).toBe(TileType.Wall);
    h.redo();
    expect(scene.layout.shape).toEqual([2, 2]);
  });
});
