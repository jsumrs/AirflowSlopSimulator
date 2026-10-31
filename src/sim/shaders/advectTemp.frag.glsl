#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Semi-Lagrangian advection of temperature. Outside the grid reads ambient (open edges).
// Solid cells keep their temperature. Mirrors CpuSim.advectTemp.
uniform sampler2D uTemp;
uniform sampler2D uVel;
uniform float uDt;
uniform float uAmbient;
uniform float uTMin;
uniform float uTMax;

out vec4 outValue;

float tap(ivec2 c) { return outsideGrid(c) ? uAmbient : texelFetch(uTemp, c, 0).r; }

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  float t = texelFetch(uTemp, c, 0).r;
  if (!solidAt(c)) {
    vec2 v = texelFetch(uVel, c, 0).xy;
    vec2 s = vec2(c) + 0.5 - uDt * v * float(uQuality) - 0.5;
    vec2 b = floor(s);
    vec2 f = s - b;
    ivec2 i0 = ivec2(b);
    float a = mix(tap(i0), tap(i0 + ivec2(1, 0)), f.x);
    float d = mix(tap(i0 + ivec2(0, 1)), tap(i0 + ivec2(1, 1)), f.x);
    t = mix(a, d, f.y);
    if (isnan(t) || isinf(t)) t = uAmbient;
    t = clamp(t, uTMin, uTMax);
  }
  outValue = vec4(t, 0.0, 0.0, 1.0);
}
