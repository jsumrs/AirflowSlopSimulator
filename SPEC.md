# Visual Airflow Simulator — Spec

A browser-based, locally run, real-time 2D simulation of airflow and heat on an editable tile grid. Users paint walls, fans, heaters and windows, then watch air and heat move. The simulation should look plausible, not be physically exact. The project will move to 3D later, so v1 is architected for that.

---

## 1. Goals and non-goals

**Goals**
- Live simulation that feels instant. Edits take effect on the next frame.
- It is easy to read, at a glance, the temperature, the airflow, and every fan's and heater's settings.
- Fast editing: tool palette, keyboard shortcuts, selection, undo.
- A clean split between the simulation core and rendering/UI, so a later 3D version reuses the core.

**Non-goals (v1)**
- Physical accuracy, real-world units for airflow, or validated CFD.
- 3D UI or rendering.
- Grids larger than 100 x 100.
- Backend, accounts, or multi-user features. Everything runs client-side.

---

## 2. Tech stack

| Concern | Choice |
|---|---|
| Language | TypeScript (strict) |
| Simulation | GPU, WebGL2 fragment shaders on float textures (`EXT_color_buffer_float`) |
| Rendering | WebGL2 (same context as the sim) |
| Package manager | Bun (`bun install`, `bun.lock`). Package manager only |
| Build / dev server | Vite (Preact and GLSL plugins) |
| UI (side panel, toolbar, inspector) | Preact + Preact Signals. UI layer only; model, sim, and render stay framework-free |
| Tests | Vitest for model, serialization, and solver CPU reference (shares Vite config) |
| Deployment | Static files. `bun run dev` (Vite) locally; `bun run build` output runs on any static host |

If WebGL2 float render targets are unavailable, show a clear "unsupported browser" message. v1 has no CPU fallback.

---

## 3. Grid

- N x M rectangular grid. N and M are each 1–100, set in the UI. Default **15 x 15**.
- Resizing keeps the existing tiles that still fit, anchored at the top-left. New tiles are air.
- Each tile has a light outline so the grid is visible. Outlines can be toggled and fade when zoomed out.
- **Edges are open to the outside.** Air can flow in and out. Air entering from outside is at ambient temperature. To enclose a space, the user draws walls (with optional windows) around it.
- Ambient / outside temperature: **20 C**, adjustable in settings.

### Gravity / buoyancy
- A toggle, **off by default (top-down view)**.
- On: the grid is a side view. Warm air rises and cool air sinks (Boussinesq buoyancy, pointing toward the top of the screen).
- Off: the grid is a top-down view. Heat only diffuses and is carried by moving air.

---

## 4. Tile types

| # key | Type | Blocks air | Heat behavior | Settings |
|---|---|---|---|---|
| 1 | Air | no | advects + diffuses | — |
| 2 | Wall | yes | conducts slowly (low conductivity) | — |
| 3 | Fan | partially (see below) | passes through like air | direction, level, oscillate, sweep speed |
| 4 | Heater | no (pass-through, like a vent/coil) | adds heat toward target temp | intensity, output rate |
| 5 | Window | if closed | closed: conducts noticeably faster than a wall (glass); open: behaves as air | open/closed |

### 4.1 Fan
- **Direction:** 8 directions (N, NE, E, SE, S, SW, W, NW).
- **Power:** an on/off switch, separate from level. An off fan exerts no force, but remembers its level.
- **Level:** 1, 2, 3, 4, 5. A higher level moves air faster. The level control is greyed out while the fan is off.
- **Behavior:** pushes air out of its front face in the facing direction and pulls air in from behind. This is done by applying a velocity/momentum source at the fan tile. The pressure solve then produces the intake behind it naturally.
- **Oscillate:** on/off. When on, the facing direction sweeps a fixed 90 degrees (45 degrees each side of the set direction) and back. The set direction stays the center of the sweep.
- **Sweep speed:** adjustable while oscillating, levels 1–5.

### 4.2 Heater
- **Intensity (target temperature):** works like a thermostat. The heater adds heat to its own tile until the tile reaches this temperature, then holds it there. Range **20–100 C**, default **50 C**.
- **Output rate:** how fast the heater adds heat while below its target (renamed from "replication"). Levels **1–5**.
- No direction. Heat is generated on the heater's tile and spreads by diffusion, airflow, and buoyancy.

### 4.3 Window
- **Open/closed** toggle.
- Closed: blocks air like a wall, but conducts heat noticeably faster (it leaks heat).
- Open: air and heat pass through freely.

### 4.4 Showing settings on the tile
Settings must be readable at a glance on roughly 10 px tiles, with the side panel and hover inspector giving exact values.

- **Fan:** an arrow showing the current facing (it animates while oscillating). Arrow colour shows the level (green 1, yellow 3, red 5); level ticks come later. When oscillating, a faint 90 degree arc shows the sweep range. A fan that is off is drawn as a grey arrow.
- **Heater:** the tile fill color maps to target temperature on the same scale as the heat map. A small 1–5 bar or pip strip shows output rate. A subtle pulse while it is actively heating (below target).
- **Window:** a glass-blue tile. Closed shows a solid pane, open shows a gap or frame only.
- **Wall:** solid neutral gray.

---

## 5. Simulation model

Grid-based incompressible fluid solver (in the style of Stam's "Stable Fluids") on the GPU.

**Simulation quality setting:** 1x / 2x / 4x sim cells per tile edge (1, 4, or 16 cells per tile). Default **2x**.
- Each tile's properties (solid, fan source, heater source, conductivity) apply to all of its sub-cells.
- Changing quality resamples the current velocity and temperature fields. Resetting them to ambient is an acceptable fallback.
- Arrows stay one per tile (averaged over its sub-cells). Particles and streamlines use the full sim resolution. The inspector shows tile averages.

Per step:
1. **Sources:** fan momentum, heater heat (thermostat rule), buoyancy force if gravity is on.
2. **Advect** velocity and temperature (semi-Lagrangian).
3. **Diffuse** temperature (with per-tile conductivity: air, wall, closed window). No explicit velocity viscosity: the semi-Lagrangian solver already blurs the flow more than real air would.
4. **Vorticity confinement:** detects small swirls and gently strengthens them, to make up for the solver's numerical blurring. Its strength is the **Swirl** setting (slider). It is not applied to the outermost ring of cells: the curl there is one-sided, and confinement at the open edges fed on itself and made edge air speed grow without bound. The default is tuned by eye against the example layouts.
5. **Project:** pressure solve (Jacobi iterations, ~20–40) to make the velocity divergence-free.
6. **Boundaries:**
   - Walls and closed windows: no flow through them (solid cells).
   - Grid edges: open. Pressure = 0 and inflow temperature = ambient.
7. Clamp and sanitize values (no NaN/Inf, temperature within a sane range).

Heat leaves the system through open edges and open windows. It also leaks through walls and closed windows to the outside, if those border an edge or outside air.

The simulation uses a fixed timestep, with multiple substeps per frame depending on the speed setting.

---

## 6. Visualization

All overlays can be toggled on their own.

- **Heat map:** blue to white to red color ramp. White always sits at the ambient temperature (not the midpoint of the scale), so blue means colder than outside and red means hotter.
  - Fixed scale (0–100 C by default, adjustable) **or** auto scale (current min/max). Switched with a toggle.
  - A legend shows the current range.
- **Airflow overlays** (each can be toggled):
  - **Arrows:** one per tile. Length or opacity shows speed.
  - **Particles:** dots that drift with the air, with short fading trails, and respawn continuously.
  - **Streamlines:** continuous curves traced through the velocity field, redrawn every few frames.
- Tile glyphs (fans, heaters, windows, walls) are always drawn on top.

---

## 7. Tools and editing

### 7.1 Tools
| Key | Tool | Behavior |
|---|---|---|
| B | Brush | Click/drag paints the active tile type. Right-click/drag erases to air. |
| R | Rectangle | Drag to draw a rectangle of the active type. Draws an **outline** (hollow box, for rooms) by default. Hold Shift for **filled**. |
| S | Select | Drag a rectangle to select. Shift+drag adds to the selection. Alt (or Ctrl)+drag subtracts from it. |

- **Pointer (V / Esc):** the default tool. Click selects a tile, drag pans, nothing is painted. B toggles the brush; pressing the active brush's key (B, or its 1–5 number) again returns to the pointer.
- **Active tile type:** keys 1–5 (Air, Wall, Fan, Heater, Window), or click in the palette.
- Newly placed fans and heaters use the last-used settings for their type.

### 7.2 Selection actions
- **Move:** drag inside the selection.
- **Copy / paste:** Ctrl+C / Ctrl+V. Pastes a floating copy that the user places with a click.
- **Cut:** Ctrl+X.
- **Delete:** Delete/Backspace clears the selection to air.
- **Fill:** F fills the selection with the active tile type.
- **Rotate / flip:** E / Q rotate 90 degrees clockwise / counter-clockwise. H / V flip horizontal / vertical. Fan directions rotate or mirror with the tiles.
- **Bulk edit:** with the selection active, the side panel edits every selected fan's and heater's settings at once. Mixed values show as "—".

### 7.3 Editing fan / heater / window settings
Both methods are supported:
- **Side panel:** click a fan, heater, or window (Select tool, or a click with no drag) to show its settings.
- **Shortcuts** (while hovering over or selecting a tile):
  - E / Q: rotate fan clockwise / counter-clockwise (one 45 degree step).
  - Ctrl+scroll or [ / ]: fan level, or heater intensity.
  - Ctrl+Shift+scroll or Shift+[ / ]: heater output rate, or fan sweep speed.
  - The canvas must call `preventDefault` on Ctrl+wheel (non-passive listener) so the browser's page zoom doesn't trigger.
  - O: toggle fan oscillation, or toggle window open/closed.

### 7.4 Zoom / pan
- **Scroll:** always zooms at the cursor (so does pinch). There is no scroll-to-pan; panning is drag with the pointer tool, Space + drag, or middle-drag.
- **Keyboard:** arrow keys pan, +/- zoom.
- **Pan:** middle-mouse drag, or hold Space + drag. A tap of Space, with no drag, toggles play/pause instead.
- **0 / Home:** fit the whole grid to the view.
- Zoom range: from fit-to-window up to ~64 px per tile.
- Tile glyph detail scales with zoom. At small sizes fans show the arrow only, and level ticks and the oscillation arc appear once tiles are large enough.

### 7.5 Undo / redo
- Ctrl+Z / Ctrl+Shift+Z (and Ctrl+Y).
- Covers every layout and settings edit. Undo restores the layout, not the air/heat state.

---

## 8. Simulation controls

- Play / Pause: tap Space (holding Space pans).
- Step one frame while paused (`.`).
- Speed: 0.25x, 0.5x, 1x, 2x, 4x.
- Simulation quality: 1x / 2x / 4x (see section 5).
- Swirl: slider for vorticity confinement strength (see section 5).
- Reset simulation: clears air and heat back to ambient and keeps the layout.
- Clear layout: everything back to air (can be undone).
- Toggles: gravity, heat map, arrows, particles, streamlines, grid lines, heat map auto/fixed scale.

---

## 9. Inspector

Hovering over any tile shows a small readout: coordinates, tile type, temperature (C, one decimal), air speed and direction. For fans and heaters it also shows all their settings.

---

## 10. Save / load

- **Autosave** the current layout to `localStorage` after edits (debounced) and restore it on load.
- **Export / import JSON** (download a file / pick a file).
- Saved data covers: grid size, tiles and their settings, global settings (ambient, gravity, overlay toggles). The simulation state (velocity/temperature fields) is **not** saved in v1.
- The JSON has a `version` field so formats can migrate later (including 2D to 3D).

Example:
```json
{
  "version": 1,
  "grid": { "width": 15, "height": 15 },
  "settings": { "ambientC": 20, "gravity": false, "simQuality": 2, "swirl": 0.3 },
  "tiles": [
    { "x": 3, "y": 10, "type": "fan", "dir": "E", "on": true, "level": 3, "oscillate": true, "sweepSpeed": 2 },
    { "x": 20, "y": 30, "type": "heater", "targetC": 50, "outputRate": 3 },
    { "x": 0, "y": 5, "type": "window", "open": false }
  ]
}
```
Tiles not listed are air. The implementation may run-length encode walls.

### 10.1 Example layouts
Example layouts ship as JSON in the save format and load through the normal import path:
1. **Heated room:** a walled room with a heater and one closed window. Open the window to watch heat escape.
2. **Fan tunnel:** a corridor with fans pushing air through a gap.
3. **Radiator plume:** gravity on, with a heater on the floor of a room and warm air rising.
4. **Oscillating fan:** an open space with a single oscillating fan and a heater nearby.

- First run (no autosave present) loads **Heated room**.
- An **Examples** menu loads any of them. Loading replaces the current layout and can be undone.
- These layouts also serve as manual visual checks for the solver.

---

## 11. Performance targets

- 60 fps at 100 x 100 tiles at 2x sim quality with every overlay on, on a mid-range integrated GPU (e.g. a recent Intel Iris Xe or Apple M1).
- 4x quality may drop below 60 fps on integrated GPUs. That is acceptable.
- Edits appear within one frame.
- No per-frame GC churn: reuse typed arrays and GPU buffers.
- Upload only the tiles that changed, not the whole grid every frame.

---

## 12. Architecture (3D-ready)

```
src/
  model/      Layout: grid dims, tile data, settings. Pure TS, no DOM/GL.
  sim/        Solver interface + WebGL2 implementation (shaders, textures, passes).
  render/     Tiles, heat map, arrows, particles, streamlines.
  input/      Tools (brush, rect, select), shortcuts, hit-testing.
  ui/         Toolbar, palette, side panel, inspector, controls.
  io/         Serialization, autosave, import/export, version migration.
  history/    Undo/redo command stack.
```

Rules that keep the move to 3D contained:
- The model stores dimensions as a generic shape (`[w, h]` now, `[w, h, d]` later). Tile indexing goes through one helper.
- The solver works behind an interface (`step(dt)`, `setTiles(changes)`, `readField(...)`), so a 3D solver can replace the 2D one without touching UI or input. The solver takes its sim grid dimensions separately from the tile grid dimensions (sim = tiles x quality).
- Directions are stored as vectors (or enums mapped to vectors), not as "left/right" UI concepts.
- Rendering and input are the only 2D-specific layers.

---

## 13. Key map (summary)

```
TILE TYPE        TOOLS                 SELECTION
1 Air            B  Brush              Shift+drag   add
2 Wall           R  Rectangle          Alt+drag     subtract
3 Fan               (Shift = filled)   Ctrl+C/X/V   copy / cut / paste
4 Heater         S  Select             Del/Bksp     clear to air
5 Window                               F            fill with active type
                                       E / Q        rotate cw / ccw
OBJECT (hover or selected)             H / V        flip horiz / vert
E / Q            rotate fan
[ / ]            fan level, heater intensity     VIEW
Shift+[ / ]      heater output, fan sweep        Scroll        zoom
Ctrl+scroll      same as [ / ]                   Middle-drag   pan
Ctrl+Shift+scr   same as Shift+[ / ]             Hold Space    pan
O                fan oscillate, window toggle    0 / Home      fit view

SIMULATION                     EDIT
Tap Space   play/pause         Ctrl+Z            undo
.           step               Ctrl+Shift+Z / Y  redo
```

---

## 14. Open questions

None currently open.
