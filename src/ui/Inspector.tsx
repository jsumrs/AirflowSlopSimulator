import { tileCoords } from "../model/grid";
import { DIR_NAMES, TileType } from "../model/tiles";
import { formatAirflow, formatTemp, tileReading } from "./readings";
import { TYPE_NAMES } from "./SidePanel";
import { hoverTile, layout, layoutRev, readingsRev } from "./store";

/** Settings summary for a fan, heater or window, or null for other tiles. */
function settingsLine(i: number): string | null {
  switch (layout.typeAt(i)) {
    case TileType.Fan: {
      const f = layout.fans.get(i);
      if (!f) return null;
      const parts = [DIR_NAMES[f.dir], f.on ? `level ${f.level}` : "off"];
      if (f.oscillate) parts.push(`oscillating, sweep ${f.sweepSpeed}`);
      return parts.join(" · ");
    }
    case TileType.Heater: {
      const h = layout.heaters.get(i);
      return h ? `target ${h.targetC} °C · output ${h.outputRate}` : null;
    }
    case TileType.Window:
      return layout.windows.get(i)?.open ? "open" : "closed";
    default:
      return null;
  }
}

/** Small readout for the tile under the cursor (SPEC section 9). */
export function Inspector() {
  const i = hoverTile.value;
  readingsRev.value;
  layoutRev.value;
  if (i === null || i >= layout.types.length) return null;
  const [x, y] = tileCoords(layout.shape, i, [0, 0, 0]);
  const r = tileReading(i);
  const extra = settingsLine(i);
  return (
    <div class="inspector" aria-live="off">
      <div class="inspector-head">
        {x}, {y} · {TYPE_NAMES[layout.typeAt(i)]}
      </div>
      <div>{r ? formatTemp(r.tempC) : "—"}</div>
      <div>{r ? formatAirflow(r) : "—"}</div>
      {extra && <div class="inspector-extra">{extra}</div>}
    </div>
  );
}
