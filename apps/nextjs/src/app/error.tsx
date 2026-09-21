"use client";

import * as Sentry from "@sentry/nextjs";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

import { Button } from "@ken/ui-web/button";

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
  const t = useTranslations("shared.errors");
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="container mx-auto flex max-w-2xl flex-col items-center gap-4 py-16">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-center text-muted-foreground">{t("description")}</p>
      <Button onClick={reset}>{t("retry")}</Button>
    </main>
  );
}
