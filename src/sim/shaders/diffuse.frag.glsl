#version 300 es
// One explicit diffusion substep with per-tile conductivity. Grid edges are open
// air at ambient. Mirrors the diffusion loop in cpuReference.ts.
precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D uTemp;   // R32F, sim resolution
uniform sampler2D uProps;  // RGBA32F, tile resolution: k, solid, target, rate
uniform ivec2 uSim;
uniform int uQuality;
uniform float uDt;
uniform float uInvH2;
uniform float uAmbient;
uniform float uKOutside;
uniform float uTMin;
uniform float uTMax;

out vec4 outValue;

const ivec2 OFFS[4] = ivec2[4](ivec2(1, 0), ivec2(-1, 0), ivec2(0, 1), ivec2(0, -1));

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  float t = texelFetch(uTemp, c, 0).r;
  float k = texelFetch(uProps, c / uQuality, 0).r;
  float sum = 0.0;
  for (int i = 0; i < 4; i++) {
    ivec2 n = c + OFFS[i];
    float tn;
    float kn;
    if (n.x < 0 || n.y < 0 || n.x >= uSim.x || n.y >= uSim.y) {
      tn = uAmbient;
      kn = uKOutside;
    } else {
      tn = texelFetch(uTemp, n, 0).r;
      kn = texelFetch(uProps, n / uQuality, 0).r;
    }
    float kf = 2.0 * k * kn / max(k + kn, 1e-6);
    sum += kf * (tn - t);
  }
  t += uDt * uInvH2 * sum;
  if (isnan(t) || isinf(t)) t = uAmbient;
  outValue = vec4(clamp(t, uTMin, uTMax), 0.0, 0.0, 1.0);
}
