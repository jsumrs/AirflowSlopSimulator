export type GlContextResult =
  | { ok: true; gl: WebGL2RenderingContext }
  | { ok: false; reason: string };

/**
 * Get a WebGL2 context with float render targets. The sim needs
 * EXT_color_buffer_float, and there is no CPU fallback.
 */
export function createGlContext(canvas: HTMLCanvasElement): GlContextResult {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
  });
  if (!gl) {
    return { ok: false, reason: "WebGL2 is not available." };
  }
  if (!gl.getExtension("EXT_color_buffer_float")) {
    return {
      ok: false,
      reason: "Float render targets (EXT_color_buffer_float) are not supported.",
    };
  }
  return { ok: true, gl };
}

/** Match the drawing buffer to the canvas's CSS size times devicePixelRatio. */
export function resizeToDisplay(gl: WebGL2RenderingContext, dpr: number): void {
  const canvas = gl.canvas as HTMLCanvasElement;
  const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  gl.viewport(0, 0, w, h);
}

export function clear(gl: WebGL2RenderingContext): void {
  gl.clearColor(0.07, 0.07, 0.08, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return shader;
}

export function createProgram(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const program = gl.createProgram()!;
  const v = compile(gl, gl.VERTEX_SHADER, vs);
  const f = compile(gl, gl.FRAGMENT_SHADER, fs);
  gl.attachShader(program, v);
  gl.attachShader(program, f);
  gl.linkProgram(program);
  gl.deleteShader(v);
  gl.deleteShader(f);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link failed: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}
