# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Early implementation. Design docs:
- `SPEC.md` is the source of truth for the Visual Airflow Simulator (browser-based, real-time 2D airflow/heat sim on an editable tile grid). Read the relevant section before implementing a feature.
- `requirements.md` is the user's original brief. `SPEC.md` supersedes it where they differ (e.g. heaters have no direction; "replication" was renamed "output rate"; tile types are Air/Wall/Fan/Heater/Window).

`MILESTONES.md` is the build order. Work on one milestone at a time, check its "Done when" before calling it finished, and tick its box when it's committed.

Milestones 0-4 are in place: skeleton, grid and painting (WebGL2 tile renderer with GLSL in `src/render/shaders/`, pointer and brush tools, side panel), undo/redo plus versioned JSON save/load and autosave, and the solver (`sim/glSolver.ts`, one shader per pass in `src/sim/shaders/` sharing `common.glsl` via a `// #include common` line). `sim/cpuReference.ts` (`CpuSim`) mirrors every shader pass for tests, so change both together; tuning constants live in `sim/params.ts`. All layout and settings edits go through the functions in `src/ui/store.ts`, which record `history/` commands; `model/scene.ts` bundles the layout and global settings that are saved and undone. Consumers of tile changes each get their own tracker from `layout.track()`. Example layouts live in `src/examples/` as save-format JSON.

## Commands

Bun is the package manager only. Vite builds and serves; Vitest runs tests. Config lives in `vite.config.ts` (Vitest shares it; `passWithNoTests` is on until real tests exist).

```sh
bun install
bun run dev          # Vite dev server
bun run build        # static output, deployable to any static host
bunx tsc --noEmit    # type check (Vite does not type check)
bunx vitest          # all tests
bunx vitest run path/to/file.test.ts -t "test name"   # single test
```

## Architecture

TypeScript (strict). Simulation and rendering both run on the GPU in one WebGL2 context, using fragment shaders on float textures (`EXT_color_buffer_float`). There is no CPU fallback: if float render targets are unavailable, show an "unsupported browser" message. Preact + Signals is used for the UI layer only.

Planned layout under `src/`: `model/` (pure TS layout and settings, no DOM/GL), `sim/` (solver interface + WebGL2 implementation), `render/`, `input/`, `ui/`, `io/` (serialization, autosave, migration), `history/` (undo/redo).

The design has to stay ready for a later 3D version (see the 3D-readiness rules under Conventions). The solver sits behind an interface (`step(dt)`, `setTiles(changes)`, `readField(...)`). It takes the sim grid size separately from the tile grid size: sim = tiles x quality (1x/2x/4x per tile edge).

Solver: Stam-style stable fluids. Each step runs sources (fan momentum, heater thermostat, optional Boussinesq buoyancy), semi-Lagrangian advection, temperature diffusion with per-tile conductivity, vorticity confinement ("Swirl"), a Jacobi pressure projection, boundaries, and a NaN/Inf/temperature clamp. Grid edges are open (pressure 0, inflow at ambient temperature). There is no explicit velocity viscosity. The sim uses a fixed timestep with substeps per frame. SPEC.md section 5 has the full details.

Vitest covers the model, serialization, and a CPU reference of the solver. GPU code is checked visually against the example layouts in SPEC.md section 10.1.

The save format is versioned JSON (`version` field, SPEC.md section 10). It stores the layout and settings, never the velocity or temperature fields.

## Conventions

**Layering and 3D readiness**
- `model/`, `sim/`, and `render/` must not import Preact or touch the DOM. Only `ui/` uses Preact.
- Only `render/` and `input/` may assume 2D. Everything else works on a generic grid shape (`[w, h]` now, `[w, h, d]` later).
- Index tiles only through the single shared helper. Never compute `y * w + x` inline.
- Store directions as vectors, or as enums mapped to vectors. Never store them as UI concepts like left/right.

**Performance (target: 60 fps at 100x100 tiles, 2x quality, all overlays on, integrated GPU)**
- Nothing in the frame loop allocates. Reuse typed arrays, GPU buffers, and textures.
- Track changed tiles and upload only those. Never re-upload the whole grid each frame.

**Editing and state**
- Every layout or settings change goes through a `history/` command, so undo covers it. This includes bulk edits, Clear layout, and loading an example. Undo restores the layout only, never the air or heat state.
- Example layouts load through the normal JSON import path. Don't add a separate loader for them.
- Any change to the save format bumps `version` and adds a migration in `io/`.

**Gotchas**
- Register the canvas wheel listener with `{ passive: false }` and call `preventDefault` on Ctrl+wheel. Otherwise the browser zooms the page.

**Before calling a task done**
- Run `bunx tsc --noEmit` and `bunx vitest run`.
- For solver or render changes, say which example layouts the change should be checked against. Tests can't confirm that GPU output looks right.
