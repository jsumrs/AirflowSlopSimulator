// Polyline storage shared by particles and streamlines. Pasted in place of `// #include polyline`.
// Point k of line i lives at texel ((i % perRow) * len + k, i / perRow).
ivec2 pointTexel(int line, int k, int len, int perRow) {
  return ivec2((line % perRow) * len + k, line / perRow);
}
