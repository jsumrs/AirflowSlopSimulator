#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp usampler2D;
// #include random
// #include field
// #include polyline

// Particle state: one polyline per particle, point 0 = now, point k = k updates ago.
// Texel = (x, y, age in sim seconds, respawn count). Age < 0 = hidden (no open spot found).
uniform sampler2D uState;
uniform int uLen;      // trail points per particle
uniform int uPerRow;
uniform float uDt;     // sim seconds since the last update

out vec4 outValue;

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  int k = c.x % uLen;
  if (k > 0) {
    // Trail: shift one point back.
    outValue = texelFetch(uState, c - ivec2(1, 0), 0);
    return;
  }
  vec4 s = texelFetch(uState, c, 0);
  uint id = uint(c.y * uPerRow + c.x / uLen);
  vec2 p = s.xy;
  float age = s.z;
  float seed = s.w;
  if (age >= 0.0 && age < particleLife(id, seed) && openAir(p)) {
    // Midpoint (RK2) step along the air.
    vec2 mid = p + 0.5 * uDt * velAt(p);
    p += uDt * velAt(mid);
    age += uDt;
    if (openAir(p)) {
      outValue = vec4(p, age, seed);
      return;
    }
  }
  // Respawn somewhere random. If that spot is solid, stay hidden and retry next update.
  seed += 1.0;
  uint n = uint(seed) * 2u;
  p = vec2(rand01(id, n), rand01(id, n + 1u)) * vec2(uGrid);
  outValue = vec4(p, openAir(p) ? 0.0 : -1.0, seed);
}
