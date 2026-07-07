import type { Metadata, Viewport } from "next";

import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

import { cn } from "@acme/ui";
import { ThemeProvider, ThemeToggle } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";
import { env } from "~/env";

import { ConvexClientProvider } from "./providers";

import "~/app/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production"
      ? "https://example.com" // TODO: your production URL
      : "http://localhost:3000",
  ),
  title: "Acme",
  description: "Web + mobile monorepo template (Next.js, Expo, Convex, Clerk)",
};

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

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <ClerkProvider>
          <ThemeProvider>
            <ConvexClientProvider>{props.children}</ConvexClientProvider>
            <div className="absolute right-4 bottom-4">
              <ThemeToggle />
            </div>
            <Toaster />
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
