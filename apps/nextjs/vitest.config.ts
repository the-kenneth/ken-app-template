import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.join(path.dirname(fileURLToPath(import.meta.url)), "src"),
    },
  },
  // The app's tsconfig uses `jsx: preserve` (Next compiles JSX itself);
  // tell Vitest's transform (oxc in rolldown-vite) to compile it instead.
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "happy-dom",
  },
});
