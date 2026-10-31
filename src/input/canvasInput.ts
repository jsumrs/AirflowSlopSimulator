import { type Shape, inBounds } from "../model/grid";
import { TileType } from "../model/tiles";
import { type View, panBy, screenToTile, zoomAt } from "../render/view";
import { lineTiles } from "./raster";

export type Tool = "pointer" | "brush";

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
  /** True: plain scroll zooms (mouse). False: plain scroll pans (trackpad). Ctrl/Cmd+scroll and pinch always zoom. */
  scrollZooms(): boolean;
  fit(): void;
  requestRender(): void;
  /** Tap of Space (no drag). */
  togglePlay(): void;
  /** `.`: advance one frame while paused. */
  step(): void;
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

const DRAG_THRESHOLD = 4; // CSS px before a pointer-tool press becomes a pan

/** Brush tool, pan/zoom, and key shortcuts. Returns a detach function. */
export function attachCanvasInput(canvas: HTMLCanvasElement, host: InputHost): () => void {
  const tmp = [0, 0];
  let mode: "none" | "paint" | "pan" | "press" = "none";
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
  const updateCursor = () => {
    canvas.style.cursor =
      mode === "pan" ? "grabbing" : space ? "grab" : host.tool() === "brush" ? "crosshair" : "default";
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
    if (e.ctrlKey || e.metaKey || host.scrollZooms()) {
      const k = e.ctrlKey ? 0.01 : 0.0015; // pinch events carry small deltas
      zoomAt(host.view, host.shape(), vw, vh, sx, sy, Math.exp(-e.deltaY * lines * k));
    } else {
      panBy(host.view, host.shape(), vw, vh, -e.deltaX * lines, -e.deltaY * lines);
    }
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
    if (k === "escape" && host.tool() === "pointer") {
      host.select(-1, -1); // Esc in the pointer tool clears the selection
    } else if (k === "escape" || k === "v") {
      host.setTool("pointer");
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
