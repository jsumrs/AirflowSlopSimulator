import { defineConfig } from "vitest/config";
import preact from "@preact/preset-vite";

export default defineConfig({
  // Relative asset paths so the build works under a subpath (GitHub Pages).
  base: "./",
  plugins: [preact()],
  test: {
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
  },
});
