"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { Button } from "@ken/ui-web/button";
import "~/app/styles.css";

// Last-resort boundary: rendered in place of the root layout when the layout
// itself (or anything error.tsx couldn't contain) crashes, so it must render
// its own <html>/<body>. Sentry's App Router setup relies on this file to
// capture client render crashes.
export default function GlobalError({
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
    <html lang="en">
      <body className="bg-background font-sans text-foreground antialiased">
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-center text-muted-foreground">
            An unexpected error occurred. Try again, or reload the page.
          </p>
          <Button onClick={reset}>Try again</Button>
        </main>
      </body>
    </html>
  );
}
