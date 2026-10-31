#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Fan momentum and (gravity on) buoyancy. Solids have no velocity. Mirrors CpuSim.velSource.
uniform sampler2D uVel;
uniform sampler2D uTemp;
uniform float uDt;
uniform float uFanK;        // 1 - exp(-FAN_RESPONSE * dt)
uniform float uGravity;     // 0 / 1
uniform float uBuoyancy;
uniform float uAmbient;
uniform float uSweepPhase;  // sweepPhase(time)
uniform float uSweepHalf;   // SWEEP_HALF_ANGLE

out vec4 outValue;

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec2 v = texelFetch(uVel, c, 0).xy;
  if (solidAt(c)) {
    v = vec2(0.0);
  } else {
    vec4 fan = propsB(c);
    if (fan.z > 0.0) {
      vec2 dir = fan.xy;
      if (fan.w > 0.0) {
        // Oscillating: rotate the set direction by the current sweep angle.
        float a = uSweepHalf * sin(fan.w * uSweepPhase);
        float ca = cos(a);
        float sa = sin(a);
        dir = vec2(ca * dir.x - sa * dir.y, sa * dir.x + ca * dir.y);
      }
      v += (dir * fan.z - v) * uFanK;
    }
    if (uGravity > 0.5) v.y -= uBuoyancy * (texelFetch(uTemp, c, 0).r - uAmbient) * uDt;
  }
  outValue = vec4(v, 0.0, 1.0);
}
