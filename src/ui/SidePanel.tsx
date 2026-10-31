import {
  Direction,
  FAN_LEVEL_RANGE,
  HEATER_RATE_RANGE,
  HEATER_TARGET_RANGE,
  SWEEP_SPEED_RANGE,
  TileType,
} from "../model/tiles";
import { tileCoords } from "../model/grid";
import { formatAirflow, formatTemp, tileReading } from "./readings";
import {
  layout,
  layoutRev,
  selected,
  selection,
  readingsRev,
  settings,
  updateFans,
  updateHeaters,
  updateWindows,
} from "./store";

export const TYPE_NAMES = ["Air", "Wall", "Fan", "Heater", "Window"];

/** Live readings for the selected tile: means over the tile's sim cells. */
function TileStats({ i }: { i: number }) {
  readingsRev.value; // refresh with each readback
  const [x, y] = tileCoords(layout.shape, i, [0, 0, 0]);
  const type = layout.typeAt(i);
  const r = tileReading(i);
  const ambient = settings.value.ambientC;
  const heater = type === TileType.Heater ? layout.heaters.get(i) : undefined;
  const delta = r === null ? null : r.tempC - ambient;
  return (
    <section class="stats">
      <h2>
        Tile {x}, {y}
      </h2>
      <dl>
        <dt>Type</dt>
        <dd>{TYPE_NAMES[type]}</dd>
        <dt>Temperature</dt>
        <dd>{r === null ? "—" : formatTemp(r.tempC)}</dd>
        <dt>vs outside</dt>
        <dd>{delta === null ? "—" : `${delta >= 0 ? "+" : "−"}${Math.abs(delta).toFixed(1)} °C`}</dd>
        <dt>Airflow</dt>
        <dd>{r === null ? "—" : formatAirflow(r)}</dd>
        {heater && (
          <>
            <dt>Status</dt>
            <dd>{r === null ? "—" : !heater.on ? "Off" : r.tempC < heater.targetC - 0.5 ? "Heating" : "At target"}</dd>
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
  /** Values differ across a bulk selection: show "—" instead of a number. */
  mixed?: boolean;
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
      <output>{props.mixed ? "—" : fmt(props.value)}</output>
    </label>
  );
}

/** The shared value, or null when the tiles disagree. */
function common<T>(values: T[]): T | null {
  return values.every((v) => v === values[0]) ? values[0]! : null;
}

function FanControls({ ids }: { ids: number[] }) {
  const fans = ids.map((i) => layout.fans.get(i)!);
  const dir = common(fans.map((f) => f.dir));
  const on = common(fans.map((f) => f.on));
  const level = common(fans.map((f) => f.level));
  const osc = common(fans.map((f) => f.oscillate));
  const sweep = common(fans.map((f) => f.sweepSpeed));
  return (
    <>
      <h2>{ids.length > 1 ? `Fans (${ids.length})` : "Fan"}</h2>
      <div class="field stack">
        <span>Direction</span>
        <div class="dirpad" role="radiogroup" aria-label="Direction">
          {PAD.map((d) =>
            d === null ? (
              <span key="c" class="dirpad-center" />
            ) : (
              <button
                key={d}
                class={dir === d ? "active" : ""}
                role="radio"
                aria-checked={dir === d}
                aria-label={DIR_LABELS[d]}
                title={DIR_LABELS[d]}
                onClick={() => updateFans(ids, { dir: d })}
              >
                <svg viewBox="-10 -10 20 20" width="20" height="20">
                  <path d="M-3 8 V-1 H-7 L0 -9 L7 -1 H3 V8 Z" transform={`rotate(${d * 45})`} fill="currentColor" />
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
          checked={on === true}
          indeterminate={on === null}
          onChange={(e) => updateFans(ids, { on: e.currentTarget.checked })}
        />
        <output>{on === null ? "—" : on ? "On" : "Off"}</output>
      </label>
      <Range
        label="Level"
        range={FAN_LEVEL_RANGE}
        value={level ?? fans[0]!.level}
        mixed={level === null}
        disabled={on === false}
        onChange={(v) => updateFans(ids, { level: v })}
      />
      <label class="field">
        <span>Oscillate</span>
        <input
          type="checkbox"
          checked={osc === true}
          indeterminate={osc === null}
          onChange={(e) => updateFans(ids, { oscillate: e.currentTarget.checked })}
        />
        <output>{osc === null ? "—" : ""}</output>
      </label>
      <Range
        label="Sweep speed"
        range={SWEEP_SPEED_RANGE}
        value={sweep ?? fans[0]!.sweepSpeed}
        mixed={sweep === null}
        disabled={osc === false}
        onChange={(v) => updateFans(ids, { sweepSpeed: v })}
      />
    </>
  );
}

function HeaterControls({ ids }: { ids: number[] }) {
  const hs = ids.map((i) => layout.heaters.get(i)!);
  const target = common(hs.map((h) => h.targetC));
  const rate = common(hs.map((h) => h.outputRate));
  const on = common(hs.map((h) => h.on));
  return (
    <>
      <h2>{ids.length > 1 ? `Heaters (${ids.length})` : "Heater"}</h2>
      <label class="field">
        <span>Power</span>
        <input
          type="checkbox"
          class="switch"
          role="switch"
          checked={on === true}
          indeterminate={on === null}
          onChange={(e) => updateHeaters(ids, { on: e.currentTarget.checked })}
        />
        <output>{on === null ? "—" : on ? "On" : "Off"}</output>
      </label>
      <Range
        label="Target"
        range={HEATER_TARGET_RANGE}
        value={target ?? hs[0]!.targetC}
        mixed={target === null}
        disabled={on === false}
        format={(v) => `${v} °C`}
        onChange={(v) => updateHeaters(ids, { targetC: v })}
      />
      <Range
        label="Output rate"
        range={HEATER_RATE_RANGE}
        value={rate ?? hs[0]!.outputRate}
        mixed={rate === null}
        disabled={on === false}
        onChange={(v) => updateHeaters(ids, { outputRate: v })}
      />
    </>
  );
}

function WindowControls({ ids }: { ids: number[] }) {
  const open = common(ids.map((i) => layout.windows.get(i)!.open));
  return (
    <>
      <h2>{ids.length > 1 ? `Windows (${ids.length})` : "Window"}</h2>
      <label class="field">
        <span>Open</span>
        <input
          type="checkbox"
          checked={open === true}
          indeterminate={open === null}
          onChange={(e) => updateWindows(ids, { open: e.currentTarget.checked })}
        />
        <output>{open === null ? "—" : ""}</output>
      </label>
    </>
  );
}

export function SidePanel() {
  layoutRev.value; // re-render on any layout change
  const sel = selection.value;
  const i = selected.value;

  // Several tiles selected: edit every fan, heater and window in it at once.
  if (sel.size > 1) {
    const ids = [...sel];
    const of = (t: TileType) => ids.filter((j) => layout.typeAt(j) === t);
    const fans = of(TileType.Fan);
    const heaters = of(TileType.Heater);
    const windows = of(TileType.Window);
    return (
      <aside class="panel">
        <p class="count">{sel.size} tiles selected</p>
        {fans.length > 0 && <FanControls ids={fans} />}
        {heaters.length > 0 && <HeaterControls ids={heaters} />}
        {windows.length > 0 && <WindowControls ids={windows} />}
        {fans.length + heaters.length + windows.length === 0 && (
          <p class="hint">No fans, heaters, or windows in this selection.</p>
        )}
      </aside>
    );
  }

  const type = i === null ? TileType.Air : layout.typeAt(i);
  let body = null;
  if (i !== null && type === TileType.Fan) body = <FanControls ids={[i]} />;
  else if (i !== null && type === TileType.Heater) body = <HeaterControls ids={[i]} />;
  else if (i !== null && type === TileType.Window) body = <WindowControls ids={[i]} />;
  else if (i === null) {
    body = (
      <p class="hint">
        Click any tile with the pointer (Esc) to see its stats. Fans, heaters, and windows also
        show their settings. Use Select (S) to pick several tiles and edit them together.
      </p>
    );
  }

  return (
    <aside class="panel">
      {i !== null && <TileStats i={i} />}
      {body}
    </aside>
  );
}
