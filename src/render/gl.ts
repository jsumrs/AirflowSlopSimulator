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

/** Paste shared GLSL chunks in place of `// #include name` lines. */
export function resolveIncludes(src: string, chunks: Record<string, string>): string {
  return src.replace(/^\/\/ #include (\w+)$/gm, (line, name: string) => {
    const chunk = chunks[name];
    if (chunk === undefined) throw new Error(`Unknown shader include: ${name}`);
    return chunk;
  });
}

/** Active uniform locations of a program, by name. */
export function uniformsOf(gl: WebGL2RenderingContext, program: WebGLProgram): Record<string, WebGLUniformLocation> {
  const u: Record<string, WebGLUniformLocation> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number;
  for (let i = 0; i < count; i++) {
    const name = gl.getActiveUniform(program, i)!.name;
    u[name] = gl.getUniformLocation(program, name)!;
  }
  return u;
}

export interface FloatTarget {
  tex: WebGLTexture;
  fbo: WebGLFramebuffer;
  w: number;
  h: number;
}

/** RGBA32F render target with nearest sampling. */
export function createFloatTarget(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  data: Float32Array | null = null,
): FloatTarget {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, w, h, 0, gl.RGBA, gl.FLOAT, data);
  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error(`Float render target incomplete (0x${status.toString(16)}).`);
  }
  return { tex, fbo, w, h };
}

export function deleteFloatTarget(gl: WebGL2RenderingContext, t: FloatTarget): void {
  gl.deleteTexture(t.tex);
  gl.deleteFramebuffer(t.fbo);
}
