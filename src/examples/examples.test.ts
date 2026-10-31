import { expect, it } from "vitest";
import { parseSave, toJson } from "../io/format";
import { EXAMPLES } from "./index";

it("every example parses through the import path and round-trips", () => {
  for (const ex of EXAMPLES) {
    const snap = parseSave(ex.json);
    expect(parseSave(toJson(snap)).layout.types).toEqual(snap.layout.types);
  }
});
