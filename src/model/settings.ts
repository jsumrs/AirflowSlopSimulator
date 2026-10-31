/** Global settings saved with a layout. Immutable by convention: replace, don't mutate. */
export interface Settings {
  ambientC: number;
  gravity: boolean;
  simQuality: 1 | 2 | 4;
  /** Vorticity confinement strength, 0-1. */
  swirl: number;
  overlays: {
    heatMap: boolean;
    arrows: boolean;
    particles: boolean;
    streamlines: boolean;
    gridLines: boolean;
  };
  heatScale: { auto: boolean; minC: number; maxC: number };
}

export const DEFAULT_SETTINGS: Readonly<Settings> = {
  ambientC: 20,
  gravity: false,
  simQuality: 2,
  swirl: 0.3,
  overlays: { heatMap: true, arrows: true, particles: true, streamlines: false, gridLines: true },
  heatScale: { auto: false, minC: 0, maxC: 100 },
};

export function cloneSettings(s: Settings): Settings {
  return { ...s, overlays: { ...s.overlays }, heatScale: { ...s.heatScale } };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function num(v: unknown, def: number, lo: number, hi: number): number {
  return typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : def;
}

function bool(v: unknown, def: boolean): boolean {
  return typeof v === "boolean" ? v : def;
}

/** Tolerant: anything missing or invalid falls back to its default, numbers are clamped. */
export function sanitizeSettings(raw: unknown): Settings {
  const d = DEFAULT_SETTINGS;
  const r = isRecord(raw) ? raw : {};
  const o = isRecord(r.overlays) ? r.overlays : {};
  const h = isRecord(r.heatScale) ? r.heatScale : {};
  const q = r.simQuality;
  const heatScale = {
    auto: bool(h.auto, d.heatScale.auto),
    minC: num(h.minC, d.heatScale.minC, -50, 200),
    maxC: num(h.maxC, d.heatScale.maxC, -50, 200),
  };
  if (heatScale.maxC <= heatScale.minC) {
    heatScale.minC = d.heatScale.minC;
    heatScale.maxC = d.heatScale.maxC;
  }
  return {
    ambientC: num(r.ambientC, d.ambientC, -50, 100),
    gravity: bool(r.gravity, d.gravity),
    simQuality: q === 1 || q === 2 || q === 4 ? q : d.simQuality,
    swirl: num(r.swirl, d.swirl, 0, 1),
    overlays: {
      heatMap: bool(o.heatMap, d.overlays.heatMap),
      arrows: bool(o.arrows, d.overlays.arrows),
      particles: bool(o.particles, d.overlays.particles),
      streamlines: bool(o.streamlines, d.overlays.streamlines),
      gridLines: bool(o.gridLines, d.overlays.gridLines),
    },
    heatScale,
  };
}
