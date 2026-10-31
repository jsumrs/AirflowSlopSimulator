import { afterEach, describe, expect, it, vi } from "vitest";
import { Layout } from "../model/layout";
import { Scene, type SceneSnapshot } from "../model/scene";
import { DEFAULT_SETTINGS, cloneSettings } from "../model/settings";
import { Direction, TileType } from "../model/tiles";
import { AUTOSAVE_DELAY_MS, AUTOSAVE_KEY, Autosave, loadAutosave } from "./autosave";
import { CURRENT_VERSION, SaveFormatError, parseSave, toJson } from "./format";
import { migrate } from "./migrate";

function sampleScene(): Scene {
  const scene = new Scene(new Layout([9, 6]), cloneSettings(DEFAULT_SETTINGS));
  const l = scene.layout;
  for (let x = 0; x < 9; x++) l.setTile(x, TileType.Wall);
  l.setTile(12, TileType.Fan);
  l.updateFan(12, { dir: Direction.SW, on: false, level: 4, oscillate: true, sweepSpeed: 5 });
  l.setTile(20, TileType.Heater);
  l.updateHeater(20, { targetC: 77, outputRate: 2 });
  l.setTile(30, TileType.Window);
  l.updateWindow(30, { open: true });
  scene.settings = { ...scene.settings, gravity: true, ambientC: 18.5, swirl: 0.6 };
  return scene;
}

function expectSameScene(a: SceneSnapshot, b: SceneSnapshot) {
  expect(b.layout.shape).toEqual(a.layout.shape);
  expect(Array.from(b.layout.types)).toEqual(Array.from(a.layout.types));
  const sort = <T,>(e: [number, T][]) => [...e].sort((p, q) => p[0] - q[0]);
  expect(sort(b.layout.fans)).toEqual(sort(a.layout.fans));
  expect(sort(b.layout.heaters)).toEqual(sort(a.layout.heaters));
  expect(sort(b.layout.windows)).toEqual(sort(a.layout.windows));
  expect(b.settings).toEqual(a.settings);
}

describe("save format", () => {
  it("round-trips a scene identically", () => {
    const scene = sampleScene();
    const text = toJson(scene.snapshot());
    const back = parseSave(text);
    expectSameScene(scene.snapshot(), back);
    // And the re-export is byte-identical.
    expect(toJson(back)).toBe(text);
  });

  it("round-trips an empty scene", () => {
    const scene = new Scene(new Layout([1, 1]), cloneSettings(DEFAULT_SETTINGS));
    expectSameScene(scene.snapshot(), parseSave(toJson(scene.snapshot())));
  });

  it("writes air as nothing and uses the spec's field names", () => {
    const file = JSON.parse(toJson(sampleScene().snapshot()));
    expect(file.version).toBe(CURRENT_VERSION);
    expect(file.grid).toEqual({ width: 9, height: 6 });
    expect(file.tiles).toHaveLength(9 + 3);
    expect(file.tiles).toContainEqual({
      x: 3, y: 1, type: "fan", dir: "SW", on: false, level: 4, oscillate: true, sweepSpeed: 5,
    });
  });

  it("fills in defaults for missing optional fields and clamps bad values", () => {
    const snap = parseSave(
      JSON.stringify({
        version: 1,
        grid: { width: 3, height: 3 },
        settings: { swirl: 9, simQuality: 3 },
        tiles: [{ x: 1, y: 1, type: "fan", level: 99 }, { x: 0, y: 0, type: "heater" }],
      }),
    );
    expect(snap.layout.fans[0]![1]).toMatchObject({ level: 5, on: true, dir: Direction.E });
    expect(snap.layout.heaters[0]![1]).toMatchObject({ targetC: 50 });
    expect(snap.settings.swirl).toBe(1);
    expect(snap.settings.simQuality).toBe(DEFAULT_SETTINGS.simQuality);
  });

  it("rejects bad files with readable errors", () => {
    const bad = (v: unknown) => () => parseSave(typeof v === "string" ? v : JSON.stringify(v));
    expect(bad("not json")).toThrow(SaveFormatError);
    expect(bad([])).toThrow(/not a saved layout/);
    expect(bad({ grid: { width: 3, height: 3 }, tiles: [] })).toThrow(/version/);
    expect(bad({ version: 99, grid: { width: 3, height: 3 }, tiles: [] })).toThrow(/newer version/);
    expect(bad({ version: 1, grid: { width: 0, height: 3 }, tiles: [] })).toThrow(/width/);
    expect(bad({ version: 1, grid: { width: 101, height: 3 }, tiles: [] })).toThrow(/width/);
    expect(bad({ version: 1, grid: { width: 3, height: 3 } })).toThrow(/tile list/);
    expect(bad({ version: 1, grid: { width: 3, height: 3 }, tiles: [{ x: 3, y: 0, type: "wall" }] })).toThrow(/outside/);
    expect(bad({ version: 1, grid: { width: 3, height: 3 }, tiles: [{ x: 0, y: 0, type: "lava" }] })).toThrow(/unknown type/);
  });

  it("later duplicate tiles win", () => {
    const snap = parseSave(
      JSON.stringify({
        version: 1,
        grid: { width: 2, height: 2 },
        tiles: [{ x: 0, y: 0, type: "fan" }, { x: 0, y: 0, type: "wall" }],
      }),
    );
    expect(snap.layout.types[0]).toBe(TileType.Wall);
    expect(snap.layout.fans).toHaveLength(0);
  });
});

describe("migrate", () => {
  it("runs each step in order up to the current version", () => {
    const steps = {
      1: (r: Record<string, unknown>) => ({ ...r, a: 1 }),
      2: (r: Record<string, unknown>) => ({ ...r, b: (r.a as number) + 1 }),
    };
    expect(migrate({ version: 1 }, steps, 3)).toEqual({ version: 3, a: 1, b: 2 });
    expect(migrate({ version: 2, a: 5 }, steps, 3)).toEqual({ version: 3, a: 5, b: 6 });
  });

  it("fails when a step is missing", () => {
    expect(() => migrate({ version: 1 }, {}, 2)).toThrow(/upgrade/);
  });
});

describe("autosave", () => {
  afterEach(() => vi.useRealTimers());

  function fakeStore() {
    const data = new Map<string, string>();
    return {
      data,
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
    };
  }

  it("debounces writes and restores what it wrote", () => {
    vi.useFakeTimers();
    const store = fakeStore();
    const scene = sampleScene();
    const setItem = vi.spyOn(store, "setItem");
    const auto = new Autosave(store, () => toJson(scene.snapshot()));
    auto.schedule();
    vi.advanceTimersByTime(AUTOSAVE_DELAY_MS - 1);
    auto.schedule();
    vi.advanceTimersByTime(AUTOSAVE_DELAY_MS - 1);
    expect(setItem).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(setItem).toHaveBeenCalledTimes(1);
    expectSameScene(scene.snapshot(), loadAutosave(store)!);
  });

  it("flush writes immediately, once", () => {
    vi.useFakeTimers();
    const store = fakeStore();
    const auto = new Autosave(store, () => "{}");
    auto.schedule();
    auto.flush();
    auto.flush();
    expect(store.data.get(AUTOSAVE_KEY)).toBe("{}");
  });

  it("survives missing, corrupt, and failing storage", () => {
    expect(loadAutosave(null)).toBeNull();
    expect(loadAutosave(fakeStore())).toBeNull();
    const store = fakeStore();
    store.data.set(AUTOSAVE_KEY, "{broken");
    expect(loadAutosave(store)).toBeNull();
    const full = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    };
    const auto = new Autosave(full, () => "x");
    auto.schedule();
    expect(() => auto.flush()).not.toThrow();
  });
});
