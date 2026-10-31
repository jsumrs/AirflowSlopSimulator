#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// One explicit diffusion substep with per-tile conductivity. Grid edges are open
// air at ambient. Mirrors CpuSim.diffuse.
uniform sampler2D uTemp;
uniform float uDt;
uniform float uInvH2;
uniform float uAmbient;
uniform float uKOutside;
uniform float uTMin;
uniform float uTMax;

out vec4 outValue;

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  float t = texelFetch(uTemp, c, 0).r;
  float k = propsA(c).r;
  float sum = 0.0;
  for (int i = 0; i < 4; i++) {
    ivec2 n = c + OFFS[i];
    float tn;
    float kn;
    if (outsideGrid(n)) {
      tn = uAmbient;
      kn = uKOutside;
    } else {
      tn = texelFetch(uTemp, n, 0).r;
      kn = propsA(n).r;
    }
    float kf = 2.0 * k * kn / max(k + kn, 1e-6);
    sum += kf * (tn - t);
  }
  t += uDt * uInvH2 * sum;
  if (isnan(t) || isinf(t)) t = uAmbient;
  outValue = vec4(clamp(t, uTMin, uTMax), 0.0, 0.0, 1.0);
}
