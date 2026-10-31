#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;

uniform usampler2D uTiles;
uniform vec2 uRes;       // drawing buffer size, device px
uniform vec2 uOrigin;    // grid top-left, device px (y down)
uniform float uScale;    // device px per tile
uniform float uDpr;
uniform ivec2 uGrid;
uniform float uGridLines;
uniform float uAmbient;
uniform ivec2 uSelected; // (-1,-1) = none
uniform ivec2 uHover;
uniform vec2 uDirs[8];   // unit direction vectors, y down

out vec4 outColor;

// Light, industrial palette.
const vec3 BG_OUTSIDE = vec3(0.85, 0.86, 0.87);
const vec3 AIR = vec3(0.94, 0.95, 0.95);
const vec3 WALL = vec3(0.30, 0.33, 0.37);
const vec3 FAN_BG = vec3(0.82, 0.84, 0.86);
const vec3 GLASS = vec3(0.62, 0.80, 0.92);
const vec3 INK = vec3(0.12, 0.13, 0.15);
const vec3 ACCENT = vec3(1.0, 0.48, 0.0);

// Heat ramp: blue -> white (ambient) -> red, fixed 0..100 C scale.
vec3 heatColor(float c) {
  vec3 blue = vec3(0.2, 0.4, 0.9);
  vec3 red = vec3(0.9, 0.15, 0.1);
  if (c >= uAmbient) return mix(vec3(1.0), red, clamp((c - uAmbient) / max(100.0 - uAmbient, 1.0), 0.0, 1.0));
  return mix(vec3(1.0), blue, clamp((uAmbient - c) / max(uAmbient, 1.0), 0.0, 1.0));
}

// Fan level colour, a secondary cue: green 1-2, yellow 3, red 4-5.
vec3 levelColor(float level) {
  if (level < 2.5) return vec3(0.1, 0.9, 0.25);
  if (level < 3.5) return vec3(1.0, 0.85, 0.0);
  return vec3(0.95, 0.1, 0.1);
}

float sdBox(vec2 p, vec2 c, vec2 h) {
  vec2 q = abs(p - c) - h;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

// Zoomed out: sharp arrow pointing along +x whose length and weight grow with level.
float sdArrow(vec2 q, float level) {
  float tail = 0.1 - (0.14 + 0.05 * level);
  q.x += (0.4 + tail) * 0.5; // centre the whole arrow on the tile
  float shaft = sdBox(q, vec2((0.1 + tail) * 0.5, 0.0), vec2((0.1 - tail) * 0.5, 0.05 + 0.012 * level));
  float e1 = 0.08 - q.x;
  float e2 = (0.3 * abs(q.y) + 0.26 * q.x - 0.104) / 0.397;
  return min(shaft, max(e1, e2));
}

// Zoomed in: one sharp chevron per level, stacked behind the front one. Tip at x = tip.
float sdChevron(vec2 q, float tip) {
  float band = abs(q.x - tip + abs(q.y)) * 0.7071;
  return max(band - 0.025, abs(q.y) - 0.25);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 t = (px - uOrigin) / uScale;
  if (t.x < 0.0 || t.y < 0.0 || t.x >= float(uGrid.x) || t.y >= float(uGrid.y)) {
    outColor = vec4(BG_OUTSIDE, 1.0);
    return;
  }
  ivec2 ti = ivec2(floor(t));
  vec2 f = fract(t) - 0.5;            // tile-local, -0.5..0.5, y down
  float aa = 1.0 / uScale;            // one device px in tile units
  uvec4 d = texelFetch(uTiles, ti, 0);
  uint type = d.r;

  vec3 col = AIR;
  if (type == 1u) {
    // Steel wall with a faint diagonal hatch.
    float h = step(0.5, fract((t.x + t.y) * 2.0));
    col = WALL * (1.0 - 0.07 * h);
  } else if (type == 2u) {
    col = FAN_BG;
    float level = float(d.b);
    vec2 v = uDirs[d.g & 7u];
    vec2 q = vec2(dot(f, v), dot(f, vec2(-v.y, v.x)));
    bool on = (d.g & 128u) != 0u;
    vec3 ink = on ? levelColor(level) : vec3(0.58, 0.6, 0.64);
    float lvl = max(level, 1.0);
    float dist = 1e3;
    if (uScale >= 24.0 * uDpr) {
      // Chevron stack, centred on the tile along the facing direction.
      float front = 0.125 + 0.07 * (lvl - 1.0);
      for (int k = 0; k < 5; k++) {
        if (float(k) >= lvl) break;
        dist = min(dist, sdChevron(q, front - 0.14 * float(k)));
      }
    } else {
      dist = sdArrow(q, lvl);
    }
    // Thin dark outline (at least one device px) keeps every colour readable from afar.
    float ow = max(0.03, aa);
    col = mix(col, INK, 1.0 - smoothstep(ow - aa, ow + aa, dist));
    col = mix(col, ink, 1.0 - smoothstep(-aa, aa, dist));
  } else if (type == 3u) {
    col = heatColor(float(d.b));
    // Equal-length horizontal lines stacked up from the bottom: one per output level.
    if (uScale >= 10.0 * uDpr) {
      float lines = float(d.g);
      float th = max(0.04, aa);
      for (int i = 0; i < 5; i++) {
        if (float(i) >= lines) break;
        float dist = sdBox(f, vec2(0.0, 0.34 - 0.15 * float(i)), vec2(0.3, th));
        col = mix(col, INK, 1.0 - smoothstep(-aa, aa, dist));
      }
    }
    float inset = max(abs(f.x), abs(f.y));
    col = mix(col, INK, smoothstep(0.5 - 3.0 * aa, 0.5 - 2.0 * aa, inset));
  } else if (type == 4u) {
    float inset = max(abs(f.x), abs(f.y));
    float frame = smoothstep(0.5 - 0.12 - aa, 0.5 - 0.12 + aa, inset);
    if (d.g == 1u) {
      col = mix(AIR, GLASS, frame);                       // open: frame only
    } else {
      col = mix(GLASS, GLASS * 0.7, frame);               // closed: solid pane
      float bar = min(abs(f.x), abs(f.y));
      col = mix(col, GLASS * 0.7, 1.0 - smoothstep(0.02 - aa, 0.02 + aa, bar));
    }
  }

  if (ti == uHover) col = mix(col, ACCENT, 0.12);

  if (uGridLines > 0.5) {
    float e = min((0.5 - abs(f.x)) * uScale, (0.5 - abs(f.y)) * uScale); // device px to nearest edge
    float line = 1.0 - smoothstep(0.0, 1.0, e);
    float fade = smoothstep(3.0, 10.0, uScale / uDpr);
    vec3 lc = dot(col, vec3(0.333)) < 0.4 ? vec3(1.0) : vec3(0.0);
    col = mix(col, lc, 0.3 * line * fade);
  }

  if (ti == uSelected) {
    float e = (0.5 - max(abs(f.x), abs(f.y))) * uScale;
    col = mix(col, ACCENT, 1.0 - smoothstep(1.5 * uDpr, 2.5 * uDpr, e));
  }

  outColor = vec4(col, 1.0);
}
