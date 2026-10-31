#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include random
// #include polyline

// Draws polylines stored in a float texture (see polyline.glsl) without vertex buffers.
//   uKind 0: particle trails, 6 vertices per segment, fading toward the tail.
//   uKind 1: streamlines, 6 vertices per segment, fading with low speed and at the ends.
//   uKind 2: particle heads, one point per particle.
uniform sampler2D uState;
uniform int uKind;
uniform int uLen;
uniform int uPerRow;
uniform vec2 uRes;       // drawing buffer, device px
uniform vec2 uOrigin;    // grid top-left, device px (y down)
uniform float uScale;    // device px per tile
uniform float uWidth;    // line width, device px
uniform float uFullSpeed; // streamlines: air speed (tiles/s) drawn at full strength

out float vAlpha;

vec4 point(int line, int k) { return texelFetch(uState, pointTexel(line, k, uLen, uPerRow), 0); }
vec2 screen(vec2 p) { return uOrigin + p * uScale; }
vec4 clip(vec2 px) { return vec4(px.x / uRes.x * 2.0 - 1.0, 1.0 - px.y / uRes.y * 2.0, 0.0, 1.0); }

/** Particle fade in after spawning and out before dying. */
float lifeFade(int line, vec4 s) {
  float life = particleLife(uint(line), s.w);
  return smoothstep(0.0, 0.3, s.z) * (1.0 - smoothstep(life - 0.5, life, s.z));
}

void hide() {
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  gl_PointSize = 0.0;
  vAlpha = 0.0;
}

void main() {
  if (uKind == 2) {
    vec4 s = point(gl_VertexID, 0);
    if (s.z < 0.0) { hide(); return; }
    gl_Position = clip(screen(s.xy));
    gl_PointSize = uWidth * 2.0;
    vAlpha = lifeFade(gl_VertexID, s);
    return;
  }

  int segs = uLen - 1;
  int seg = gl_VertexID / 6;
  int corner = gl_VertexID % 6;
  int line = seg / segs;
  int k = seg % segs;
  vec4 a = point(line, k);
  vec4 b = point(line, k + 1);
  // Particles: an older point with a larger age means the particle respawned in between.
  bool valid = uKind == 0 ? (a.z >= 0.0 && b.z >= 0.0 && a.z > b.z) : (a.z > 0.0 && b.z > 0.0);
  vec2 pa = screen(a.xy);
  vec2 pb = screen(b.xy);
  vec2 d = pb - pa;
  float len = length(d);
  if (!valid || len < 1e-3) { hide(); return; }

  // Two triangles: (A-, A+, B-), (B-, A+, B+).
  bool atB = corner == 2 || corner == 3 || corner == 5;
  float side = (corner == 1 || corner == 4 || corner == 5) ? 1.0 : -1.0;
  vec2 n = vec2(-d.y, d.x) / len * (0.5 * uWidth);
  gl_Position = clip((atB ? pb : pa) + n * side);

  float t = (float(k) + (atB ? 1.0 : 0.0)) / float(segs);  // 0 at the first point, 1 at the last
  if (uKind == 0) {
    vAlpha = (1.0 - t) * lifeFade(line, point(line, 0));
  } else {
    float speed = atB ? b.w : a.w;
    float ends = 1.0 - smoothstep(0.7, 1.0, abs(t * 2.0 - 1.0));
    vAlpha = ends * mix(0.25, 1.0, smoothstep(0.05, uFullSpeed, speed));
  }
}
