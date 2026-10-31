#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Vorticity confinement ("Swirl"): push along N x w to restore small swirls the
// solver blurs away. Mirrors CpuSim.vorticity.
uniform sampler2D uVel;
uniform sampler2D uCurl;
uniform float uDt;
uniform float uEps;   // VORTICITY_STRENGTH * swirl * h

out vec4 outValue;

float curlAt(ivec2 c) { return texelFetch(uCurl, clampCell(c), 0).r; }

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  vec2 v = texelFetch(uVel, c, 0).xy;
  if (!solidAt(c) && !onEdge(c)) {
    float half_q = 0.5 * float(uQuality);
    float gx = (abs(curlAt(c + ivec2(1, 0))) - abs(curlAt(c - ivec2(1, 0)))) * half_q;
    float gy = (abs(curlAt(c + ivec2(0, 1))) - abs(curlAt(c - ivec2(0, 1)))) * half_q;
    float len = sqrt(gx * gx + gy * gy) + 1e-5;
    float w = curlAt(c);
    v += uEps * vec2(gy / len * w, -gx / len * w) * uDt;
  }
  outValue = vec4(v, 0.0, 1.0);
}
