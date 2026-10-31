import {
  Direction,
  FAN_LEVEL_RANGE,
  HEATER_RATE_RANGE,
  HEATER_TARGET_RANGE,
  SWEEP_SPEED_RANGE,
  TileType,
} from "../model/tiles";
import { tileCoords } from "../model/grid";
import {
  layout,
  layoutRev,
  selected,
  settings,
  tileStats,
  updateFan,
  updateHeater,
  updateWindow,
} from "./store";

const TYPE_NAMES = ["Air", "Wall", "Fan", "Heater", "Window"];

/** Live readings for the selected tile. Temperature is the mean of the tile's sim cells. */
function TileStats({ i }: { i: number }) {
  const [x, y] = tileCoords(layout.shape, i, [0, 0, 0]);
  const type = layout.typeAt(i);
  const st = tileStats.value;
  const temp = st && st.index === i ? st.tempC : null;
  const ambient = settings.value.ambientC;
  const heater = type === TileType.Heater ? layout.heaters.get(i) : undefined;
  const delta = temp === null ? null : temp - ambient;
  return (
    <section class="stats">
      <h2>
        Tile {x}, {y}
      </h2>
      <dl>
        <dt>Type</dt>
        <dd>{TYPE_NAMES[type]}</dd>
        <dt>Temperature</dt>
        <dd>{temp === null ? "—" : `${temp.toFixed(1)} °C`}</dd>
        <dt>vs outside</dt>
        <dd>{delta === null ? "—" : `${delta >= 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)} °C`}</dd>
        {heater && (
          <>
            <dt>Status</dt>
            <dd>{temp === null ? "—" : temp < heater.targetC - 0.5 ? "Heating" : "At target"}</dd>
          </>
        )}
      </dl>
    </section>
  );
}

/** Direction pad layout: compass positions, centre empty. */
const PAD: (Direction | null)[] = [
  Direction.NW, Direction.N, Direction.NE,
  Direction.W, null, Direction.E,
  Direction.SW, Direction.S, Direction.SE,
];

const DIR_LABELS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

function Range(props: {
  label: string;
  range: readonly [number, number];
  value: number;
  format?: (v: number) => string;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  const fmt = props.format ?? String;
  return (
    <label class="field">
      <span>{props.label}</span>
      <input
        type="range"
        min={props.range[0]}
        max={props.range[1]}
        step={1}
        value={props.value}
        disabled={props.disabled}
        onInput={(e) => props.onChange(Number(e.currentTarget.value))}
        onPointerUp={(e) => e.currentTarget.blur()}
      />
      <output>{fmt(props.value)}</output>
    </label>
  );
}

export function SidePanel() {
  layoutRev.value; // re-render on any layout change
  const i = selected.value;
  const type = i === null ? TileType.Air : layout.typeAt(i);

  let body;
  if (i !== null && type === TileType.Fan) {
    const f = layout.fans.get(i)!;
    body = (
      <>
        <h2>Fan</h2>
        <div class="field stack">
          <span>Direction</span>
          <div class="dirpad" role="radiogroup" aria-label="Direction">
            {PAD.map((d) =>
              d === null ? (
                <span key="c" class="dirpad-center" />
              ) : (
                <button
                  key={d}
                  class={f.dir === d ? "active" : ""}
                  role="radio"
                  aria-checked={f.dir === d}
                  aria-label={DIR_LABELS[d]}
                  title={DIR_LABELS[d]}
                  onClick={() => updateFan(i, { dir: d })}
                >
                  <svg viewBox="-10 -10 20 20" width="20" height="20">
                    <path
                      d="M-3 8 V-1 H-7 L0 -9 L7 -1 H3 V8 Z"
                      transform={`rotate(${d * 45})`}
                      fill="currentColor"
                    />
                  </svg>
                </button>
              ),
            )}
          </div>
        </div>
        <label class="field">
          <span>Power</span>
          <input
            type="checkbox"
            class="switch"
            role="switch"
            checked={f.on}
            onChange={(e) => updateFan(i, { on: e.currentTarget.checked })}
          />
          <output>{f.on ? "On" : "Off"}</output>
        </label>
        <Range
          label="Level"
          range={FAN_LEVEL_RANGE}
          value={f.level}
          disabled={!f.on}
          onChange={(level) => updateFan(i, { level })}
        />
        <label class="field">
          <span>Oscillate</span>
          <input
            type="checkbox"
            checked={f.oscillate}
            onChange={(e) => updateFan(i, { oscillate: e.currentTarget.checked })}
          />
        </label>
        <Range
          label="Sweep speed"
          range={SWEEP_SPEED_RANGE}
          value={f.sweepSpeed}
          disabled={!f.oscillate}
          onChange={(sweepSpeed) => updateFan(i, { sweepSpeed })}
        />
      </>
    );
  } else if (i !== null && type === TileType.Heater) {
    const h = layout.heaters.get(i)!;
    body = (
      <>
        <h2>Heater</h2>
        <Range
          label="Target"
          range={HEATER_TARGET_RANGE}
          value={h.targetC}
          format={(v) => `${v} °C`}
          onChange={(targetC) => updateHeater(i, { targetC })}
        />
        <Range
          label="Output rate"
          range={HEATER_RATE_RANGE}
          value={h.outputRate}
          onChange={(outputRate) => updateHeater(i, { outputRate })}
        />
      </>
    );
  } else if (i !== null && type === TileType.Window) {
    const w = layout.windows.get(i)!;
    body = (
      <>
        <h2>Window</h2>
        <label class="field">
          <span>Open</span>
          <input
            type="checkbox"
            checked={w.open}
            onChange={(e) => updateWindow(i, { open: e.currentTarget.checked })}
          />
        </label>
      </>
    );
  } else {
    body =
      i === null ? (
        <p class="hint">
          Click any tile with the pointer (Esc) to see its stats. Fans, heaters, and windows also
          show their settings.
        </p>
      ) : null;
  }

  return (
    <aside class="panel">
      {i !== null && <TileStats i={i} />}
      {body}
    </aside>
  );
}
