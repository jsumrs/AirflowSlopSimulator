#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Vorticity (scalar curl in 2D). Mirrors CpuSim.computeCurl.
uniform sampler2D uVel;

out vec4 outValue;

vec2 vel(ivec2 c) { return texelFetch(uVel, clampCell(c), 0).xy; }

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  float dvdx = vel(c + ivec2(1, 0)).y - vel(c - ivec2(1, 0)).y;
  float dudy = vel(c + ivec2(0, 1)).x - vel(c - ivec2(0, 1)).x;
  outValue = vec4((dvdx - dudy) * 0.5 * float(uQuality), 0.0, 0.0, 1.0);
}
