#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Subtract the pressure gradient, zero solids, sanitize and clamp speed. Mirrors CpuSim.project.
uniform sampler2D uVel;
uniform sampler2D uPressure;
uniform float uVMax;

out vec4 outValue;

float pFor(ivec2 c, ivec2 n) {
  if (outsideGrid(n)) return 0.0;
  if (solidAt(n)) return texelFetch(uPressure, c, 0).r;
  return texelFetch(uPressure, n, 0).r;
}

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec2 v = vec2(0.0);
  if (!solidAt(c)) {
    float half_q = 0.5 * float(uQuality);
    v = texelFetch(uVel, c, 0).xy;
    v.x -= (pFor(c, c + ivec2(1, 0)) - pFor(c, c - ivec2(1, 0))) * half_q;
    v.y -= (pFor(c, c + ivec2(0, 1)) - pFor(c, c - ivec2(0, 1))) * half_q;
    if (any(isnan(v)) || any(isinf(v))) v = vec2(0.0);
    float s = length(v);
    if (s > uVMax) v *= uVMax / s;
  }
  outValue = vec4(v, 0.0, 1.0);
}
