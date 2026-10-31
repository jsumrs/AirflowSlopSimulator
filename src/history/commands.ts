import type { TileSnapshot } from "../model/layout";
import type { Scene, SceneSnapshot } from "../model/scene";
import { type Settings, cloneSettings } from "../model/settings";
import type { Command } from "./history";

export interface TileChange {
  before: TileSnapshot;
  after: TileSnapshot;
}

/** Changes to individual tiles: a brush stroke, or one settings edit. */
export class TileEditCommand implements Command {
  constructor(
    private scene: Scene,
    private changes: Map<number, TileChange>,
    readonly mergeKey?: string,
  ) {}

  apply(): void {
    for (const [i, c] of this.changes) this.scene.layout.setTileSnapshot(i, c.after);
  }

  revert(): void {
    for (const [i, c] of this.changes) this.scene.layout.setTileSnapshot(i, c.before);
  }

  merge(next: Command): void {
    if (!(next instanceof TileEditCommand)) return;
    for (const [i, c] of next.changes) {
      const mine = this.changes.get(i);
      if (mine) mine.after = c.after;
      else this.changes.set(i, c);
    }
  }
}

/** A change to global settings. */
export class SettingsCommand implements Command {
  private before: Settings;
  private after: Settings;

  constructor(
    private scene: Scene,
    before: Settings,
    after: Settings,
    readonly mergeKey?: string,
  ) {
    this.before = cloneSettings(before);
    this.after = cloneSettings(after);
  }

  apply(): void {
    this.scene.settings = cloneSettings(this.after);
  }

  revert(): void {
    this.scene.settings = cloneSettings(this.before);
  }

  merge(next: Command): void {
    if (next instanceof SettingsCommand) this.after = next.after;
  }
}

/** Replaces the whole scene: grid resize, clear layout, import, loading an example. */
export class ReplaceSceneCommand implements Command {
  constructor(
    private scene: Scene,
    private before: SceneSnapshot,
    private after: SceneSnapshot,
  ) {}

  apply(): void {
    this.scene.restore(this.after);
  }

  revert(): void {
    this.scene.restore(this.before);
  }
}
