/**
 * Shared setup for convex-test: the module map tells the mock backend where
 * the Convex functions live. Passing it explicitly (instead of relying on
 * convex-test's default lookup) keeps tests working inside a monorepo.
 */
export const modules = import.meta.glob([
  "./**/*.{js,ts}",
  "!./**/*.test.*",
  "!./**/*.d.ts",
  "!./test.setup.ts",
]);
