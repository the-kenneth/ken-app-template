"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { Button } from "@ken/ui/button";

// Route-level error boundary: catches render errors below the root layout,
// so the page chrome survives. Caught errors bypass Sentry's global handler,
// so report them here (no-op without a DSN).
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="container mx-auto flex max-w-2xl flex-col items-center gap-4 py-16">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-center text-muted-foreground">
        An unexpected error occurred. Try again, or reload the page.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
