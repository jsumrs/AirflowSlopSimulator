import { keepFocus } from "./focus";
import {
  heatRange,
  playing,
  resetSim,
  setAutoScale,
  setGravity,
  setOverlay,
  setSwirl,
  settings,
  stepSim,
  togglePlay,
} from "./store";

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

/** Playback controls, heat map toggles and legend, under the canvas. */
export function SimBar() {
  const s = settings.value;
  const r = heatRange.value;
  const isPlaying = playing.value;
  return (
    <div class="simbar">
      <div class="group">
        <button
          class={isPlaying ? "active" : ""}
          title="Play / pause (tap Space)"
          onMouseDown={keepFocus}
          onClick={togglePlay}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button title="Step one frame (.)" disabled={isPlaying} onMouseDown={keepFocus} onClick={stepSim}>
          Step
        </button>
        <button
          title="Air and heat back to ambient. Keeps the layout."
          onMouseDown={keepFocus}
          onClick={resetSim}
        >
          Reset sim
        </button>
      </div>
      <label>
        <input
          type="checkbox"
          checked={s.overlays.heatMap}
          onChange={(e) => {
            setOverlay("heatMap", e.currentTarget.checked);
            e.currentTarget.blur();
          }}
        />
        Heat map
      </label>
      <label>
        <input
          type="checkbox"
          checked={s.heatScale.auto}
          disabled={!s.overlays.heatMap}
          onChange={(e) => {
            setAutoScale(e.currentTarget.checked);
            e.currentTarget.blur();
          }}
        />
        Auto scale
      </label>
      <label>
        <input
          type="checkbox"
          checked={s.overlays.arrows}
          onChange={(e) => {
            setOverlay("arrows", e.currentTarget.checked);
            e.currentTarget.blur();
          }}
        />
        Arrows
      </label>
      <label title="Side view: warm air rises, cool air sinks">
        <input
          type="checkbox"
          checked={s.gravity}
          onChange={(e) => {
            setGravity(e.currentTarget.checked);
            e.currentTarget.blur();
          }}
        />
        Gravity
      </label>
      <label class="swirl" title="Vorticity confinement: keeps small swirls alive">
        Swirl
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={s.swirl}
          onInput={(e) => setSwirl(Number(e.currentTarget.value))}
          onPointerUp={(e) => e.currentTarget.blur()}
        />
        <output>{s.swirl.toFixed(2)}</output>
      </label>
      {s.overlays.heatMap && (
        <Legend lo={r.lo} hi={r.hi} ambient={s.ambientC} auto={s.heatScale.auto} />
      )}
    </div>
  );
}
