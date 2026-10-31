import { useEffect, useRef, useState } from "preact/hooks";
import { clear, createGlContext, resizeToDisplay } from "../render/gl";

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

    const redraw = () => {
      resizeToDisplay(gl, window.devicePixelRatio || 1);
      clear(gl);
    };
    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    redraw();
    return () => observer.disconnect();
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
    <div class="viewport">
      <canvas ref={canvasRef} />
    </div>
  );
}
