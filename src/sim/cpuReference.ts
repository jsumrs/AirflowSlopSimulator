import { type Shape, tileIndex } from "../model/grid";
import {
  BUOYANCY,
  FAN_RESPONSE,
  HEATER_POWER,
  K_OUTSIDE,
  PRESSURE_ITERATIONS,
  T_MAX,
  T_MIN,
  V_MAX,
  VORTICITY_STRENGTH,
  diffusionSubsteps,
} from "./params";
import { PROPS_STRIDE } from "./props";
import { simShapeFor } from "./solver";

/**
 * CPU reference of the full solver step, for tests. Each method mirrors one
 * shader in `shaders/` and the passes run in the same order as GlSolver.step:
 *   heat source, velocity source, advect T, advect velocity, diffuse T (substeps),
 *   vorticity (curl + confinement), divergence, Jacobi pressure, project.
 *
 * Coordinates: cell (x, y), y down. Velocity in tiles/s. Cell size h = 1/quality tiles.
 */
export interface SimParamsCpu {
  ambientC: number;
  gravity: boolean;
  swirl: number;
}

const OFFS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

const NB_OUTSIDE = -1;
const NB_SOLID = -2;

export class CpuSim {
  readonly sim: Shape;
  readonly w: number;
  readonly h: number;
  readonly q: number;
  temp: Float32Array;
  vel: Float32Array;
  pressure: Float32Array;
  private t2: Float32Array;
  private v2: Float32Array;
  private p2: Float32Array;
  private div: Float32Array;
  private curl: Float32Array;
  /** Tile props expanded to every cell (`PROPS_STRIDE` per cell), so lookups are cheap. */
  private cellProps: Float32Array;
  /** Per cell: 1 if solid. */
  private solidCell: Uint8Array;
  /** Per cell, 4 neighbours in OFFS order: cell index, or NB_OUTSIDE / NB_SOLID. */
  private nb: Int32Array;

  constructor(
    readonly tileShape: Shape,
    quality: number,
    /** `PROPS_STRIDE` floats per tile, from `buildProps`. */
    public props: Float32Array,
    public params: SimParamsCpu,
  ) {
    this.q = quality;
    this.sim = simShapeFor(tileShape, quality);
    this.w = this.sim[0]!;
    this.h = this.sim[1]!;
    const n = this.w * this.h;
    this.temp = new Float32Array(n);
    this.t2 = new Float32Array(n);
    this.vel = new Float32Array(n * 2);
    this.v2 = new Float32Array(n * 2);
    this.pressure = new Float32Array(n);
    this.p2 = new Float32Array(n);
    this.div = new Float32Array(n);
    this.curl = new Float32Array(n);
    this.cellProps = new Float32Array(n * PROPS_STRIDE);
    this.solidCell = new Uint8Array(n);
    this.nb = new Int32Array(n * 4);
    this.setProps(props);
    this.reset();
  }

  setProps(props: Float32Array): void {
    this.props = props;
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const ti = tileIndex(this.tileShape, Math.floor(x / this.q), Math.floor(y / this.q));
        this.cellProps.set(
          props.subarray(ti * PROPS_STRIDE, (ti + 1) * PROPS_STRIDE),
          this.idx(x, y) * PROPS_STRIDE,
        );
      }
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) this.solidCell[this.idx(x, y)] = this.solid(x, y) ? 1 : 0;
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const i = this.idx(x, y);
        OFFS.forEach(([dx, dy], d) => {
          const nx = x + dx;
          const ny = y + dy;
          this.nb[i * 4 + d] = this.outside(nx, ny)
            ? NB_OUTSIDE
            : this.solidCell[this.idx(nx, ny)]
              ? NB_SOLID
              : this.idx(nx, ny);
        });
      }
  }

  reset(): void {
    this.temp.fill(this.params.ambientC);
    this.vel.fill(0);
    this.pressure.fill(0);
  }

  idx(x: number, y: number): number {
    return tileIndex(this.sim, x, y);
  }

  private outside(x: number, y: number): boolean {
    return x < 0 || y < 0 || x >= this.w || y >= this.h;
  }

  private prop(x: number, y: number, field: number): number {
    return this.cellProps[this.idx(x, y) * PROPS_STRIDE + field]!;
  }

  solid(x: number, y: number): boolean {
    return this.prop(x, y, 1) > 0.5;
  }

  private sanitizeT(t: number): number {
    if (!Number.isFinite(t)) return this.params.ambientC;
    return Math.min(T_MAX, Math.max(T_MIN, t));
  }

  private swapT(): void {
    [this.temp, this.t2] = [this.t2, this.temp];
  }
  private swapV(): void {
    [this.vel, this.v2] = [this.v2, this.vel];
  }
  private swapP(): void {
    [this.pressure, this.p2] = [this.p2, this.pressure];
  }

  // --- bilinear sampling (cell centers at integer + 0.5) ---

  /** Velocity component `c` at a continuous position; taps clamp to the grid edge. */
  private sampleVel(px: number, py: number, c: number): number {
    const sx = px - 0.5;
    const sy = py - 0.5;
    const x0 = Math.floor(sx);
    const y0 = Math.floor(sy);
    const fx = sx - x0;
    const fy = sy - y0;
    const tap = (x: number, y: number) => {
      const cx = Math.min(this.w - 1, Math.max(0, x));
      const cy = Math.min(this.h - 1, Math.max(0, y));
      return this.vel[this.idx(cx, cy) * 2 + c]!;
    };
    const a = tap(x0, y0) + (tap(x0 + 1, y0) - tap(x0, y0)) * fx;
    const b = tap(x0, y0 + 1) + (tap(x0 + 1, y0 + 1) - tap(x0, y0 + 1)) * fx;
    return a + (b - a) * fy;
  }

  /** Temperature at a continuous position; taps outside the grid read ambient (open edges). */
  private sampleTemp(px: number, py: number): number {
    const sx = px - 0.5;
    const sy = py - 0.5;
    const x0 = Math.floor(sx);
    const y0 = Math.floor(sy);
    const fx = sx - x0;
    const fy = sy - y0;
    const tap = (x: number, y: number) =>
      this.outside(x, y) ? this.params.ambientC : this.temp[this.idx(x, y)]!;
    const a = tap(x0, y0) + (tap(x0 + 1, y0) - tap(x0, y0)) * fx;
    const b = tap(x0, y0 + 1) + (tap(x0 + 1, y0 + 1) - tap(x0, y0 + 1)) * fx;
    return a + (b - a) * fy;
  }

  // --- passes ---

  /** heatSource.frag */
  heatSource(dt: number): void {
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const i = this.idx(x, y);
        let t = this.temp[i]!;
        const target = this.prop(x, y, 2);
        const rate = this.prop(x, y, 3);
        if (rate > 0 && t < target) t = Math.min(target, t + rate * HEATER_POWER * dt);
        this.t2[i] = this.sanitizeT(t);
      }
    this.swapT();
  }

  /** velSource.frag: fan momentum and buoyancy. Solids have no velocity. */
  velSource(dt: number): void {
    const amb = this.params.ambientC;
    const k = 1 - Math.exp(-FAN_RESPONSE * dt);
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const i = this.idx(x, y);
        let u = this.vel[i * 2]!;
        let v = this.vel[i * 2 + 1]!;
        if (this.solid(x, y)) {
          u = 0;
          v = 0;
        } else {
          const speed = this.prop(x, y, 6);
          if (speed > 0) {
            u += (this.prop(x, y, 4) * speed - u) * k;
            v += (this.prop(x, y, 5) * speed - v) * k;
          }
          if (this.params.gravity) v -= BUOYANCY * (this.temp[i]! - amb) * dt;
        }
        this.v2[i * 2] = u;
        this.v2[i * 2 + 1] = v;
      }
    this.swapV();
  }

  /** advectTemp.frag. Solid cells keep their temperature. */
  advectTemp(dt: number): void {
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const i = this.idx(x, y);
        if (this.solid(x, y)) {
          this.t2[i] = this.temp[i]!;
          continue;
        }
        const bx = x + 0.5 - dt * this.vel[i * 2]! * this.q;
        const by = y + 0.5 - dt * this.vel[i * 2 + 1]! * this.q;
        this.t2[i] = this.sanitizeT(this.sampleTemp(bx, by));
      }
    this.swapT();
  }

  /** advectVel.frag */
  advectVel(dt: number): void {
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const i = this.idx(x, y);
        if (this.solid(x, y)) {
          this.v2[i * 2] = 0;
          this.v2[i * 2 + 1] = 0;
          continue;
        }
        const bx = x + 0.5 - dt * this.vel[i * 2]! * this.q;
        const by = y + 0.5 - dt * this.vel[i * 2 + 1]! * this.q;
        this.v2[i * 2] = this.sampleVel(bx, by, 0);
        this.v2[i * 2 + 1] = this.sampleVel(bx, by, 1);
      }
    this.swapV();
  }

  /** diffuse.frag, one substep. */
  diffuse(dt: number): void {
    const invH2 = this.q * this.q;
    const amb = this.params.ambientC;
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const i = this.idx(x, y);
        const t = this.temp[i]!;
        const k = this.prop(x, y, 0);
        let sum = 0;
        for (const [dx, dy] of OFFS) {
          const nx = x + dx;
          const ny = y + dy;
          let tn: number;
          let kn: number;
          if (this.outside(nx, ny)) {
            tn = amb;
            kn = K_OUTSIDE;
          } else {
            tn = this.temp[this.idx(nx, ny)]!;
            kn = this.prop(nx, ny, 0);
          }
          const kf = (2 * k * kn) / Math.max(k + kn, 1e-6);
          sum += kf * (tn - t);
        }
        this.t2[i] = this.sanitizeT(t + dt * invH2 * sum);
      }
    this.swapT();
  }

  private velAtClamped(x: number, y: number, c: number): number {
    const cx = Math.min(this.w - 1, Math.max(0, x));
    const cy = Math.min(this.h - 1, Math.max(0, y));
    return this.vel[this.idx(cx, cy) * 2 + c]!;
  }

  /** curl.frag */
  computeCurl(): void {
    const half = this.q * 0.5;
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const dvdx = this.velAtClamped(x + 1, y, 1) - this.velAtClamped(x - 1, y, 1);
        const dudy = this.velAtClamped(x, y + 1, 0) - this.velAtClamped(x, y - 1, 0);
        this.curl[this.idx(x, y)] = (dvdx - dudy) * half;
      }
  }

  private curlAtClamped(x: number, y: number): number {
    const cx = Math.min(this.w - 1, Math.max(0, x));
    const cy = Math.min(this.h - 1, Math.max(0, y));
    return this.curl[this.idx(cx, cy)]!;
  }

  /** vorticity.frag: confinement force pushes along N x w. */
  vorticity(dt: number): void {
    const half = this.q * 0.5;
    const eps = VORTICITY_STRENGTH * this.params.swirl / this.q; // * h
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const i = this.idx(x, y);
        let u = this.vel[i * 2]!;
        let v = this.vel[i * 2 + 1]!;
        if (!this.solid(x, y)) {
          const gx = (Math.abs(this.curlAtClamped(x + 1, y)) - Math.abs(this.curlAtClamped(x - 1, y))) * half;
          const gy = (Math.abs(this.curlAtClamped(x, y + 1)) - Math.abs(this.curlAtClamped(x, y - 1))) * half;
          const len = Math.hypot(gx, gy) + 1e-5;
          const wc = this.curl[i]!;
          u += eps * (gy / len) * wc * dt;
          v += eps * (-gx / len) * wc * dt;
        }
        this.v2[i * 2] = u;
        this.v2[i * 2 + 1] = v;
      }
    this.swapV();
  }

  /** Velocity component `c` of neighbour (nx, ny) as seen from (x, y) by the divergence pass. */
  private velForDiv(x: number, y: number, nx: number, ny: number, c: number): number {
    if (this.outside(nx, ny)) return this.vel[this.idx(x, y) * 2 + c]!; // open edge: zero gradient
    if (this.solid(nx, ny)) return 0; // no flow into solids
    return this.vel[this.idx(nx, ny) * 2 + c]!;
  }

  /** divergence.frag */
  divergence(): void {
    const half = this.q * 0.5;
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const i = this.idx(x, y);
        if (this.solid(x, y)) {
          this.div[i] = 0;
          continue;
        }
        const du = this.velForDiv(x, y, x + 1, y, 0) - this.velForDiv(x, y, x - 1, y, 0);
        const dv = this.velForDiv(x, y, x, y + 1, 1) - this.velForDiv(x, y, x, y - 1, 1);
        this.div[i] = (du + dv) * half;
      }
  }

  /** Pressure of neighbour (nx, ny) as seen from (x, y): open edges 0, solids mirror the centre. */
  private pressureFor(x: number, y: number, nx: number, ny: number): number {
    if (this.outside(nx, ny)) return 0;
    if (this.solid(nx, ny)) return this.pressure[this.idx(x, y)]!;
    return this.pressure[this.idx(nx, ny)]!;
  }

  /** pressure.frag, one Jacobi iteration. Same neighbour rules as `pressureFor`. */
  jacobi(): void {
    const h2 = 1 / (this.q * this.q);
    const p = this.pressure;
    const out = this.p2;
    const nb = this.nb;
    const n = this.w * this.h;
    for (let i = 0; i < n; i++) {
      if (this.solidCell[i]) {
        out[i] = 0;
        continue;
      }
      let sum = 0;
      for (let d = 0; d < 4; d++) {
        const j = nb[i * 4 + d]!;
        sum += j >= 0 ? p[j]! : j === NB_OUTSIDE ? 0 : p[i]!;
      }
      out[i] = (sum - h2 * this.div[i]!) * 0.25;
    }
    this.swapP();
  }

  /** project.frag: subtract the pressure gradient, zero solids, sanitize. */
  project(): void {
    const half = this.q * 0.5;
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const i = this.idx(x, y);
        let u = 0;
        let v = 0;
        if (!this.solid(x, y)) {
          u = this.vel[i * 2]! - (this.pressureFor(x, y, x + 1, y) - this.pressureFor(x, y, x - 1, y)) * half;
          v = this.vel[i * 2 + 1]! - (this.pressureFor(x, y, x, y + 1) - this.pressureFor(x, y, x, y - 1)) * half;
          if (!Number.isFinite(u) || !Number.isFinite(v)) {
            u = 0;
            v = 0;
          }
          const s = Math.hypot(u, v);
          if (s > V_MAX) {
            u *= V_MAX / s;
            v *= V_MAX / s;
          }
        }
        this.v2[i * 2] = u;
        this.v2[i * 2 + 1] = v;
      }
    this.swapV();
  }

  step(dt: number): void {
    this.heatSource(dt);
    this.velSource(dt);
    this.advectTemp(dt);
    this.advectVel(dt);
    const n = diffusionSubsteps(dt, this.q);
    for (let s = 0; s < n; s++) this.diffuse(dt / n);
    if (this.params.swirl > 0) {
      this.computeCurl();
      this.vorticity(dt);
    }
    this.divergence();
    for (let k = 0; k < PRESSURE_ITERATIONS; k++) this.jacobi();
    this.project();
  }

  /** Max |divergence| over air cells (for tests). */
  maxDivergence(): number {
    this.divergence();
    let m = 0;
    for (const d of this.div) m = Math.max(m, Math.abs(d));
    return m;
  }

  /** Mean of a cell field over one tile's cells. */
  tileMean(field: "temp" | "u" | "v", tx: number, ty: number): number {
    let sum = 0;
    for (let j = 0; j < this.q; j++)
      for (let i = 0; i < this.q; i++) {
        const c = this.idx(tx * this.q + i, ty * this.q + j);
        sum += field === "temp" ? this.temp[c]! : this.vel[c * 2 + (field === "u" ? 0 : 1)]!;
      }
    return sum / (this.q * this.q);
  }
}
