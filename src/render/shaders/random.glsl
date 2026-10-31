// Integer hash noise. Pasted in place of `// #include random`.
uint hashU(uint x) {
  x ^= x >> 16;
  x *= 0x7feb352du;
  x ^= x >> 15;
  x *= 0x846ca68bu;
  x ^= x >> 16;
  return x;
}

/** Uniform in [0, 1) from two integers. */
float rand01(uint a, uint b) { return float(hashU(a ^ hashU(b + 0x9e3779b9u)) >> 8) / 16777216.0; }

/** Particle lifetime in sim seconds, the same in the update and draw passes. */
float particleLife(uint id, float seed) { return 2.0 + 3.0 * rand01(id ^ 0x5bd1e995u, uint(seed)); }
