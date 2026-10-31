import {
  Direction,
  FAN_LEVEL_RANGE,
  HEATER_RATE_RANGE,
  HEATER_TARGET_RANGE,
  SWEEP_SPEED_RANGE,
  TileType,
} from "../model/tiles";
import { tileCoords } from "../model/grid";
import { SimSettings } from "./SimSettings";
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
    <label class="field stacked">
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

const DEAD_ZONE = 10; // px from the centre before a drag picks a direction

/**
 * One button showing the fan's facing. Press and hold, then drag toward a direction:
 * it snaps to the nearest of 8 and updates live. A drag is one undo step (edits merge).
 * `dir` is null when a bulk selection disagrees.
 */
function DirectionDial({ dir, onChange }: { dir: Direction | null; onChange: (d: Direction) => void }) {
  const pick = (e: PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < DEAD_ZONE) return;
    const d = ((Math.round((Math.atan2(dx, -dy) * 4) / Math.PI) % 8) + 8) % 8;
    if (d !== dir) onChange(d as Direction);
  };
  const turn = (step: number) => onChange((((dir ?? 0) + step + 8) % 8) as Direction);
  return (
    <button
      class="dial"
      aria-label={`Direction: ${dir === null ? "mixed" : DIR_LABELS[dir]}. Hold and drag to change.`}
      title="Hold and drag toward a direction"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        pick(e);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) pick(e);
      }}
      onPointerUp={(e) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        e.currentTarget.blur();
      }}
      onKeyDown={(e) => {
        const step = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
        if (step === 0) return;
        e.preventDefault();
        e.stopPropagation();
        turn(step);
      }}
    >
      <svg viewBox="-20 -20 40 40" width="56" height="56" aria-hidden="true">
        {DIR_LABELS.map((_, d) => (
          <line
            key={d}
            x1="0" y1="-16" x2="0" y2={d % 2 === 0 ? "-12.5" : "-14"}
            transform={`rotate(${d * 45})`}
            stroke="currentColor" stroke-width="1.5" opacity="0.5"
          />
        ))}
        {dir !== null && (
          <path d="M-3 9 V-1 H-7 L0 -10 L7 -1 H3 V9 Z" transform={`rotate(${dir * 45})`} fill="currentColor" />
        )}
        {dir === null && <text y="4" text-anchor="middle" font-size="12" fill="currentColor">—</text>}
      </svg>
    </button>
  );
}

/** Section title with its power / open switch at the right. */
function SectionHead(props: {
  title: string;
  switchLabel: string;
  onText?: string;
  offText?: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  const { value } = props;
  return (
    <div class="section-head">
      <h2>{props.title}</h2>
      <label class="head-switch" title={props.switchLabel}>
        <span>{value === null ? "—" : value ? props.onText ?? "On" : props.offText ?? "Off"}</span>
        <input
          type="checkbox"
          class="switch"
          role="switch"
          aria-label={props.switchLabel}
          checked={value === true}
          indeterminate={value === null}
          onChange={(e) => props.onChange(e.currentTarget.checked)}
        />
      </label>
    </div>
  );
}

function FanControls({ ids }: { ids: number[] }) {
  const fans = ids.map((i) => layout.fans.get(i)!);
  const dir = common(fans.map((f) => f.dir));
  const on = common(fans.map((f) => f.on));
  const level = common(fans.map((f) => f.level));
  const osc = common(fans.map((f) => f.oscillate));
  const sweep = common(fans.map((f) => f.sweepSpeed));
  return (
    <section class="controls">
      <SectionHead
        title={ids.length > 1 ? `Fans (${ids.length})` : "Fan"}
        switchLabel="Power"
        value={on}
        onChange={(v) => updateFans(ids, { on: v })}
      />
      <div class="aim">
        <div class="stack-label">
          <span>Direction</span>
          <DirectionDial dir={dir} onChange={(d) => updateFans(ids, { dir: d })} />
        </div>
        <Range
          label="Level"
          range={FAN_LEVEL_RANGE}
          value={level ?? fans[0]!.level}
          mixed={level === null}
          disabled={on === false}
          onChange={(v) => updateFans(ids, { level: v })}
        />
      </div>
      <div class="subgroup">
        <label class="field">
          <span>Oscillate</span>
          <input
            type="checkbox"
            class="switch"
            role="switch"
            checked={osc === true}
            indeterminate={osc === null}
            onChange={(e) => updateFans(ids, { oscillate: e.currentTarget.checked })}
          />
          <output>{osc === null ? "—" : osc ? "On" : "Off"}</output>
        </label>
        <Range
          label="Sweep speed"
          range={SWEEP_SPEED_RANGE}
          value={sweep ?? fans[0]!.sweepSpeed}
          mixed={sweep === null}
          disabled={osc === false}
          onChange={(v) => updateFans(ids, { sweepSpeed: v })}
        />
      </div>
    </section>
  );
}

function HeaterControls({ ids }: { ids: number[] }) {
  const hs = ids.map((i) => layout.heaters.get(i)!);
  const target = common(hs.map((h) => h.targetC));
  const rate = common(hs.map((h) => h.outputRate));
  const on = common(hs.map((h) => h.on));
  return (
    <section class="controls">
      <SectionHead
        title={ids.length > 1 ? `Heaters (${ids.length})` : "Heater"}
        switchLabel="Power"
        value={on}
        onChange={(v) => updateHeaters(ids, { on: v })}
      />
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
    </section>
  );
}

function WindowControls({ ids }: { ids: number[] }) {
  const open = common(ids.map((i) => layout.windows.get(i)!.open));
  return (
    <section class="controls">
      <SectionHead
        title={ids.length > 1 ? `Windows (${ids.length})` : "Window"}
        switchLabel="Open"
        onText="Open"
        offText="Closed"
        value={open}
        onChange={(v) => updateWindows(ids, { open: v })}
      />
      <p class="hint">{open === null ? "Mixed." : open ? "Open: air and heat pass through." : "Closed: blocks air, leaks heat faster than a wall."}</p>
    </section>
  );
}

function SelectionPanel() {
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
      <div class="selection">
        <p class="count">{sel.size} tiles selected</p>
        {fans.length > 0 && <FanControls ids={fans} />}
        {heaters.length > 0 && <HeaterControls ids={heaters} />}
        {windows.length > 0 && <WindowControls ids={windows} />}
        {fans.length + heaters.length + windows.length === 0 && (
          <p class="hint">No fans, heaters, or windows in this selection.</p>
        )}
      </div>
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
    <div class="selection">
      {i !== null && <TileStats i={i} />}
      {body}
    </div>
  );
}

export function SidePanel() {
  return (
    <aside class="panel">
      <SelectionPanel />
      <SimSettings />
    </aside>
  );
}
