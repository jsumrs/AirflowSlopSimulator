import { MAX_DIM, MIN_DIM } from "../model/grid";
import { TileType } from "../model/tiles";
import {
  activeType,
  fit,
  gridShape,
  requestRender,
  resizeGrid,
  scrollMode,
  showGrid,
  tool,
} from "./store";

const PALETTE: { type: TileType; key: string; label: string }[] = [
  { type: TileType.Air, key: "1", label: "Air" },
  { type: TileType.Wall, key: "2", label: "Wall" },
  { type: TileType.Fan, key: "3", label: "Fan" },
  { type: TileType.Heater, key: "4", label: "Heater" },
  { type: TileType.Window, key: "5", label: "Window" },
];

/** Keep keyboard focus on the page so hotkeys keep working after a click. */
const keepFocus = (e: Event) => e.preventDefault();

function DimInput({ axis }: { axis: 0 | 1 }) {
  const shape = gridShape.value;
  return (
    <input
      type="number"
      min={MIN_DIM}
      max={MAX_DIM}
      value={shape[axis]}
      aria-label={axis === 0 ? "Grid width" : "Grid height"}
      onChange={(e) => {
        const el = e.currentTarget;
        const v = Number(el.value);
        const [w, h] = gridShape.value as [number, number];
        if (axis === 0) resizeGrid(v, h);
        else resizeGrid(w, v);
        el.value = String(gridShape.value[axis]);
      }}
    />
  );
}

export function Toolbar() {
  return (
    <div class="toolbar">
      <div class="group">
        <button
          class={tool.value === "pointer" ? "active" : ""}
          title="Pointer: click selects, drag pans (Esc)"
          onMouseDown={keepFocus}
          onClick={() => (tool.value = "pointer")}
        >
          <kbd>Esc</kbd> Pointer
        </button>
      </div>
      <div class="group" role="radiogroup" aria-label="Tile type">
        {PALETTE.map((p) => (
          <button
            key={p.type}
            class={tool.value === "brush" && activeType.value === p.type ? "active" : ""}
            title={`Brush: ${p.label} (${p.key})`}
            onMouseDown={keepFocus}
            onClick={() => {
              activeType.value = p.type;
              tool.value = "brush";
            }}
          >
            <kbd>{p.key}</kbd> {p.label}
          </button>
        ))}
      </div>
      <div class="group">
        <label>
          Grid <DimInput axis={0} /> × <DimInput axis={1} />
        </label>
      </div>
      <div class="group">
        <label>
          <input
            type="checkbox"
            checked={showGrid.value}
            onChange={(e) => {
              showGrid.value = e.currentTarget.checked;
              requestRender();
              e.currentTarget.blur();
            }}
          />{" "}
          Grid lines
        </label>
        <span class="label">Scroll</span>
        <span class="group">
          <button
            class={scrollMode.value === "pan" ? "active" : ""}
            title="Two-finger scroll pans; Ctrl+scroll or pinch zooms"
            onMouseDown={keepFocus}
            onClick={() => (scrollMode.value = "pan")}
          >
            Pan
          </button>
          <button
            class={scrollMode.value === "zoom" ? "active" : ""}
            title="Mouse wheel zooms at the cursor"
            onMouseDown={keepFocus}
            onClick={() => (scrollMode.value = "zoom")}
          >
            Zoom
          </button>
        </span>
        <button title="Fit to view (0 / Home)" onMouseDown={keepFocus} onClick={fit}>
          Fit
        </button>
      </div>
    </div>
  );
}
