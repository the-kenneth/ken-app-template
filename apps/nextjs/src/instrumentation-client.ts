// Client-side Sentry init. No-op unless NEXT_PUBLIC_SENTRY_DSN is set —
// enable per project by adding the DSN to .env (see README).
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}

// oxlint-disable-next-line import/namespace -- exists in the client entry of @sentry/nextjs; the linter resolves the server types
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
