export const CURRENT_VERSION = 2;

export class SaveFormatError extends Error {
  override name = "SaveFormatError";
}

type Migration = (raw: Record<string, unknown>) => Record<string, unknown>;

/**
 * `MIGRATIONS[n]` upgrades a version-n file to version n+1.
 * Any change to the save format bumps CURRENT_VERSION and adds an entry here.
 */
const MIGRATIONS: Record<number, Migration> = {
  // v2: heaters gained a power switch. Existing heaters were always on.
  1: (raw) => ({
    ...raw,
    tiles: Array.isArray(raw.tiles)
      ? raw.tiles.map((t: unknown) =>
          typeof t === "object" && t !== null && (t as { type?: unknown }).type === "heater"
            ? { on: true, ...t }
            : t,
        )
      : raw.tiles,
  }),
};

export function migrate(
  raw: unknown,
  migrations: Record<number, Migration> = MIGRATIONS,
  current = CURRENT_VERSION,
): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new SaveFormatError("The file is not a saved layout.");
  }
  let file = raw as Record<string, unknown>;
  let v = file.version;
  if (typeof v !== "number" || !Number.isInteger(v) || v < 1) {
    throw new SaveFormatError("The file has no valid version number.");
  }
  if (v > current) {
    throw new SaveFormatError(
      `The file is from a newer version of the simulator (format ${v}, this one reads up to ${current}).`,
    );
  }
  while (v < current) {
    const step = migrations[v];
    if (!step) throw new SaveFormatError(`No way to upgrade format ${v}.`);
    file = { ...step(file), version: v + 1 };
    v++;
  }
  return file;
}
