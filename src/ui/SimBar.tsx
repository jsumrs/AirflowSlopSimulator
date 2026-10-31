import type { Settings } from "../model/settings";
import { keepFocus } from "./focus";
import {
  SPEEDS,
  heatRange,
  playing,
  resetSim,
  setAutoScale,
  setGravity,
  setOverlay,
  setSimQuality,
  setSwirl,
  settings,
  speed,
  stepSim,
  togglePlay,
} from "./store";

const QUALITIES: readonly Settings["simQuality"][] = [1, 2, 4];

function speedLabel(s: number): string {
  return s === 0.25 ? "¼×" : s === 0.5 ? "½×" : `${s}×`;
}

function OverlayToggle({ name, label, title }: { name: keyof Settings["overlays"]; label: string; title?: string }) {
  return (
    <label title={title}>
      <input
        type="checkbox"
        checked={settings.value.overlays[name]}
        onChange={(e) => {
          setOverlay(name, e.currentTarget.checked);
          e.currentTarget.blur();
        }}
      />
      {label}
    </label>
  );
}

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

/** Playback controls, heat map toggles and legend, under the canvas. */
export function SimBar() {
  const s = settings.value;
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
      <div class="group" role="radiogroup" aria-label="Sim speed" title="Sim speed">
        <span class="label">Speed</span>
        {SPEEDS.map((v) => (
          <button
            key={v}
            class={speed.value === v ? "active" : ""}
            role="radio"
            aria-checked={speed.value === v}
            onMouseDown={keepFocus}
            onClick={() => (speed.value = v)}
          >
            {speedLabel(v)}
          </button>
        ))}
      </div>
      <div
        class="group"
        role="radiogroup"
        aria-label="Sim quality"
        title="Sim cells per tile edge. Higher looks smoother and costs more."
      >
        <span class="label">Quality</span>
        {QUALITIES.map((q) => (
          <button
            key={q}
            class={s.simQuality === q ? "active" : ""}
            role="radio"
            aria-checked={s.simQuality === q}
            onMouseDown={keepFocus}
            onClick={() => setSimQuality(q)}
          >
            {q}×
          </button>
        ))}
      </div>
      <OverlayToggle name="heatMap" label="Heat map" />
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
      <OverlayToggle name="arrows" label="Arrows" title="One arrow per tile: air speed and direction" />
      <OverlayToggle name="particles" label="Particles" title="Dots that drift with the air" />
      <OverlayToggle name="streamlines" label="Streamlines" title="Curves that follow the air" />
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
    </div>
  );
}
