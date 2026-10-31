#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Heater thermostat plus sanitize. Mirrors CpuSim.heatSource.
uniform sampler2D uTemp;
uniform float uDt;
uniform float uPower;
uniform float uAmbient;
uniform float uTMin;
uniform float uTMax;

out vec4 outValue;

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec4 p = propsA(c);
  float t = texelFetch(uTemp, c, 0).r;
  if (p.a > 0.0 && t < p.b) t = min(p.b, t + p.a * uPower * uDt);
  if (isnan(t) || isinf(t)) t = uAmbient;
  outValue = vec4(clamp(t, uTMin, uTMax), 0.0, 0.0, 1.0);
}
