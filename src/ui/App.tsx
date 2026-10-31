import { effect } from "@preact/signals";
import { useEffect, useRef, useState } from "preact/hooks";
import { attachCanvasInput } from "../input/canvasInput";
import { tileCoords } from "../model/grid";
import { TileType } from "../model/tiles";
import { createGlContext, resizeToDisplay } from "../render/gl";
import { type DrawOptions, TileRenderer } from "../render/tileRenderer";
import { clampView, fitView } from "../render/view";
import { SidePanel } from "./SidePanel";
import { Toolbar } from "./Toolbar";
import {
  activeType,
  ambientC,
  consumeRender,
  fit,
  hover,
  layout,
  paintTile,
  requestRender,
  selectTile,
  scrollMode,
  selected,
  showGrid,
  tool,
  view,
  viewport,
} from "./store";

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const result = createGlContext(canvas);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    const { gl } = result;
    const renderer = new TileRenderer(gl);

    const sel: [number, number] = [-1, -1];
    const coords = [0, 0, 0];
    const opts: DrawOptions = {
      view,
      dpr: 1,
      showGrid: true,
      ambientC: 20,
      selected: sel,
      hover,
    };

    const onResize = () => {
      viewport.w = canvas.clientWidth;
      viewport.h = canvas.clientHeight;
      if (view.fitted) fitView(view, layout.shape, viewport.w, viewport.h);
      else clampView(view, layout.shape, viewport.w, viewport.h);
      requestRender();
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(canvas);
    onResize();

    const detachInput = attachCanvasInput(canvas, {
      view,
      shape: () => layout.shape,
      activeType: () => activeType.value,
      setActiveType: (t: TileType) => {
        activeType.value = t;
        tool.value = "brush";
      },
      tool: () => tool.peek(),
      setTool: (t) => (tool.value = t),
      paint: paintTile,
      select: selectTile,
      hover: (x, y) => {
        if (hover[0] === x && hover[1] === y) return;
        hover[0] = x;
        hover[1] = y;
        requestRender();
      },
      scrollZooms: () => scrollMode.peek() === "zoom",
      fit,
      requestRender,
    });

    // Redraw when UI state that affects the canvas changes.
    const stopEffect = effect(() => {
      showGrid.value;
      ambientC.value;
      selected.value;
      canvas.style.cursor = tool.value === "brush" ? "crosshair" : "default";
      requestRender();
    });

    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!consumeRender()) return;
      opts.dpr = window.devicePixelRatio || 1;
      opts.showGrid = showGrid.peek();
      opts.ambientC = ambientC.peek();
      const s = selected.peek();
      if (s === null) {
        sel[0] = sel[1] = -1;
      } else {
        tileCoords(layout.shape, s, coords);
        sel[0] = coords[0]!;
        sel[1] = coords[1]!;
      }
      resizeToDisplay(gl, opts.dpr);
      renderer.sync(layout);
      renderer.draw(opts);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      stopEffect();
      detachInput();
      observer.disconnect();
    };
  }, []);

  if (error) {
    return (
      <div class="unsupported">
        <h1>Unsupported browser</h1>
        <p>
          This simulator needs WebGL2 with float render targets. {error} Try a
          recent version of Chrome, Firefox, Edge, or Safari, and make sure
          hardware acceleration is turned on.
        </p>
      </div>
    );
  }

  return (
    <div class="app">
      <Toolbar />
      <div class="main">
        <div class="viewport">
          <canvas ref={canvasRef} />
        </div>
        <SidePanel />
      </div>
    </div>
  );
}
