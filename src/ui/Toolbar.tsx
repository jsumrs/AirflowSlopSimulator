import { MAX_DIM, MIN_DIM } from "../model/grid";
import { TileType } from "../model/tiles";
import type { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { EXAMPLES } from "../examples";
import { downloadText } from "./fileIO";
import { keepFocus } from "./focus";
import {
  activeType,
  canRedo,
  canUndo,
  clearLayout,
  exportJson,
  fit,
  gridShape,
  importJson,
  notice,
  redo,
  resizeGrid,
  setGridLines,
  settings,
  tool,
  undo,
} from "./store";

const PALETTE: { type: TileType; key: string; label: string }[] = [
  { type: TileType.Air, key: "1", label: "Air" },
  { type: TileType.Wall, key: "2", label: "Wall" },
  { type: TileType.Fan, key: "3", label: "Fan" },
  { type: TileType.Heater, key: "4", label: "Heater" },
  { type: TileType.Window, key: "5", label: "Window" },
];


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

/** Curved arrow, mirrored for redo. */
function ArrowIcon({ redo }: { redo?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style={redo ? { transform: "scaleX(-1)" } : undefined}>
      <path
        d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"
        fill="currentColor"
      />
    </svg>
  );
}

/** A dropdown button. Closes on an outside click or Esc; `children` gets a `close` callback. */
function Menu({ label, children }: { label: string; children: (close: () => void) => ComponentChildren }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("pointerdown", away);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", away);
      window.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <div class="menu" ref={root}>
      <button
        class={open ? "active" : ""}
        aria-haspopup="menu"
        aria-expanded={open}
        onMouseDown={keepFocus}
        onClick={() => setOpen(!open)}
      >
        {label} ▾
      </button>
      {open && (
        <div class="menu-list" role="menu">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function FileMenu() {
  const fileInput = useRef<HTMLInputElement>(null);
  return (
    <>
      <Menu label="File">
        {(close) => (
          <>
            <button
              role="menuitem"
              title="Load a layout from a JSON file"
              onMouseDown={keepFocus}
              onClick={() => {
                close();
                fileInput.current?.click();
              }}
            >
              Import…
            </button>
            <button
              role="menuitem"
              title="Download the layout as a JSON file"
              onMouseDown={keepFocus}
              onClick={() => {
                close();
                downloadText("airflow-layout.json", exportJson());
              }}
            >
              Export
            </button>
            <div class="menu-heading">Examples</div>
            {EXAMPLES.map((x) => (
              <button
                key={x.id}
                role="menuitem"
                onMouseDown={keepFocus}
                onClick={() => {
                  close();
                  importJson(x.json);
                }}
              >
                {x.name}
              </button>
            ))}
          </>
        )}
      </Menu>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={async (e) => {
          const input = e.currentTarget;
          const file = input.files?.[0];
          input.value = ""; // allow re-importing the same file
          if (!file) return;
          try {
            importJson(await file.text());
          } catch {
            notice.value = "Could not read that file.";
          }
        }}
      />
    </>
  );
}

function GridMenu() {
  return (
    <Menu label="Grid">
      {(close) => (
        <>
          <div class="menu-row">
            <span>Size</span>
            <span class="menu-dims">
              <DimInput axis={0} /> × <DimInput axis={1} />
            </span>
          </div>
          <label class="menu-row">
            <span>Grid lines</span>
            <input
              type="checkbox"
              checked={settings.value.overlays.gridLines}
              onChange={(e) => {
                setGridLines(e.currentTarget.checked);
                e.currentTarget.blur();
              }}
            />
          </label>
          <button
            role="menuitem"
            title="Fit to view (0 / Home)"
            onMouseDown={keepFocus}
            onClick={() => {
              close();
              fit();
            }}
          >
            Fit to view
          </button>
          <button
            role="menuitem"
            class="danger"
            title="Clear every tile back to air (can be undone)"
            onMouseDown={keepFocus}
            onClick={() => {
              close();
              clearLayout();
            }}
          >
            Clear grid
          </button>
        </>
      )}
    </Menu>
  );
}

export function Toolbar() {
  return (
    <div class="toolbar">
      <FileMenu />
      <GridMenu />
      <div class="group">
        <button title="Undo (Ctrl+Z)" aria-label="Undo" disabled={!canUndo()} onMouseDown={keepFocus} onClick={undo}>
          <ArrowIcon />
        </button>
        <button
          title="Redo (Ctrl+Shift+Z / Ctrl+Y)"
          aria-label="Redo"
          disabled={!canRedo()}
          onMouseDown={keepFocus}
          onClick={redo}
        >
          <ArrowIcon redo />
        </button>
      </div>
      <div class="group">
        <button
          class={tool.value === "select" ? "active" : ""}
          title="Select: drag a box. Shift adds, Alt or Ctrl subtracts (S)"
          onMouseDown={keepFocus}
          onClick={() => (tool.value = tool.peek() === "select" ? "pointer" : "select")}
        >
          <kbd>S</kbd> Select
        </button>
      </div>
      <div class="group" role="radiogroup" aria-label="Tile type">
        {PALETTE.map((p) => (
          <button
            key={p.type}
            class={tool.value !== "pointer" && activeType.value === p.type ? "active" : ""}
            title={`Brush: ${p.label} (${p.key})`}
            onMouseDown={keepFocus}
            onClick={() => {
              activeType.value = p.type;
              if (tool.peek() === "pointer") tool.value = "brush";
            }}
          >
            <kbd>{p.key}</kbd> {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
