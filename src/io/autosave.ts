import type { SceneSnapshot } from "../model/scene";
import { parseSave } from "./format";

export const AUTOSAVE_KEY = "airflow.autosave";
export const AUTOSAVE_DELAY_MS = 500;

/** The subset of `Storage` we use, so tests can pass a fake. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** The autosaved scene, or null if there is none or it can't be read. */
export function loadAutosave(store: KeyValueStore | null): SceneSnapshot | null {
  if (!store) return null;
  try {
    const text = store.getItem(AUTOSAVE_KEY);
    return text ? parseSave(text) : null;
  } catch {
    return null;
  }
}

/** Debounced writer. `schedule()` after each edit; `flush()` when the page is going away. */
export class Autosave {
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private store: KeyValueStore | null,
    private getText: () => string,
    private delayMs = AUTOSAVE_DELAY_MS,
  ) {}

  schedule(): void {
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), this.delayMs);
  }

  flush(): void {
    if (this.timer === null) return;
    clearTimeout(this.timer);
    this.timer = null;
    try {
      this.store?.setItem(AUTOSAVE_KEY, this.getText());
    } catch {
      // Storage full or blocked: autosave is best effort.
    }
  }
}
