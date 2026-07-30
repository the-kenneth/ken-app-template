import type { ColorScheme, RadiusToken, ShadowToken } from "./contracts";

/**
 * Non-colour tokens. Values are in px so React Native can use them directly;
 * the generator divides by 16 when emitting rem for CSS.
 */

/** Base corner radius. `radius.sm/md/lg/xl` derive from it. */
export const radiusBase = 12;

export const radius: Record<RadiusToken, number> = {
  sm: radiusBase - 4,
  md: radiusBase - 2,
  lg: radiusBase,
  xl: radiusBase + 4,
};

/** Tailwind's spacing unit — `p-4` is `4 * spacingUnit`. */
export const spacingUnit = 4;

/** Baseline letter-spacing in em; Tailwind's tracking-* steps offset from it. */
export const trackingNormal = 0;

/**
 * A single shadow layer. Every shadow in this theme is pure black at varying
 * alpha, so colour collapses to one number.
 */
export interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  alpha: number;
}

const layer = (
  y: number,
  blur: number,
  spread: number,
  alpha: number,
): ShadowLayer => ({ x: 0, y, blur, spread, alpha });

const scheme = (
  ambient: number,
  cast: number,
  flat: number,
): Record<ShadowToken, ShadowLayer[]> => ({
  "2xs": [layer(2, 10, 0, ambient)],
  xs: [layer(2, 10, 0, ambient)],
  sm: [layer(2, 10, 0, cast), layer(1, 2, -1, cast)],
  DEFAULT: [layer(2, 10, 0, cast), layer(1, 2, -1, cast)],
  md: [layer(2, 10, 0, cast), layer(2, 4, -1, cast)],
  lg: [layer(2, 10, 0, cast), layer(4, 6, -1, cast)],
  xl: [layer(2, 10, 0, cast), layer(8, 10, -1, cast)],
  "2xl": [layer(2, 10, 0, flat)],
});

export const shadows: Record<
  ColorScheme,
  Record<ShadowToken, ShadowLayer[]>
> = {
  light: scheme(0.03, 0.05, 0.13),
  dark: scheme(0.1, 0.2, 0.5),
};
