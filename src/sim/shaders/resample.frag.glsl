#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Resample a field from an old sim grid onto the current one (new quality and/or tile
// grid, anchored top-left). Cells over tiles the old grid didn't have get uFill.
// Mirrors CpuSim.resampleFrom.
uniform sampler2D uSrc;
uniform ivec2 uSrcSim;      // old sim grid size, cells
uniform int uSrcQuality;    // old cells per tile edge
uniform vec4 uFill;

out vec4 outValue;

vec4 tap(ivec2 c) { return texelFetch(uSrc, clamp(c, ivec2(0), uSrcSim - 1), 0); }

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec2 p = (vec2(c) + 0.5) / float(uQuality);  // tile coords of this cell's centre
  vec2 srcTiles = vec2(uSrcSim / uSrcQuality);
  if (p.x >= srcTiles.x || p.y >= srcTiles.y) {
    outValue = uFill;
    return;
  }
  vec2 s = p * float(uSrcQuality) - 0.5;
  vec2 b = floor(s);
  vec2 f = s - b;
  ivec2 i0 = ivec2(b);
  vec4 a = mix(tap(i0), tap(i0 + ivec2(1, 0)), f.x);
  vec4 d = mix(tap(i0 + ivec2(0, 1)), tap(i0 + ivec2(1, 1)), f.x);
  outValue = mix(a, d, f.y);
}
