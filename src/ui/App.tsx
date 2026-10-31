import { effect } from "@preact/signals";
import { useEffect, useRef, useState } from "preact/hooks";
import { attachCanvasInput } from "../input/canvasInput";
import { sameShape, tileCoords, tileIndex } from "../model/grid";
import { TileType } from "../model/tiles";
import { createGlContext, resizeToDisplay } from "../render/gl";
import { type DrawOptions, TileRenderer } from "../render/tileRenderer";
import { clampView, fitView } from "../render/view";
import { GlSolver } from "../sim/glSolver";
import { MAX_STEPS_PER_FRAME, SIM_DT } from "../sim/params";
import { Inspector } from "./Inspector";
import { SimBar } from "./SimBar";
import { SidePanel } from "./SidePanel";
import { Toolbar } from "./Toolbar";
import {
  activeType,
  beginStroke,
  consumeRender,
  endStroke,
  fit,
  heatRange,
  hover,
  layout,
  notice,
  paintTile,
  playing,
  redo,
  requestRender,
  selectTile,
  scrollMode,
  selected,
  settings,
  simRequests,
  stepSim,
  readings,
  readingsRev,
  hoverTile,
  togglePlay,
  tool,
  undo,
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
    const solver = new GlSolver(gl, layout.shape, settings.peek().simQuality);
    const initial = settings.peek();
    solver.setParams({ ambientC: initial.ambientC, gravity: initial.gravity, swirl: initial.swirl });
    solver.reset();
    const solverTiles = layout.track();
    const range = { lo: 0, hi: 100 };

    const sel: [number, number] = [-1, -1];
    const coords = [0, 0, 0];
    const opts: DrawOptions = {
      view,
      dpr: 1,
      showGrid: true,
      ambientC: 20,
      heat: {
        texture: solver.temperature,
        simShape: solver.simShape,
        quality: solver.quality,
        on: true,
        lo: 0,
        hi: 100,
      },
      flow: { texture: solver.tileAverages, arrows: true },
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
      beginStroke,
      endStroke,
      undo,
      redo,
      paint: paintTile,
      select: selectTile,
      hover: (x, y) => {
        if (hover[0] === x && hover[1] === y) return;
        hover[0] = x;
        hover[1] = y;
        hoverTile.value = x < 0 ? null : tileIndex(layout.shape, x, y);
        requestRender();
      },
      scrollZooms: () => scrollMode.peek() === "zoom",
      fit,
      requestRender,
      togglePlay,
      step: stepSim,
    });

    // Redraw when UI state that affects the canvas changes.
    const stopEffect = effect(() => {
      settings.value;
      selected.value;
      playing.value;
      canvas.style.cursor = tool.value === "brush" ? "crosshair" : "default";
      requestRender();
    });

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let frameNo = 0;
    let lastRead = -Infinity;
    /** The temperature field changed since the last auto-scale readback. */
    let fieldChanged = true;
    let wasAuto = false;
    let lastSel: number | null = null;
    let lastHover: number | null = null;

    const updateRange = (lo: number, hi: number): boolean => {
      if (Math.abs(lo - range.lo) < 0.05 && Math.abs(hi - range.hi) < 0.05) return false;
      range.lo = lo;
      range.hi = hi;
      heatRange.value = { lo, hi };
      return true;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      frameNo++;
      const realDt = Math.min(0.1, Math.max(0, (now - last) / 1000));
      last = now;
      const cfg = settings.peek();

      // --- simulation ---
      if (!sameShape(solver.tileShape, layout.shape) || solver.quality !== cfg.simQuality) {
        solver.resize(layout.shape, cfg.simQuality);
        fieldChanged = true;
      }
      solver.setParams({ ambientC: cfg.ambientC, gravity: cfg.gravity, swirl: cfg.swirl });
      solver.setTiles(layout, solverTiles);
      if (simRequests.reset) {
        simRequests.reset = false;
        solver.reset();
        acc = 0;
        fieldChanged = true;
      }
      let steps = 0;
      if (playing.peek()) {
        simRequests.steps = 0;
        acc += realDt;
        while (acc >= SIM_DT && steps < MAX_STEPS_PER_FRAME) {
          solver.step(SIM_DT);
          acc -= SIM_DT;
          steps++;
        }
        if (steps === MAX_STEPS_PER_FRAME) acc = 0; // too slow: drop time rather than spiral
      } else {
        acc = 0;
        for (; simRequests.steps > 0; simRequests.steps--, steps++) solver.step(SIM_DT);
      }
      if (steps > 0) fieldChanged = true;

      // --- readback: auto heat scale, selected tile, hovered tile ---
      // A readback stalls the GPU only when the field changed since the last one, so
      // throttle those to every 6 frames; a new target reads (cached) values at once.
      let rangeChanged = false;
      const auto = cfg.heatScale.auto;
      const selIdx = selected.peek();
      const hovIdx = hoverTile.peek();
      const targetsMoved = selIdx !== lastSel || hovIdx !== lastHover;
      const wantRead = auto || selIdx !== null || hovIdx !== null;
      if (wantRead && ((fieldChanged && frameNo - lastRead >= 6) || targetsMoved || (auto && !wasAuto))) {
        solver.readField("temperature", readings.temp);
        solver.readField("velocity", readings.vel);
        readings.count = layout.types.length;
        readingsRev.value++;
        lastRead = frameNo;
        fieldChanged = false;
        if (auto) {
          let lo = Infinity;
          let hi = -Infinity;
          for (let i = 0; i < readings.count; i++) {
            const t = readings.temp[i]!;
            if (t < lo) lo = t;
            if (t > hi) hi = t;
          }
          rangeChanged = updateRange(Math.min(lo, cfg.ambientC - 2), Math.max(hi, cfg.ambientC + 2));
        }
      }
      lastSel = selIdx;
      lastHover = hovIdx;
      if (!auto) rangeChanged = updateRange(cfg.heatScale.minC, cfg.heatScale.maxC);
      wasAuto = auto;

      // --- draw ---
      if (!consumeRender() && steps === 0 && !rangeChanged) return;
      opts.dpr = window.devicePixelRatio || 1;
      opts.showGrid = cfg.overlays.gridLines;
      opts.ambientC = cfg.ambientC;
      opts.heat.texture = solver.temperature;
      opts.heat.simShape = solver.simShape;
      opts.heat.quality = solver.quality;
      opts.heat.on = cfg.overlays.heatMap;
      opts.heat.lo = range.lo;
      opts.heat.hi = range.hi;
      opts.flow.texture = solver.tileAverages;
      opts.flow.arrows = cfg.overlays.arrows;
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
      solver.dispose();
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
      {notice.value && (
        <div class="notice" role="alert">
          <span>{notice.value}</span>
          <button onClick={() => (notice.value = null)}>Dismiss</button>
        </div>
      )}
      <div class="main">
        <div class="stage">
          <div class="viewport">
            <canvas ref={canvasRef} />
            <Inspector />
          </div>
          <SimBar />
        </div>
        <SidePanel />
      </div>
    </div>
  );
}
