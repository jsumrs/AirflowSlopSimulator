import fanTunnel from "./fan-tunnel.json?raw";
import heatedRoom from "./heated-room.json?raw";
import radiatorPlume from "./radiator-plume.json?raw";

/** Example layouts, as save-format JSON text. They load through the normal import path. */
export const EXAMPLES: readonly { id: string; name: string; json: string }[] = [
  { id: "heated-room", name: "Heated room", json: heatedRoom },
  { id: "fan-tunnel", name: "Fan tunnel", json: fanTunnel },
  { id: "radiator-plume", name: "Radiator plume", json: radiatorPlume },
];
