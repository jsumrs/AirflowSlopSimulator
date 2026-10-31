import heatedRoom from "./heated-room.json?raw";

/** Example layouts, as save-format JSON text. They load through the normal import path. */
export const EXAMPLES: readonly { id: string; name: string; json: string }[] = [
  { id: "heated-room", name: "Heated room", json: heatedRoom },
];
