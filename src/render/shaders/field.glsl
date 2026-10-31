// Velocity and tile lookups for passes that move through the air. Pasted in place of
// `// #include field`. Positions are in tile coordinates (y down).
uniform sampler2D uVel;     // RG32F, sim resolution, tiles/s
uniform usampler2D uTiles;  // RGBA8UI tile data (tileTexture.ts)
uniform ivec2 uSim;         // sim grid size, cells
uniform int uQuality;       // sim cells per tile edge
uniform ivec2 uGrid;        // tile grid size

vec2 velTap(ivec2 c) { return texelFetch(uVel, clamp(c, ivec2(0), uSim - 1), 0).xy; }

/** Bilinear air velocity at tile coords `p` (float textures may not filter). */
vec2 velAt(vec2 p) {
  vec2 s = p * float(uQuality) - 0.5;
  vec2 b = floor(s);
  vec2 f = s - b;
  ivec2 i0 = ivec2(b);
  vec2 a = mix(velTap(i0), velTap(i0 + ivec2(1, 0)), f.x);
  vec2 d = mix(velTap(i0 + ivec2(0, 1)), velTap(i0 + ivec2(1, 1)), f.x);
  return mix(a, d, f.y);
}

bool insideGrid(vec2 p) { return p.x >= 0.0 && p.y >= 0.0 && p.x < float(uGrid.x) && p.y < float(uGrid.y); }

/** Walls and closed windows. */
bool blockedAt(vec2 p) {
  uvec4 d = texelFetch(uTiles, ivec2(floor(p)), 0);
  return d.r == 1u || (d.r == 4u && d.g == 0u);
}

bool openAir(vec2 p) { return insideGrid(p) && !blockedAt(p); }
