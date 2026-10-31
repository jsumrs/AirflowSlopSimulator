import { heatRange, settings } from "./store";

const BLUE = "rgb(51, 102, 230)";
const RED = "rgb(230, 38, 26)";

function fmt(c: number, auto: boolean): string {
  return `${auto ? c.toFixed(1) : Math.round(c)} °C`;
}

function Legend({ lo, hi, ambient, auto }: { lo: number; hi: number; ambient: number; auto: boolean }) {
  const span = Math.max(hi - lo, 1e-3);
  const p = Math.min(100, Math.max(0, ((ambient - lo) / span) * 100));
  return (
    <div class="legend" aria-label={`Heat scale ${fmt(lo, auto)} to ${fmt(hi, auto)}`}>
      <div
        class="legend-bar"
        style={{ background: `linear-gradient(to right, ${BLUE} 0%, #fff ${p}%, ${RED} 100%)` }}
      />
      <div class="legend-labels">
        <span>{fmt(lo, auto)}</span>
        {p > 18 && p < 82 && (
          <span class="legend-ambient" style={{ left: `${p}%` }}>
            {fmt(ambient, false)}
          </span>
        )}
        <span>{fmt(hi, auto)}</span>
      </div>
    </div>
  );
}

/** Heat scale, floating over the bottom-right of the canvas. */
export function LegendRow() {
  const s = settings.value;
  const r = heatRange.value;
  if (!s.overlays.heatMap) return null;
  return (
    <div class="legend-float">
      <Legend lo={r.lo} hi={r.hi} ambient={s.ambientC} auto={s.heatScale.auto} />
    </div>
  );
}

