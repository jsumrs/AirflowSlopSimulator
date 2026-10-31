/**
 * Changed-tile tracker for one consumer (renderer, solver). Each consumer
 * gets its own, so draining one doesn't hide changes from the others.
 */
export class DirtyTracker {
  private flags: Uint8Array;
  private list: number[] = [];
  private all = true;

  constructor(count: number) {
    this.flags = new Uint8Array(count);
  }

  /** New tile count: everything is dirty. */
  reset(count: number): void {
    this.flags = new Uint8Array(count);
    this.list.length = 0;
    this.all = true;
  }

  get count(): number {
    return this.list.length;
  }

  mark(i: number): void {
    if (this.flags[i]) return;
    this.flags[i] = 1;
    this.list.push(i);
  }

  markAll(): void {
    this.all = true;
  }

  /** True once if everything needs re-uploading; clears the per-tile list. */
  consumeAll(): boolean {
    if (!this.all) return false;
    this.all = false;
    this.flags.fill(0);
    this.list.length = 0;
    return true;
  }

  /** Calls `cb` for each changed tile index, then clears the list. */
  drain(cb: (index: number) => void): void {
    for (let k = 0; k < this.list.length; k++) {
      const i = this.list[k]!;
      this.flags[i] = 0;
      cb(i);
    }
    this.list.length = 0;
  }
}
