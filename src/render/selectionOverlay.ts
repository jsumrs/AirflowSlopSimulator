import { type Shape, inBounds, tileCoords, tileIndex } from "../model/grid";
import { TileType } from "../model/tiles";
import type { Stamp } from "../input/stamp";
import type { View } from "./view";

/** A drag in progress with the Select tool. Written by input/, read here. */
export interface Gesture {
  kind: "none" | "marquee";
  /** Start and current tile, any order, possibly clamped to the grid. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  mode: "replace" | "add" | "subtract";
}

export interface Floating {
  stamp: Stamp | null;
  ox: number;
  oy: number;
}

export interface OverlayState {
  view: View;
  dpr: number;
  shape: Shape;
  selection: ReadonlySet<number>;
  gesture: Gesture;
  floating: Floating;
}

const TYPE_COLORS: Record<number, string> = {
  [TileType.Air]: "rgba(255,255,255,0.55)",
  [TileType.Wall]: "rgba(70,76,84,0.85)",
  [TileType.Fan]: "rgba(40,150,90,0.85)",
  [TileType.Heater]: "rgba(220,80,50,0.85)",
  [TileType.Window]: "rgba(110,190,235,0.85)",
};
const MODE_COLORS = { replace: "#1f6feb", add: "#1a9a4a", subtract: "#d03030" } as const;

/** 2D canvas stacked over the GL canvas: selection, drag previews and floating stamps. */
export class SelectionOverlay {
  private ctx: CanvasRenderingContext2D;
  private c = [0, 0, 0];

  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
  }

  draw(o: OverlayState): void {
    const { canvas, ctx } = this;
    const w = Math.round(canvas.clientWidth * o.dpr);
    const h = Math.round(canvas.clientHeight * o.dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    ctx.setTransform(o.dpr, 0, 0, o.dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    const { view } = o;
    const s = view.scale;
    const px = (tx: number) => view.x + tx * s;
    const py = (ty: number) => view.y + ty * s;

    if (o.selection.size > 0) this.drawSelection(o, px, py);

    const g = o.gesture;
    if (g.kind === "marquee") {
      const x0 = Math.min(g.x0, g.x1);
      const y0 = Math.min(g.y0, g.y1);
      const color = MODE_COLORS[g.mode];
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.15;
      ctx.fillRect(px(x0), py(y0), (Math.abs(g.x1 - g.x0) + 1) * s, (Math.abs(g.y1 - g.y0) + 1) * s);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.setLineDash([5, 3]);
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px(x0), py(y0), (Math.abs(g.x1 - g.x0) + 1) * s, (Math.abs(g.y1 - g.y0) + 1) * s);
      ctx.setLineDash([]);
    }

    const f = o.floating;
    if (f.stamp) this.drawStamp(f.stamp, f.ox, f.oy, px, py, s);
  }

  private drawSelection(o: OverlayState, px: (x: number) => number, py: (y: number) => number): void {
    const { ctx, c } = this;
    const s = o.view.scale;
    const sel = o.selection;
    ctx.fillStyle = "rgba(31,111,235,0.18)";
    ctx.strokeStyle = "#1f6feb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (const i of sel) {
      tileCoords(o.shape, i, c);
      const x = c[0]!;
      const y = c[1]!;
      ctx.fillRect(px(x), py(y), s, s);
      const has = (nx: number, ny: number) => inBounds(o.shape, nx, ny) && sel.has(tileIndex(o.shape, nx, ny));
      const l = px(x);
      const t = py(y);
      if (!has(x - 1, y)) { ctx.moveTo(l, t); ctx.lineTo(l, t + s); }
      if (!has(x + 1, y)) { ctx.moveTo(l + s, t); ctx.lineTo(l + s, t + s); }
      if (!has(x, y - 1)) { ctx.moveTo(l, t); ctx.lineTo(l + s, t); }
      if (!has(x, y + 1)) { ctx.moveTo(l, t + s); ctx.lineTo(l + s, t + s); }
    }
    ctx.stroke();
  }

  private drawStamp(
    stamp: Stamp, ox: number, oy: number,
    px: (x: number) => number, py: (y: number) => number, s: number,
  ): void {
    const { ctx } = this;
    ctx.globalAlpha = 0.7;
    for (let y = 0; y < stamp.h; y++)
      for (let x = 0; x < stamp.w; x++) {
        const t = stamp.cells[tileIndex([stamp.w, stamp.h], x, y)];
        if (!t) continue;
        ctx.fillStyle = TYPE_COLORS[t.type]!;
        ctx.fillRect(px(ox + x), py(oy + y), s, s);
        if (t.fan) {
          // A short line from the tile centre showing the facing.
          const a = (t.fan.dir * Math.PI) / 4;
          const cx = px(ox + x) + s / 2;
          const cy = py(oy + y) + s / 2;
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = Math.max(1, s / 8);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.sin(a) * s * 0.4, cy - Math.cos(a) * s * 0.4);
          ctx.stroke();
        }
      }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#1f2933";
    ctx.setLineDash([5, 3]);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(px(ox), py(oy), stamp.w * s, stamp.h * s);
    ctx.setLineDash([]);
  }
}
