// Server-side Sentry init (Node + edge runtimes). No-op unless
// NEXT_PUBLIC_SENTRY_DSN is set — enable per project via .env (see README).
import * as Sentry from "@sentry/nextjs";

export function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (dsn) {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
