import type { ColorScheme, ColorToken } from "./contracts";

/**
 * The colour source of truth. Hand-edit these; `pnpm tokens:build` regenerates
 * both `tooling/tailwind/theme.css` (oklch, for web) and
 * `src/__generated__/native.ts` (hex, for React Native).
 *
 * Values stay in oklch because it is wider than sRGB — web renders them
 * directly and only the native build flattens to hex.
 *
 * To adopt a theme from tweakcn, export its CSS variables and run
 * `pnpm -F @ken/tokens tokens:import <file.css>` rather than editing by hand.
 *
 * Every hue is 257.4239, taken from the app icon; destructive keeps its own
 * red because it carries meaning rather than brand. Light `primary` sits at
 * L=0.54 so `accentForeground` on `accent` clears AA (4.73).
 */
export type OklchColor = `oklch(${string})`;

export const colors: Record<ColorScheme, Record<ColorToken, OklchColor>> = {
  light: {
    background: "oklch(0.9875 0.0045 257.4239)",
    foreground: "oklch(0.2277 0.0105 257.4239)",
    card: "oklch(1 0 0)",
    cardForeground: "oklch(0.2277 0.0105 257.4239)",
    popover: "oklch(1 0 0)",
    popoverForeground: "oklch(0.2277 0.0105 257.4239)",
    primary: "oklch(0.54 0.1959 257.4239)",
    primaryForeground: "oklch(1 0 0)",
    secondary: "oklch(0.967 0.0106 257.4239)",
    secondaryForeground: "oklch(0.4536 0.0226 257.4239)",
    muted: "oklch(0.967 0.0106 257.4239)",
    mutedForeground: "oklch(0.5653 0.021 257.4239)",
    accent: "oklch(0.967 0.0106 257.4239)",
    accentForeground: "oklch(0.54 0.1959 257.4239)",
    destructive: "oklch(0.6368 0.2078 25.3313)",
    destructiveForeground: "oklch(1 0 0)",
    border: "oklch(0.9419 0.016 257.4239)",
    input: "oklch(1 0 0)",
    ring: "oklch(0.54 0.1959 257.4239)",
    chart1: "oklch(0.54 0.1959 257.4239)",
    chart2: "oklch(0.6747 0.1671 257.4239)",
    chart3: "oklch(0.7729 0.1167 257.4239)",
    chart4: "oklch(0.8625 0.0683 257.4239)",
    chart5: "oklch(0.9411 0.0284 257.4239)",
    sidebar: "oklch(0.967 0.0106 257.4239)",
    sidebarForeground: "oklch(0.4536 0.0226 257.4239)",
    sidebarPrimary: "oklch(0.54 0.1959 257.4239)",
    sidebarPrimaryForeground: "oklch(1 0 0)",
    sidebarAccent: "oklch(0.9419 0.016 257.4239)",
    sidebarAccentForeground: "oklch(0.54 0.1959 257.4239)",
    sidebarBorder: "oklch(0.9155 0.0235 257.4239)",
    sidebarRing: "oklch(0.54 0.1959 257.4239)",
  },
  dark: {
    background: "oklch(0.1836 0.0111 257.4239)",
    foreground: "oklch(0.9788 0.0057 257.4239)",
    card: "oklch(0.1836 0.0111 257.4239)",
    cardForeground: "oklch(0.9788 0.0057 257.4239)",
    popover: "oklch(0.1836 0.0111 257.4239)",
    popoverForeground: "oklch(0.9788 0.0057 257.4239)",
    primary: "oklch(0.6747 0.1671 257.4239)",
    primaryForeground: "oklch(0.1836 0.0111 257.4239)",
    secondary: "oklch(0.2551 0.0142 257.4239)",
    secondaryForeground: "oklch(0.721 0.0184 257.4239)",
    muted: "oklch(0.2551 0.0142 257.4239)",
    mutedForeground: "oklch(0.6288 0.0177 257.4239)",
    accent: "oklch(0.2551 0.0142 257.4239)",
    accentForeground: "oklch(0.6747 0.1671 257.4239)",
    destructive: "oklch(0.3958 0.1331 25.723)",
    destructiveForeground: "oklch(1 0 0)",
    border: "oklch(0.2941 0.0175 257.4239)",
    input: "oklch(0.2551 0.0142 257.4239)",
    ring: "oklch(0.6747 0.1671 257.4239)",
    chart1: "oklch(0.6747 0.1671 257.4239)",
    chart2: "oklch(0.54 0.1959 257.4239)",
    chart3: "oklch(0.4988 0.1812 257.4239)",
    chart4: "oklch(0.4373 0.1593 257.4239)",
    chart5: "oklch(0.3738 0.1318 257.4239)",
    sidebar: "oklch(0.2103 0.0107 257.4239)",
    sidebarForeground: "oklch(0.721 0.0184 257.4239)",
    sidebarPrimary: "oklch(0.6747 0.1671 257.4239)",
    sidebarPrimaryForeground: "oklch(0.1836 0.0111 257.4239)",
    sidebarAccent: "oklch(0.2551 0.0142 257.4239)",
    sidebarAccentForeground: "oklch(0.6747 0.1671 257.4239)",
    sidebarBorder: "oklch(0.2941 0.0175 257.4239)",
    sidebarRing: "oklch(0.6747 0.1671 257.4239)",
  },
};
