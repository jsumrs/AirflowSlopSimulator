#version 300 es
precision highp float;
precision highp int;
precision highp usampler2D;
precision highp sampler2D;

// Tile grid, drawn in two layers so particles and streamlines sit between them:
//   uLayer 0: base fill (air, or the heat map), opaque.
//   uLayer 1: tile glyphs, airflow arrows, hover, grid lines and selection, with
//             premultiplied alpha (transparent over plain air).
uniform int uLayer;
uniform usampler2D uTiles;
uniform sampler2D uTemp;  // R32F temperature, sim resolution
uniform ivec2 uSim;       // sim grid size
uniform int uQuality;     // sim cells per tile edge
uniform float uHeatOn;    // heat map overlay
uniform float uLo;        // heat scale range, C
uniform float uHi;
uniform sampler2D uTileAvg; // RGBA32F per tile: temperature, velocity x, velocity y
uniform float uArrows;      // airflow arrow overlay
uniform float uArrowFull;   // air speed (tiles/s) drawn as a full-length arrow
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
uniform float uSimTime;    // sim seconds (wrapped), drives the heater pulse
uniform float uSweepPhase; // sweepPhase(sim time), same as the solver
uniform float uSweepHalf;  // SWEEP_HALF_ANGLE

out vec4 outColor;

// Light, industrial palette.
const vec3 BG_OUTSIDE = vec3(0.85, 0.86, 0.87);
const vec3 AIR = vec3(0.94, 0.95, 0.95);
const vec3 WALL = vec3(0.30, 0.33, 0.37);
const vec3 PLATE = vec3(0.90, 0.91, 0.92);     // object plate (UI panel grey)
const vec3 PLATE_OFF = vec3(0.78, 0.80, 0.82); // powered-off plate
const vec3 GLASS = vec3(0.62, 0.80, 0.92);
const vec3 GLASS_DARK = vec3(0.28, 0.48, 0.62);
const vec3 INK = vec3(0.12, 0.13, 0.15);
const vec3 ACCENT = vec3(1.0, 0.48, 0.0);
const vec3 FAN_OFF = vec3(0.45, 0.48, 0.52);
const vec3 HEAT_GLOW = vec3(1.0, 0.62, 0.15);
const float TAU = 6.2831853;

// Heat ramp: blue (uLo) -> white (ambient) -> red (uHi). White always sits at ambient.
vec3 heatColor(float c) {
  vec3 blue = vec3(0.2, 0.4, 0.9);
  vec3 red = vec3(0.9, 0.15, 0.1);
  if (c >= uAmbient) return mix(vec3(1.0), red, clamp((c - uAmbient) / max(uHi - uAmbient, 1e-3), 0.0, 1.0));
  return mix(vec3(1.0), blue, clamp((uAmbient - c) / max(uAmbient - uLo, 1e-3), 0.0, 1.0));
}

// Bilinear temperature at tile coords `t` (manual: float textures may not filter).
float tempAt(vec2 t) {
  vec2 s = t * float(uQuality) - 0.5;
  vec2 b = floor(s);
  vec2 fr = s - b;
  ivec2 i0 = ivec2(b);
  ivec2 hi = uSim - 1;
  float a = texelFetch(uTemp, clamp(i0, ivec2(0), hi), 0).r;
  float bx = texelFetch(uTemp, clamp(i0 + ivec2(1, 0), ivec2(0), hi), 0).r;
  float cy = texelFetch(uTemp, clamp(i0 + ivec2(0, 1), ivec2(0), hi), 0).r;
  float d = texelFetch(uTemp, clamp(i0 + ivec2(1, 1), ivec2(0), hi), 0).r;
  return mix(mix(a, bx, fr.x), mix(cy, d, fr.x), fr.y);
}

// Fan level colour: green 1, yellow 3, red 5, blended in between.
vec3 levelColor(float level) {
  vec3 green = vec3(0.10, 0.78, 0.25);
  vec3 yellow = vec3(1.0, 0.82, 0.0);
  vec3 red = vec3(0.93, 0.12, 0.10);
  float t = clamp((level - 1.0) * 0.25, 0.0, 1.0);
  return t < 0.5 ? mix(green, yellow, t * 2.0) : mix(yellow, red, t * 2.0 - 1.0);
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

// Airflow arrow along +x, centred, total length `len` (tiles). Sharp shaft and head.
float sdFlowArrow(vec2 q, float len) {
  float head = min(0.18, len * 0.5);
  float hw = head * 0.65;
  float tip = len * 0.5;
  float base = tip - head;
  float shaft = sdBox(q, vec2((base - len * 0.5) * 0.5, 0.0), vec2((base + len * 0.5) * 0.5, 0.028));
  float e1 = base - q.x;
  float e2 = (abs(q.y) * head + (q.x - tip) * hw) / length(vec2(hw, head));
  return min(shaft, max(e1, e2));
}

// Zoomed in: one sharp chevron per level (the level ticks), stacked behind the front one.
float sdChevron(vec2 q, float tip) {
  float band = abs(q.x - tip + abs(q.y)) * 0.7071;
  return max(band - 0.025, abs(q.y) - 0.25);
}

vec2 rotate(vec2 v, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec2(c * v.x - s * v.y, s * v.x + c * v.y);
}

// Composite colour `c` at coverage `a` over premultiplied `o`.
void over(inout vec4 o, vec3 c, float a) {
  o = o * (1.0 - a) + vec4(c * a, a);
}

// Object plates are flat and square with a dark edge, like the UI controls.
// State reads from the whole plate, so it holds at any zoom:
//   on  = coloured plate (fan: level colour, heater: target temperature)
//   off = flat grey plate, hollow/greyed marks and a slash
// Fine detail (level ticks, sweep arc, radiator lines, LED) fades in with zoom.

// 1 on the outer edge band of the tile: about 2.5 device px when zoomed in, never
// under 1 px and never more than 7% of the tile, so small tiles keep their fill.
float edgeBand(vec2 f, float aa) {
  float w = max(aa, min(2.5 * aa, 0.07));
  return smoothstep(0.5 - w - aa, 0.5 - w + aa, max(abs(f.x), abs(f.y)));
}

// Power-off slash, bottom-left to top-right.
float slash(vec2 f, float aa) {
  float d = abs(f.x + f.y) * 0.7071;
  float inside = 1.0 - smoothstep(0.40, 0.40 + aa, max(abs(f.x), abs(f.y)));
  return (1.0 - smoothstep(0.035 - aa, 0.035 + aa, d)) * inside;
}

// Fan: plate tinted by level (green 1, yellow 3, red 5) with a dark arrow (zoomed out)
// or one chevron per level (zoomed in). Off: grey plate, hollow arrow, slash. While
// oscillating the arrow swings with the solver's sweep, over a faint arc of the range.
vec4 fanGlyph(uvec4 d, vec2 f, float aa) {
  float level = max(float(d.b), 1.0);
  bool on = (d.g & 128u) != 0u;
  bool osc = (d.g & 8u) != 0u;
  vec2 setDir = uDirs[d.g & 7u];
  vec2 v = setDir;
  if (on && osc) v = rotate(setDir, uSweepHalf * sin(float((d.g >> 4) & 7u) * uSweepPhase));
  vec3 col = on ? mix(PLATE, levelColor(level), 0.55) : PLATE_OFF;

  if (osc && uScale >= 10.0 * uDpr) {
    float r = length(f);
    float ang = acos(clamp(dot(f / max(r, 1e-4), setDir), -1.0, 1.0));
    float ring = abs(r - 0.42) - max(0.015, 0.5 * aa);
    float wedge = (ang - uSweepHalf) * r;
    float arc = max(ring, wedge);
    col = mix(col, INK, (on ? 0.55 : 0.3) * (1.0 - smoothstep(-aa, aa, arc)));
  }

  vec2 q = vec2(dot(f, v), dot(f, vec2(-v.y, v.x)));
  float dist = 1e3;
  bool chevrons = uScale >= 24.0 * uDpr;
  if (chevrons) {
    float front = 0.125 + 0.07 * (level - 1.0);
    for (int k = 0; k < 5; k++) {
      if (float(k) >= level) break;
      dist = min(dist, sdChevron(q, front - 0.14 * float(k)));
    }
  } else {
    dist = sdArrow(q, level);
  }
  if (on) {
    col = mix(col, INK, 1.0 - smoothstep(-aa, aa, dist));
  } else {
    // Hollow: outline only, in grey.
    float line = chevrons ? dist : abs(dist) - max(0.02, aa);
    col = mix(col, FAN_OFF, 1.0 - smoothstep(-aa, aa, line));
    col = mix(col, FAN_OFF, slash(f, aa));
  }
  col = mix(col, on ? INK : FAN_OFF, edgeBand(f, aa));
  return vec4(col, 1.0);
}

// Heater: plate filled with its target temperature on the heat scale. Radiator lines
// rise from the bottom for the output rate (a bar when tiles are small). Heating: the
// plate pulses orange and a lamp lights. Off: grey plate, grey lines, slash.
vec4 heaterGlyph(uvec4 d, ivec2 ti, vec2 f, float aa) {
  float target = float(d.b);
  bool on = d.g >= 128u;
  float rate = float(d.g & 7u);
  vec3 col = heatColor(target);
  if (!on) col = PLATE_OFF;
  float tileTemp = texelFetch(uTileAvg, ti, 0).r;
  bool heating = on && tileTemp < target - 0.5;
  float pulse = 0.5 + 0.5 * sin(TAU * uSimTime);
  if (heating) col = mix(col, HEAT_GLOW, 0.5 * pulse);

  vec3 mark = on ? INK : FAN_OFF;
  if (uScale >= 10.0 * uDpr) {
    float th = max(0.04, aa);
    for (int i = 0; i < 5; i++) {
      if (float(i) >= rate) break;
      float dist = sdBox(f, vec2(0.0, 0.3 - 0.14 * float(i)), vec2(0.28, th));
      col = mix(col, mark, 1.0 - smoothstep(-aa, aa, dist));
    }
  } else {
    float h = 0.1 + 0.1 * rate;
    float dist = sdBox(f, vec2(0.0, 0.38 - 0.5 * h), vec2(0.3, 0.5 * h));
    col = mix(col, mark, 1.0 - smoothstep(-aa, aa, dist));
  }
  if (heating && uScale >= 14.0 * uDpr) {
    float lamp = sdBox(f, vec2(0.3, -0.3), vec2(0.065));
    col = mix(col, ACCENT, 1.0 - smoothstep(-aa, aa, lamp));
    col = mix(col, INK, 1.0 - smoothstep(-aa, aa, abs(lamp) - max(0.015, aa)));
  }
  if (!on) col = mix(col, FAN_OFF, slash(f, aa));
  col = mix(col, on ? INK : FAN_OFF, edgeBand(f, aa));
  return vec4(col, 1.0);
}

// Window: closed is a solid pane in a frame with glazing bars; open is the frame only
// (air shows through) with the sash swung across it.
vec4 windowGlyph(uvec4 d, vec2 f, float aa) {
  bool open = d.g == 1u;
  float m = max(abs(f.x), abs(f.y));
  float frame = smoothstep(0.5 - 0.13 - aa, 0.5 - 0.13 + aa, m);
  float outer = edgeBand(f, aa);
  if (open) {
    float sash = 0.0;
    if (uScale >= 8.0 * uDpr) {
      sash = (1.0 - smoothstep(0.03 - aa, 0.03 + aa, abs(f.x - f.y) * 0.7071)) * (1.0 - frame);
    }
    float a = max(max(frame, sash), outer);
    return vec4(mix(GLASS_DARK, INK, outer) * a, a);
  }
  vec3 col = mix(GLASS, GLASS_DARK, frame);
  float bar = min(abs(f.x), abs(f.y));
  col = mix(col, GLASS_DARK, 1.0 - smoothstep(0.02 - aa, 0.02 + aa, bar));
  col = mix(col, INK, outer);
  return vec4(col, 1.0);
}

void main() {
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 t = (px - uOrigin) / uScale;
  bool outside = t.x < 0.0 || t.y < 0.0 || t.x >= float(uGrid.x) || t.y >= float(uGrid.y);
  vec3 air = outside ? BG_OUTSIDE : (uHeatOn > 0.5 ? heatColor(tempAt(t)) : AIR);
  if (uLayer == 0 || outside) {
    outColor = uLayer == 0 ? vec4(air, 1.0) : vec4(0.0);
    return;
  }

  ivec2 ti = ivec2(floor(t));
  vec2 f = fract(t) - 0.5;            // tile-local, -0.5..0.5, y down
  float aa = 1.0 / uScale;            // one device px in tile units
  uvec4 d = texelFetch(uTiles, ti, 0);
  uint type = d.r;

  vec4 o = vec4(0.0);
  if (type == 1u) {
    // Steel wall with a faint diagonal hatch.
    float h = step(0.5, fract((t.x + t.y) * 2.0));
    o = vec4(WALL * (1.0 - 0.07 * h), 1.0);
  } else if (type == 2u) {
    o = fanGlyph(d, f, aa);
  } else if (type == 3u) {
    o = heaterGlyph(d, ti, f, aa);
  } else if (type == 4u) {
    o = windowGlyph(d, f, aa);
  }

  // Airflow arrows: one per tile, over air, heaters and open windows.
  bool passable = type == 0u || type == 3u || (type == 4u && d.g == 1u);
  if (uArrows > 0.5 && passable && uScale >= 6.0 * uDpr) {
    vec2 vel = texelFetch(uTileAvg, ti, 0).gb;
    float speed = length(vel);
    float k = clamp(speed / uArrowFull, 0.0, 1.0);
    float alpha = smoothstep(0.02, 0.15, k);
    if (alpha > 0.0) {
      vec2 dir = vel / speed;
      vec2 q = vec2(dot(f, dir), dot(f, vec2(-dir.y, dir.x)));
      float dist = sdFlowArrow(q, 0.25 + 0.6 * k);
      over(o, INK, 0.85 * alpha * (1.0 - smoothstep(-aa, aa, dist)));
    }
  }

  if (ti == uHover) over(o, ACCENT, 0.12);

  if (uGridLines > 0.5) {
    float e = min((0.5 - abs(f.x)) * uScale, (0.5 - abs(f.y)) * uScale); // device px to nearest edge
    float line = 1.0 - smoothstep(0.0, 1.0, e);
    float fade = smoothstep(3.0, 10.0, uScale / uDpr);
    vec3 under = o.rgb + air * (1.0 - o.a);
    vec3 lc = dot(under, vec3(0.333)) < 0.4 ? vec3(1.0) : vec3(0.0);
    over(o, lc, 0.3 * line * fade);
  }

  if (ti == uSelected) {
    float e = (0.5 - max(abs(f.x), abs(f.y))) * uScale;
    over(o, ACCENT, 1.0 - smoothstep(1.5 * uDpr, 2.5 * uDpr, e));
  }

  outColor = o;
}
