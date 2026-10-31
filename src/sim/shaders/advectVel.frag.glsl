#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Semi-Lagrangian self-advection of velocity. Taps clamp to the grid edge.
// Mirrors CpuSim.advectVel.
uniform sampler2D uVel;
uniform float uDt;

out vec4 outValue;

vec2 tap(ivec2 c) { return texelFetch(uVel, clampCell(c), 0).xy; }

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec2 result = vec2(0.0);
  if (!solidAt(c)) {
    vec2 v = texelFetch(uVel, c, 0).xy;
    vec2 s = vec2(c) + 0.5 - uDt * v * float(uQuality) - 0.5;
    vec2 b = floor(s);
    vec2 f = s - b;
    ivec2 i0 = ivec2(b);
    vec2 a = mix(tap(i0), tap(i0 + ivec2(1, 0)), f.x);
    vec2 d = mix(tap(i0 + ivec2(0, 1)), tap(i0 + ivec2(1, 1)), f.x);
    result = mix(a, d, f.y);
  }
  outValue = vec4(result, 0.0, 1.0);
}
