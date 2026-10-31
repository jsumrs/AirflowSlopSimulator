import { type Shape, inBounds } from "../model/grid";
import { TileType } from "../model/tiles";
import type { Gesture } from "../render/selectionOverlay";
import { type View, panBy, screenToTile, zoomAt } from "../render/view";
import { lineTiles } from "./raster";

export type Tool = "pointer" | "brush" | "select";

/** What the input layer needs from the app. Keeps input/ free of UI and state libraries. */
export interface InputHost {
  view: View;
  shape(): Shape;
  activeType(): TileType;
  /** Picks a tile type and switches to the brush. */
  setActiveType(type: TileType): void;
  tool(): Tool;
  setTool(tool: Tool): void;
  /** Paint one tile. Out-of-bounds coords are the host's to ignore. */
  paint(x: number, y: number, type: TileType): void;
  /** A brush stroke begins/ends; the host groups its paints into one undo step. */
  beginStroke(): void;
  endStroke(): void;
  undo(): void;
  redo(): void;
  /** Click without drag. */
  select(x: number, y: number): void;
  /** Hovered tile, or (-1, -1). */
  hover(x: number, y: number): void;
  fit(): void;
  requestRender(): void;
  /** Tap of Space (no drag). */
  togglePlay(): void;
  /** `.`: advance one frame while paused. */
  step(): void;

  // --- Select tool ---
  /** Drag state shared with the overlay. Input mutates it; the host never replaces it. */
  gesture: Gesture;
  hasSelection(): boolean;
  inSelection(x: number, y: number): boolean;
  commitMarquee(x0: number, y0: number, x1: number, y1: number, mode: Gesture["mode"]): void;
  /** Drag the selection: lift it, offset it by whole tiles, then drop (commit) or cancel. */
  beginMove(): boolean;
  moveBy(dx: number, dy: number): void;
  endMove(commit: boolean): void;
  isPasting(): boolean;
  placePaste(): void;
  cancelPaste(): void;
  clearSelection(): void;
  copy(): void;
  cut(): void;
  paste(): void;
  transform(op: "cw" | "ccw"): void;
  /** E / Q: rotate the selection 90 degrees (Select tool), or turn the hovered / selected fans 45 degrees. */
  rotate(clockwise: boolean): void;
  /** True if hovered or selected tiles include a fan, heater or window to adjust. */
  hasObjectTarget(): boolean;
  /** [ ] and Ctrl+scroll: fan level / heater target; `secondary` (Shift): sweep speed / output rate. */
  adjust(secondary: boolean, step: 1 | -1): void;
  /** O: fan oscillation, window open/closed. */
  toggleObject(): void;
}

/**
 * Text fields and dropdowns swallow keys. A focused slider keeps only its arrow keys.
 * Buttons and checkboxes swallow nothing, so hotkeys work after clicking them.
 */
function ignoresKey(e: KeyboardEvent): boolean {
  const t = e.target;
  if (t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement) return true;
  if (t instanceof HTMLInputElement) {
    if (t.type === "checkbox" || t.type === "button") return false;
    if (t.type === "range") return e.key.startsWith("Arrow") || e.key === "Home" || e.key === "End";
    return true;
  }
  return false;
}

const WHEEL_STEP = 50;
const DRAG_THRESHOLD = 4; // CSS px before a pointer-tool press becomes a pan

/** Brush tool, pan/zoom, and key shortcuts. Returns a detach function. */
export function attachCanvasInput(canvas: HTMLCanvasElement, host: InputHost): () => void {
  const tmp = [0, 0];
  let mode: "none" | "paint" | "pan" | "press" | "marquee" | "move" = "none";
  let wheelAcc = 0;
  let pressX = 0;
  let pressY = 0;
  let paintType = TileType.Air;
  let button = 0;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let moved = false;
  let panX = 0;
  let panY = 0;
  let space = false;
  /** Space was used to pan during this press, so its release is not a play/pause tap. */
  let spacePanned = false;

  const local = (e: { clientX: number; clientY: number }) => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };
  const tileAt = (sx: number, sy: number) => {
    screenToTile(host.view, sx, sy, tmp);
    return [Math.floor(tmp[0]!), Math.floor(tmp[1]!)] as const;
  };
  const paint = (x: number, y: number) => host.paint(x, y, paintType);
  const clampTile = (t: number, max: number) => Math.min(max - 1, Math.max(0, t));
  const modeFor = (e: { shiftKey: boolean; altKey: boolean; ctrlKey: boolean; metaKey: boolean }): Gesture["mode"] =>
    e.altKey || e.ctrlKey || e.metaKey ? "subtract" : e.shiftKey ? "add" : "replace";
  const endGesture = () => {
    host.gesture.kind = "none";
    host.requestRender();
  };
  const cancelGesture = () => {
    if (mode === "move") host.endMove(false);
    if (mode === "marquee" || mode === "move") {
      mode = "none";
      endGesture();
      updateCursor();
    }
  };
  const updateCursor = () => {
    const t = host.tool();
    canvas.style.cursor =
      mode === "pan" ? "grabbing"
      : space ? "grab"
      : mode === "move" ? "move"
      : t === "brush" || t === "select" ? "crosshair"
      : "default";
  };

  const onPointerDown = (e: PointerEvent) => {
    if (mode !== "none") return;
    e.preventDefault();
    const [sx, sy] = local(e);
    button = e.button;
    if (e.button === 1 || (e.button === 0 && space)) {
      if (space) spacePanned = true;
      mode = "pan";
      panX = sx;
      panY = sy;
    } else if (host.isPasting()) {
      if (e.button === 0) host.placePaste();
      else if (e.button === 2) host.cancelPaste();
      return;
    } else if (host.tool() === "select") {
      if (e.button !== 0) return;
      const [tx, ty] = tileAt(sx, sy);
      const plain = !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey;
      if (!inBounds(host.shape(), tx, ty)) {
        if (plain) host.clearSelection();
        return;
      }
      startX = tx;
      startY = ty;
      if (plain && host.inSelection(tx, ty) && host.beginMove()) {
        mode = "move";
      } else {
        mode = "marquee";
        const g = host.gesture;
        g.kind = "marquee";
        g.x0 = g.x1 = tx;
        g.y0 = g.y1 = ty;
        g.mode = modeFor(e);
        host.requestRender();
      }
    } else if (host.tool() === "pointer") {
      // Click selects, drag pans.
      if (e.button !== 0) return;
      mode = "press";
      pressX = panX = sx;
      pressY = panY = sy;
      const [tx, ty] = tileAt(sx, sy);
      startX = tx;
      startY = ty;
    } else if (e.button === 0 || e.button === 2) {
      const [tx, ty] = tileAt(sx, sy);
      if (!inBounds(host.shape(), tx, ty)) return;
      mode = "paint";
      host.beginStroke();
      paintType = e.button === 2 ? TileType.Air : host.activeType();
      startX = lastX = tx;
      startY = lastY = ty;
      moved = false;
      paint(tx, ty);
    } else {
      return;
    }
    canvas.setPointerCapture(e.pointerId);
    updateCursor();
  };

  const onPointerMove = (e: PointerEvent) => {
    const [sx, sy] = local(e);
    if (mode === "press" && Math.hypot(sx - pressX, sy - pressY) > DRAG_THRESHOLD) {
      mode = "pan";
      updateCursor();
    }
    if (mode === "pan") {
      panBy(host.view, host.shape(), canvas.clientWidth, canvas.clientHeight, sx - panX, sy - panY);
      panX = sx;
      panY = sy;
      host.requestRender();
      return;
    }
    const [tx, ty] = tileAt(sx, sy);
    if (mode === "marquee") {
      const g = host.gesture;
      g.x1 = clampTile(tx, host.shape()[0]!);
      g.y1 = clampTile(ty, host.shape()[1]!);
      host.requestRender();
    } else if (mode === "move") {
      host.moveBy(tx - startX, ty - startY);
    }
    if (mode === "paint") {
      if (tx !== lastX || ty !== lastY) {
        if (tx !== startX || ty !== startY) moved = true;
        lineTiles(lastX, lastY, tx, ty, paint);
        lastX = tx;
        lastY = ty;
      }
    }
    if (inBounds(host.shape(), tx, ty)) host.hover(tx, ty);
    else host.hover(-1, -1);
  };

  const onPointerUp = (e: PointerEvent) => {
    if (mode === "none") return;
    if (mode === "marquee") {
      const g = host.gesture;
      host.commitMarquee(g.x0, g.y0, g.x1, g.y1, g.mode);
      endGesture();
    } else if (mode === "move") {
      const [tx, ty] = tileAt(...local(e));
      if (tx === startX && ty === startY) {
        // A click inside the selection, not a drag: collapse to that tile.
        host.endMove(false);
        host.commitMarquee(startX, startY, startX, startY, "replace");
      } else {
        host.endMove(true);
      }
    }
    if (mode === "paint") host.endStroke();
    if (mode === "paint" && !moved && button === 0) host.select(startX, startY);
    if (mode === "press") {
      if (inBounds(host.shape(), startX, startY)) host.select(startX, startY);
      else host.select(-1, -1);
    }
    mode = "none";
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    updateCursor();
  };

  const onPointerLeave = () => {
    if (mode === "none") host.hover(-1, -1);
  };

  const onWheel = (e: WheelEvent) => {
    // Non-passive so Ctrl+wheel (trackpad pinch) doesn't zoom the page.
    e.preventDefault();
    const [sx, sy] = local(e);
    const lines = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
    const vw = canvas.clientWidth;
    const vh = canvas.clientHeight;
    if (e.ctrlKey && host.hasObjectTarget()) {
      // Ctrl+scroll adjusts the hovered / selected fan or heater instead of zooming.
      // Shift can move the wheel delta to the x axis. One step per ~50 px, so trackpads don't race.
      const d = (e.deltaY || e.deltaX) * lines;
      if (Math.sign(d) !== Math.sign(wheelAcc)) wheelAcc = 0;
      wheelAcc += d;
      while (Math.abs(wheelAcc) >= WHEEL_STEP) {
        host.adjust(e.shiftKey, wheelAcc < 0 ? 1 : -1);
        wheelAcc -= Math.sign(wheelAcc) * WHEEL_STEP;
      }
      return;
    }
    // Scrolling always zooms at the cursor; panning is drag (pointer tool), Space+drag or middle-drag.
    const k = e.ctrlKey ? 0.01 : 0.0015; // pinch events carry small deltas
    zoomAt(host.view, host.shape(), vw, vh, sx, sy, Math.exp(-(e.deltaY || e.deltaX) * lines * k));
    host.requestRender();
  };

  const KEY_PAN = 80;
  const zoomCentre = (factor: number) => {
    const vw = canvas.clientWidth;
    const vh = canvas.clientHeight;
    zoomAt(host.view, host.shape(), vw, vh, vw / 2, vh / 2, factor);
    host.requestRender();
  };
  const keyPan = (dx: number, dy: number) => {
    panBy(host.view, host.shape(), canvas.clientWidth, canvas.clientHeight, dx, dy);
    host.requestRender();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (ignoresKey(e)) return;
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === "z") {
        e.preventDefault();
        if (e.shiftKey) host.redo();
        else host.undo();
      } else if (key === "y") {
        e.preventDefault();
        host.redo();
      } else if (key === "c" && host.hasSelection()) {
        e.preventDefault();
        host.copy();
      } else if (key === "x" && host.hasSelection()) {
        e.preventDefault();
        host.cut();
      } else if (key === "v") {
        e.preventDefault();
        host.paste();
      }
      return;
    }
    if (e.code === "Space") {
      e.preventDefault();
      if (!space) {
        space = true;
        spacePanned = false;
        updateCursor();
      }
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    const bracket = e.code === "BracketLeft" ? -1 : e.code === "BracketRight" ? 1 : 0;
    if (k === "escape" && (mode === "marquee" || mode === "move")) {
      cancelGesture();
    } else if (k === "escape" && host.isPasting()) {
      host.cancelPaste();
    } else if (k === "escape" && host.tool() === "select" && host.hasSelection()) {
      host.clearSelection();
    } else if (k === "escape" && host.tool() === "pointer") {
      host.select(-1, -1); // Esc in the pointer tool clears the selection
    } else if (k === "escape" || k === "v") {
      host.setTool("pointer");
    } else if (bracket !== 0) {
      e.preventDefault();
      host.adjust(e.shiftKey, bracket as 1 | -1);
    } else if (k === "e" || k === "q") {
      host.rotate(k === "e");
    } else if (k === "o") {
      host.toggleObject();
    } else if (k === "s") {
      host.setTool(host.tool() === "select" ? "pointer" : "select");
    } else if (k === "b") {
      // Toggle: B again goes back to the pointer.
      host.setTool(host.tool() === "brush" ? "pointer" : "brush");
    } else if (k >= "1" && k <= "5") {
      const type = (Number(k) - 1) as TileType;
      // Pressing the active brush's number again drops back to the pointer.
      if (host.tool() === "brush" && host.activeType() === type) host.setTool("pointer");
      else host.setActiveType(type);
    } else if (k === ".") {
      host.step();
    } else if (k === "0" || k === "home") {
      e.preventDefault();
      host.fit();
    } else if (k === "arrowleft") {
      e.preventDefault();
      keyPan(KEY_PAN, 0);
    } else if (k === "arrowright") {
      e.preventDefault();
      keyPan(-KEY_PAN, 0);
    } else if (k === "arrowup") {
      e.preventDefault();
      keyPan(0, KEY_PAN);
    } else if (k === "arrowdown") {
      e.preventDefault();
      keyPan(0, -KEY_PAN);
    } else if (k === "=" || k === "+") {
      zoomCentre(1.25);
    } else if (k === "-" || k === "_") {
      zoomCentre(0.8);
    }
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.code === "Space") {
      if (space && !spacePanned && mode !== "pan") host.togglePlay();
      space = false;
      updateCursor();
    }
  };

  const onBlur = () => {
    space = false;
    updateCursor();
  };

  const noMenu = (e: Event) => e.preventDefault();
  // Stops middle-click autoscroll / primary-selection paste.
  const noMiddle = (e: MouseEvent) => {
    if (e.button === 1) e.preventDefault();
  };

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("wheel", onWheel, { passive: false });
  canvas.addEventListener("contextmenu", noMenu);
  canvas.addEventListener("mousedown", noMiddle);
  canvas.addEventListener("auxclick", noMiddle);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  window.addEventListener("blur", onBlur);
  updateCursor();

  return () => {
    canvas.removeEventListener("pointerdown", onPointerDown);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerup", onPointerUp);
    canvas.removeEventListener("pointercancel", onPointerUp);
    canvas.removeEventListener("pointerleave", onPointerLeave);
    canvas.removeEventListener("wheel", onWheel);
    canvas.removeEventListener("contextmenu", noMenu);
    canvas.removeEventListener("mousedown", noMiddle);
    canvas.removeEventListener("auxclick", noMiddle);
    window.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("keyup", onKeyUp);
    window.removeEventListener("blur", onBlur);
  };
}
