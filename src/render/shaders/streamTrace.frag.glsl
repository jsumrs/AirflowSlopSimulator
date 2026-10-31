#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
precision highp usampler2D;
// #include random
// #include field
// #include polyline

// Streamline tracing. Each line starts from a jittered seed and runs `uHalf` steps of
// fixed length backward (k < uHalf) and forward (k > uHalf) along the air. Texel =
// (x, y, 1 = valid / -1 = stopped, air speed there). A trace stops in still air,
// at walls, and at the grid edge.
uniform int uLen;        // 2 * uHalf + 1
uniform int uPerRow;
uniform int uHalf;
uniform int uSeedCols;
uniform float uSpacing;  // tiles between seeds
uniform float uStep;     // tiles per step

out vec4 outValue;

const float MIN_SPEED = 0.05;

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  int line = c.y * uPerRow + c.x / uLen;
  int k = c.x % uLen - uHalf;
  ivec2 cell = ivec2(line % uSeedCols, line / uSeedCols);
  vec2 jitter = vec2(rand01(uint(line), 1u), rand01(uint(line), 2u)) - 0.5;
  vec2 p = (vec2(cell) + 0.5 + 0.7 * jitter) * uSpacing;
  float dir = k < 0 ? -1.0 : 1.0;
  int n = abs(k);
  bool valid = openAir(p);
  for (int i = 0; i < 256; i++) {
    if (i >= n || !valid) break;
    vec2 v1 = velAt(p);
    float s1 = length(v1);
    if (s1 < MIN_SPEED) { valid = false; break; }
    vec2 mid = p + dir * (v1 / s1) * (0.5 * uStep);
    vec2 v2 = velAt(mid);
    float s2 = length(v2);
    if (s2 < MIN_SPEED) { valid = false; break; }
    p += dir * (v2 / s2) * uStep;
    valid = openAir(p);
  }
  outValue = vec4(p, valid ? 1.0 : -1.0, length(velAt(p)));
}
