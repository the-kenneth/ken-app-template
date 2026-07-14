import { defineApp } from "convex/server";
import { v } from "convex/values";

// Declares the environment variables this deployment expects. This does NOT
// set values — set those per-deployment via `npx convex env set NAME value`
// (or the Convex dashboard). Declaring them here gives deploy-time validation
// and a typed `env` object importable from `./_generated/server`.
//
// Note: `auth.config.ts` is evaluated at push time and still reads
// `process.env.CLERK_FRONTEND_API_URL` directly — the typed `env` import is
// for functions (queries/mutations/actions/httpActions).
const app = defineApp({
  env: {
    // Clerk Frontend API URL, e.g. https://verb-noun-00.clerk.accounts.dev
    CLERK_FRONTEND_API_URL: v.string(),
    // Clerk webhook signing secret — optional in dev (see http.ts).
    CLERK_WEBHOOK_SECRET: v.optional(v.string()),
  },
});

export default app;
