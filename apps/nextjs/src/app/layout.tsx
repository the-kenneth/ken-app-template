import type { Metadata, Viewport } from "next";

import { enUS } from "@clerk/localizations/en-US";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";

import { getWebMessages } from "@ken/locales";
import { cn } from "@ken/ui-web";
import { ThemeProvider, ThemeToggle } from "@ken/ui-web/theme";
import { Toaster } from "@ken/ui-web/toast";
import { env } from "~/env";
import { WEB_LANGUAGE_TAG } from "~/i18n/request";

import { ConvexClientProvider } from "./providers";

import "~/app/styles.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("web.metadata");
  const product = await getTranslations("shared.product");
  return {
    metadataBase: new URL(
      env.VERCEL_ENV === "production"
        ? "https://example.com" // TODO: your production URL
        : "http://localhost:3000",
    ),
    title: product("name"),
    description: t("description"),
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default async function RootLayout(props: { children: React.ReactNode }) {
  const t = await getTranslations("web.theme");
  const messages = getWebMessages(WEB_LANGUAGE_TAG);

  return (
    <html lang={WEB_LANGUAGE_TAG} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <NextIntlClientProvider locale={WEB_LANGUAGE_TAG} messages={messages}>
          <ClerkProvider localization={enUS}>
            <ThemeProvider>
              <ConvexClientProvider>{props.children}</ConvexClientProvider>
              <div className="absolute right-4 bottom-4">
                <ThemeToggle
                  labels={{
                    toggle: t("toggle"),
                    light: t("light"),
                    dark: t("dark"),
                    system: t("system"),
                  }}
                />
              </div>
              <Toaster />
            </ThemeProvider>
          </ClerkProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
