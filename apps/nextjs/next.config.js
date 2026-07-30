import { createJiti } from "jiti";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const jiti = createJiti(import.meta.url);

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
await jiti.import("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: ["@ken/analytics", "@ken/backend", "@ken/ui"],

  /**
   * Pin the workspace root to the monorepo root. Without this, Next.js infers
   * it by walking up for a lockfile and can pick a stray one in a parent dir.
   */
  turbopack: {
    root: join(dirname(fileURLToPath(import.meta.url)), "..", ".."),
  },

  /** We already do linting and typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },
};

export default config;
