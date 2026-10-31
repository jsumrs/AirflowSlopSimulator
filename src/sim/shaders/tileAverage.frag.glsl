#version 300 es
// Average a sim field over each tile's cells (for readField).
precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D uField;
uniform int uQuality;

out vec4 outValue;

void main() {
  ivec2 tile = ivec2(gl_FragCoord.xy);
  float sum = 0.0;
  for (int j = 0; j < 4; j++) {
    for (int i = 0; i < 4; i++) {
      if (i < uQuality && j < uQuality) sum += texelFetch(uField, tile * uQuality + ivec2(i, j), 0).r;
    }
  }
  outValue = vec4(sum / float(uQuality * uQuality), 0.0, 0.0, 1.0);
}
