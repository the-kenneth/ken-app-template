/**
 * Mobile environment variables — the counterpart to `apps/nextjs/src/env.ts`.
 *
 * Metro inlines `process.env.EXPO_PUBLIC_*` at bundle time, so every variable
 * must be referenced as a literal below; a computed lookup resolves to
 * `undefined` in a release build.
 */

/** Optional — crash reporting no-ops while this is unset. */
export const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

const required = {
  EXPO_PUBLIC_CONVEX_URL: process.env.EXPO_PUBLIC_CONVEX_URL,
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
};

export interface Env {
  convexUrl: string;
  clerkPublishableKey: string;
}

/**
 * Validates the required variables and returns them. Throws listing *every*
 * problem at once, so a half-filled `.env` takes one round trip to fix.
 *
 * Call this after `Sentry.init` so a misconfigured build still reports.
 */
export function loadEnv(): Env {
  const problems = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([name]) => `  ${name} is missing`);

  // A literal prefix test, not `new URL()`: React Native's URL polyfill is
  // partial and does not reject the malformed values worth catching here.
  const convexUrl = required.EXPO_PUBLIC_CONVEX_URL;
  if (convexUrl && !convexUrl.startsWith("https://")) {
    problems.push(
      `  EXPO_PUBLIC_CONVEX_URL is not a URL — expected https://your-deployment.convex.cloud (got ${convexUrl})`,
    );
  } else if (convexUrl && !convexUrl.endsWith(".convex.cloud")) {
    // A warning, not an error: self-hosted deployments use their own domain.
    console.warn(
      `EXPO_PUBLIC_CONVEX_URL does not end in .convex.cloud (${convexUrl}) — ` +
        `expected unless you are self-hosting. The dashboard URL is not the deployment URL.`,
    );
  }

  if (problems.length > 0) {
    throw new Error(
      `Invalid mobile environment:\n${problems.join("\n")}\n\n` +
        `Fix these in the repo-root .env (copy .env.example if you have not yet), ` +
        `then restart Metro with a cleared cache: pnpm -F @ken/expo dev --clear`,
    );
  }

  return {
    convexUrl: convexUrl!,
    clerkPublishableKey: required.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  };
}
