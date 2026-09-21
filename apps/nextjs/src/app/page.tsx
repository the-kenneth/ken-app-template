import { useTranslations } from "next-intl";

import { AuthGate } from "./_components/auth-gate";

export default function HomePage() {
  const t = useTranslations("web.home");
  return (
    <main className="container mx-auto max-w-2xl py-16">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-5xl font-extrabold tracking-tight">
          {t("brand-name")}{" "}
          <span className="text-primary">{t("template-label")}</span>
        </h1>
        <p className="text-center text-muted-foreground">
          {t("stack-description")}
        </p>

        <AuthGate />
      </div>
    </main>
  );
}
