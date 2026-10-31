#version 300 es
precision highp float;

uniform vec4 uColor;  // straight alpha
in float vAlpha;
out vec4 outColor;

void main() {
  float a = uColor.a * vAlpha;
  outColor = vec4(uColor.rgb * a, a);  // premultiplied
}
