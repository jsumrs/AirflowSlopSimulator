import type { Settings } from "../model/settings";
import { keepFocus } from "./focus";
import {
  setAutoScale,
  setGravity,
  setOverlay,
  setSimQuality,
  setSwirl,
  settings,
} from "./store";

const QUALITIES: readonly Settings["simQuality"][] = [1, 2, 4];

function Toggle(props: { label: string; title?: string; checked: boolean; disabled?: boolean; indent?: boolean; onChange: (v: boolean) => void }) {
  return (
    <label class={`toggle-row${props.indent ? " indent" : ""}`} title={props.title}>
      <span>{props.label}</span>
      <input
        type="checkbox"
        class="switch"
        role="switch"
        checked={props.checked}
        disabled={props.disabled}
        onChange={(e) => {
          props.onChange(e.currentTarget.checked);
          e.currentTarget.blur();
        }}
      />
    </label>
  );
}

function OverlayToggle({ name, label, title, indent }: { name: keyof Settings["overlays"]; label: string; title?: string; indent?: boolean }) {
  return (
    <Toggle
      label={label}
      title={title}
      indent={indent}
      checked={settings.value.overlays[name]}
      onChange={(on) => setOverlay(name, on)}
    />
  );
}

/** Overlays and solver settings, at the bottom of the side panel. */
export function SimSettings() {
  const s = settings.value;
  return (
    <div class="sim-settings">
      <section class="controls">
        <div class="section-head">
          <h2>Display</h2>
        </div>
        <OverlayToggle name="heatMap" label="Heat map" />
        <Toggle
          label="Auto scale"
          indent
          checked={s.heatScale.auto}
          disabled={!s.overlays.heatMap}
          onChange={setAutoScale}
        />
        <OverlayToggle name="arrows" label="Arrows" title="One arrow per tile: air speed and direction" />
        <OverlayToggle name="particles" label="Particles" title="Dots that drift with the air" />
        <OverlayToggle name="streamlines" label="Streamlines" title="Curves that follow the air" />
      </section>
      <section class="controls">
        <div class="section-head">
          <h2>Simulation</h2>
        </div>
        <div
          class="field stack-row"
          role="radiogroup"
          aria-label="Sim quality"
          title="Sim cells per tile edge. Higher looks smoother and costs more."
        >
          <span>Quality</span>
          <div class="group">
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
        </div>
        <Toggle
          label="Gravity"
          title="Side view: warm air rises, cool air sinks"
          checked={s.gravity}
          onChange={setGravity}
        />
        <label class="field stacked" title="Vorticity confinement: keeps small swirls alive">
          <span>Swirl</span>
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
      </section>
    </div>
  );
}
