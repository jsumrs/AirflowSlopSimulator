#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Velocity divergence. Open edges: zero gradient. Solids: no flow in. Mirrors CpuSim.divergence.
uniform sampler2D uVel;

out vec4 outValue;

vec2 velFor(ivec2 c, ivec2 n) {
  if (outsideGrid(n)) return texelFetch(uVel, c, 0).xy;
  if (solidAt(n)) return vec2(0.0);
  return texelFetch(uVel, n, 0).xy;
}

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  float d = 0.0;
  if (!solidAt(c)) {
    float du = velFor(c, c + ivec2(1, 0)).x - velFor(c, c - ivec2(1, 0)).x;
    float dv = velFor(c, c + ivec2(0, 1)).y - velFor(c, c - ivec2(0, 1)).y;
    d = (du + dv) * 0.5 * float(uQuality);
  }
  outValue = vec4(d, 0.0, 0.0, 1.0);
}
