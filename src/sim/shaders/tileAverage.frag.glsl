#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
// #include common

// Per-tile means of temperature and velocity, for readback and the arrow overlay.
uniform sampler2D uTemp;
uniform sampler2D uVel;

out vec4 outValue;

void main() {
  ivec2 tile = ivec2(gl_FragCoord.xy);
  vec3 sum = vec3(0.0);
  for (int j = 0; j < 4; j++) {
    for (int i = 0; i < 4; i++) {
      if (i < uQuality && j < uQuality) {
        ivec2 c = tile * uQuality + ivec2(i, j);
        sum += vec3(texelFetch(uTemp, c, 0).r, texelFetch(uVel, c, 0).xy);
      }
    }
  }
  outValue = vec4(sum / float(uQuality * uQuality), 1.0);
}
