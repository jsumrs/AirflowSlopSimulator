/** An undoable change. `apply` and `revert` must be exact inverses and repeatable. */
export interface Command {
  apply(): void;
  revert(): void;
  /** Consecutive commands with the same key close together in time are merged (slider drags). */
  mergeKey?: string;
  merge?(next: Command): void;
}

export const MERGE_WINDOW_MS = 600;
export const MAX_DEPTH = 200;

interface Entry {
  cmd: Command;
  time: number;
}

export class History {
  private undoStack: Entry[] = [];
  private redoStack: Entry[] = [];

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }
  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /** Run a command and record it. */
  execute(cmd: Command, now = Date.now()): void {
    cmd.apply();
    this.record(cmd, now);
  }

  /** Record a command whose effect has already been applied (e.g. a live brush stroke). */
  record(cmd: Command, now = Date.now()): void {
    this.redoStack.length = 0;
    const last = this.undoStack[this.undoStack.length - 1];
    if (
      last &&
      cmd.mergeKey !== undefined &&
      last.cmd.mergeKey === cmd.mergeKey &&
      last.cmd.merge &&
      now - last.time < MERGE_WINDOW_MS
    ) {
      last.cmd.merge(cmd);
      last.time = now;
      return;
    }
    this.undoStack.push({ cmd, time: now });
    if (this.undoStack.length > MAX_DEPTH) this.undoStack.shift();
  }

  undo(): boolean {
    const e = this.undoStack.pop();
    if (!e) return false;
    e.cmd.revert();
    this.redoStack.push(e);
    return true;
  }

  redo(): boolean {
    const e = this.redoStack.pop();
    if (!e) return false;
    e.cmd.apply();
    this.undoStack.push(e);
    return true;
  }

  clear(): void {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
  }
}
