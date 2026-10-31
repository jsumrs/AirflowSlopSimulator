// Shared by the sim passes. GlSolver pastes this in place of the `// #include common` line.
uniform sampler2D uPropsA;  // tile res: conductivity, solid, heater target, heater rate
uniform sampler2D uPropsB;  // tile res: fan dir x, fan dir y, fan speed, unused
uniform ivec2 uSim;         // sim grid size in cells
uniform int uQuality;       // cells per tile edge

const ivec2 OFFS[4] = ivec2[4](ivec2(1, 0), ivec2(-1, 0), ivec2(0, 1), ivec2(0, -1));

bool outsideGrid(ivec2 c) { return c.x < 0 || c.y < 0 || c.x >= uSim.x || c.y >= uSim.y; }
ivec2 clampCell(ivec2 c) { return clamp(c, ivec2(0), uSim - 1); }
vec4 propsA(ivec2 c) { return texelFetch(uPropsA, c / uQuality, 0); }
vec4 propsB(ivec2 c) { return texelFetch(uPropsB, c / uQuality, 0); }
bool solidAt(ivec2 c) { return propsA(c).g > 0.5; }
bool onEdge(ivec2 c) { return c.x == 0 || c.y == 0 || c.x == uSim.x - 1 || c.y == uSim.y - 1; }
