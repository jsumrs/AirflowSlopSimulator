import { useState } from "preact/hooks";
import { keepFocus } from "./focus";
import { SPEEDS, playing, resetSim, speed, stepSim, togglePlay } from "./store";

const ICON = { viewBox: "0 0 24 24", width: 18, height: 18, "aria-hidden": true } as const;

const PlayIcon = () => (
  <svg {...ICON}>
    <path d="M7 4 L20 12 L7 20 Z" fill="currentColor" />
  </svg>
);
const PauseIcon = () => (
  <svg {...ICON}>
    <path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" />
  </svg>
);
/** Advance one frame: a play triangle against a bar. */
const StepIcon = () => (
  <svg {...ICON}>
    <path d="M5 4 L16 12 L5 20 Z M18 4h3v16h-3z" fill="currentColor" />
  </svg>
);
/** Circular arrow: start the air and heat over. */
const ResetIcon = () => (
  <svg {...ICON}>
    <path
      d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"
      fill="currentColor"
    />
  </svg>
);

/**
 * Shows only the current speed. Hover (or click) it and every speed slides out
 * over it, so the toolbar doesn't grow.
 */
function SpeedPicker() {
  const [open, setOpen] = useState(false);
  return (
    <div
      class="speed"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        title="Sim speed"
        aria-haspopup="true"
        aria-expanded={open}
        onMouseDown={keepFocus}
        onClick={() => setOpen(!open)}
      >
        {speed.value}×
      </button>
      {open && (
        <div class="speed-options group" role="radiogroup" aria-label="Sim speed">
          {SPEEDS.map((v) => (
            <button
              key={v}
              class={speed.value === v ? "active" : ""}
              role="radio"
              aria-checked={speed.value === v}
              onMouseDown={keepFocus}
              onClick={() => {
                speed.value = v;
                setOpen(false);
              }}
            >
              {v}×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Play/pause, step, reset and speed, at the right of the top toolbar. */
export function Playback() {
  const isPlaying = playing.value;
  return (
    <>
      <SpeedPicker />
      <div class="group">
        <button
          class={isPlaying ? "active" : ""}
          title={isPlaying ? "Pause (tap Space)" : "Play (tap Space)"}
          aria-label={isPlaying ? "Pause" : "Play"}
          onMouseDown={keepFocus}
          onClick={togglePlay}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button
          title="Step one frame (.)"
          aria-label="Step one frame"
          disabled={isPlaying}
          onMouseDown={keepFocus}
          onClick={stepSim}
        >
          <StepIcon />
        </button>
        <button
          title="Reset simulation: air and heat back to ambient. Keeps the layout."
          aria-label="Reset simulation"
          onMouseDown={keepFocus}
          onClick={resetSim}
        >
          <ResetIcon />
        </button>
      </div>
    </>
  );
}
