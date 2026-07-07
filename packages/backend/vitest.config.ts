import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // convex-test emulates the Convex runtime, which is closer to an edge
    // runtime than to Node.
    environment: "edge-runtime",
    server: { deps: { inline: ["convex-test"] } },
  },
});
