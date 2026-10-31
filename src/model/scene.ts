import { type LayoutSnapshot, Layout } from "./layout";
import { type Settings, cloneSettings } from "./settings";

export interface SceneSnapshot {
  layout: LayoutSnapshot;
  settings: Settings;
}

/** Everything that is saved and undoable: the layout plus global settings. */
export class Scene {
  constructor(
    readonly layout: Layout,
    public settings: Settings,
  ) {}

  snapshot(): SceneSnapshot {
    return { layout: this.layout.snapshot(), settings: cloneSettings(this.settings) };
  }

  restore(s: SceneSnapshot): void {
    this.layout.restore(s.layout);
    this.settings = cloneSettings(s.settings);
  }
}
