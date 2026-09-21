import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@ken/ui-web/button";

export default function NotFound() {
  const t = useTranslations("web.not-found");
  return (
    <main className="container mx-auto flex max-w-2xl flex-col items-center gap-4 py-16">
      <h1 className="text-5xl font-extrabold tracking-tight">{t("code")}</h1>
      <p className="text-center text-muted-foreground">{t("message")}</p>
      <Button asChild variant="outline">
        <Link href="/">{t("back-home")}</Link>
      </Button>
    </main>
  );
}
