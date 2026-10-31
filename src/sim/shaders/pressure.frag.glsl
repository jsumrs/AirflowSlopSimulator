#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// One Jacobi iteration of the pressure solve. Open edges: pressure 0. Solids mirror
// the centre (no flow through them). Mirrors CpuSim.jacobi.
uniform sampler2D uPressure;
uniform sampler2D uDiv;
uniform float uH2;

out vec4 outValue;

float pFor(ivec2 c, ivec2 n) {
  if (outsideGrid(n)) return 0.0;
  if (solidAt(n)) return texelFetch(uPressure, c, 0).r;
  return texelFetch(uPressure, n, 0).r;
}

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  float p = 0.0;
  if (!solidAt(c)) {
    float sum = 0.0;
    for (int i = 0; i < 4; i++) sum += pFor(c, c + OFFS[i]);
    p = (sum - uH2 * texelFetch(uDiv, c, 0).r) * 0.25;
  }
  outValue = vec4(p, 0.0, 0.0, 1.0);
}
