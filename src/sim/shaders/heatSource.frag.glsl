#version 300 es
// Heater thermostat plus sanitize. Mirrors the source loop in cpuReference.ts.
precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D uTemp;   // R32F, sim resolution
uniform sampler2D uProps;  // RGBA32F, tile resolution: k, solid, target, rate
uniform int uQuality;
uniform float uDt;
uniform float uPower;
uniform float uAmbient;
uniform float uTMin;
uniform float uTMax;

out vec4 outValue;

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec4 p = texelFetch(uProps, c / uQuality, 0);
  float t = texelFetch(uTemp, c, 0).r;
  if (p.a > 0.0 && t < p.b) t = min(p.b, t + p.a * uPower * uDt);
  if (isnan(t) || isinf(t)) t = uAmbient;
  outValue = vec4(clamp(t, uTMin, uTMax), 0.0, 0.0, 1.0);
}
