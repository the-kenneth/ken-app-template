/**
 * The cross-platform API contract. Both `@ken/ui-web` and `@ken/ui-mobile`
 * type their components against these, so a variant added on one platform
 * fails to compile on the other until it exists there too.
 *
 * Names follow shadcn/ui so `pnpm ui-add` output drops in unmodified.
 */

/**
 * A hex colour. Every colour token is generated as `#rrggbb`, so helpers that
 * manipulate channels can rely on the format rather than re-validating.
 */
export type HexColor = `#${string}`;

/** A resolved appearance. `auto` is a user preference, never a resolved value. */
export type ColorScheme = "light" | "dark";

/** What the user picked. `auto` follows the OS. */
export type ThemeMode = ColorScheme | "auto";

export type ColorToken =
  | "background"
  | "foreground"
  | "card"
  | "cardForeground"
  | "popover"
  | "popoverForeground"
  | "primary"
  | "primaryForeground"
  | "secondary"
  | "secondaryForeground"
  | "muted"
  | "mutedForeground"
  | "accent"
  | "accentForeground"
  | "destructive"
  | "destructiveForeground"
  | "border"
  | "input"
  | "ring"
  | "chart1"
  | "chart2"
  | "chart3"
  | "chart4"
  | "chart5"
  | "sidebar"
  | "sidebarForeground"
  | "sidebarPrimary"
  | "sidebarPrimaryForeground"
  | "sidebarAccent"
  | "sidebarAccentForeground"
  | "sidebarBorder"
  | "sidebarRing";

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";

export type ButtonSize = "default" | "sm" | "lg" | "icon";

export type IconSize = "sm" | "default" | "lg";

/**
 * Phosphor's own weight axis, named identically in `@phosphor-icons/react` and
 * `phosphor-react-native` — so an icon means the same thing on both platforms.
 */
export type IconWeight =
  | "thin"
  | "light"
  | "regular"
  | "bold"
  | "fill"
  | "duotone";

export type SeparatorOrientation = "horizontal" | "vertical";

/** Shared by DropdownMenu items on both platforms. */
export type MenuItemVariant = "default" | "destructive";

export type RadiusToken = "sm" | "md" | "lg" | "xl";

export type ShadowToken =
  | "2xs"
  | "xs"
  | "sm"
  | "DEFAULT"
  | "md"
  | "lg"
  | "xl"
  | "2xl";

/** One shadow layer, shaped as React Native's `boxShadow` style expects. */
export interface NativeShadow {
  offsetX: number;
  offsetY: number;
  blurRadius: number;
  spreadDistance: number;
  color: string;
}
