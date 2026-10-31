# Milestones

Build order for the Visual Airflow Simulator. `SPEC.md` holds the details; section numbers below point to it.

Work one milestone at a time. Each one ends with something you can see working in the browser. Commit after each milestone passes its checks, then tick its box.

Every milestone also needs `bunx tsc --noEmit` and `bunx vitest run` to pass.

---

## [ ] 0. Project skeleton
- Vite + Preact + TypeScript (strict) + Vitest, installed with Bun (section 2).
- Empty `src/` folders from section 12.
- WebGL2 canvas filling the view. Check for `EXT_color_buffer_float` and show an "unsupported browser" message if it's missing.

**Done when:** `bun run dev` shows a blank canvas, and `bun run build` produces static files.

## [ ] 1. Grid and painting
- `model/`: generic grid shape, single tile-index helper, tile types and their settings (sections 3, 4, 12).
- `render/`: tile fills, wall/window/fan/heater glyphs (basic versions), grid lines that can be toggled (section 4.4).
- `input/`: Brush tool, keys 1-5 for tile type, right-drag erases (section 7.1).
- Zoom to cursor, pan with middle-drag or Space+drag, 0/Home to fit (section 7.4).
- Grid size controls (1-100 each, default 64 x 48, resize keeps the top-left).
- Side panel showing the settings of a clicked fan, heater, or window (section 7.3).

**Done when:** you can paint a walled room with a fan and heater, change their settings in the panel, and zoom and pan around it.

## [ ] 2. Undo, autosave, save/load
- `history/`: command stack. Every edit from milestone 1 goes through it (section 7.5).
- `io/`: versioned JSON export/import, debounced autosave to `localStorage`, restore on load (section 10).
- Unit tests for serialization round-trips.

**Done when:** Ctrl+Z / Ctrl+Shift+Z work for every edit, a reload restores the layout, and an exported file imports back identically.

## [ ] 3. Heat only (no airflow yet)
- `sim/`: solver interface (`step`, `setTiles`, `readField`) and the WebGL2 implementation with float textures (sections 5, 12).
- Heater thermostat source, temperature diffusion with per-tile conductivity, open edges at ambient, sanitize/clamp.
- Upload only changed tiles.
- Heat map: blue-white-red with white at ambient, fixed or auto scale, legend (section 6).
- Play/pause (tap Space), step (`.`), Reset simulation (section 8).
- CPU reference of the diffusion step, with Vitest tests.
- Example layout: **Heated room** (section 10.1).

**Done when:** heat spreads out from a heater, stops at its target temperature, leaks faster through a closed window than through a wall, and fades at open edges.

## [ ] 4. Airflow
- Fan momentum source, semi-Lagrangian advection of velocity and temperature, Jacobi pressure projection, solid boundaries for walls and closed windows (section 5).
- Vorticity confinement with the Swirl slider. Gravity toggle with buoyancy.
- Arrow overlay, one per tile (section 6).
- Hover inspector (section 9).
- Example layouts: **Fan tunnel**, **Radiator plume**.

**Done when:** a fan pushes air out the front and pulls it in from behind, air goes around walls, and with gravity on, warm air rises from a heater.

## [ ] 5. Visual polish and sim settings
- Particle overlay with fading trails. Streamline overlay (section 6).
- Full glyphs: fan level ticks, oscillation arc, dimmed when off, heater rate pips and pulse, open/closed window. Detail scales with zoom (sections 4.4, 7.4).
- Fan oscillation and sweep speed.
- Sim quality 1x/2x/4x with field resampling. Speed 0.25x-4x (sections 5, 8).
- Example layout: **Oscillating fan**.

**Done when:** all four overlays toggle independently, and changing quality or speed doesn't reset the layout.

## [ ] 6. Editing tools
- Rectangle tool: outline by default, filled with Shift (section 7.1).
- Select tool: add/subtract selection, move, copy/cut/paste, delete, fill, rotate, flip. Fan directions rotate and mirror with the tiles (section 7.2).
- Bulk edit of selected fans and heaters in the side panel, with "—" for mixed values.
- Settings shortcuts: E/Q, [ / ], Shift+[ / ], Ctrl+scroll (non-passive, `preventDefault`), O (section 7.3).
- Clear layout (undoable).

**Done when:** every shortcut in the key map (section 13) works and every action can be undone.

## [ ] 7. Examples menu and performance
- Examples menu that loads any layout through the import path (undoable). First run loads **Heated room** (section 10.1).
- Settings panel complete: ambient temperature, heat map scale, all toggles (section 8).
- Check the performance targets: 60 fps at 100 x 100, 2x quality, all overlays on. No allocations in the frame loop (section 11).

**Done when:** all four examples look right, and the frame rate holds at the target size.
