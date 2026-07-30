import type { HexColor } from "@ken/tokens/contracts";

const SHORT_HEX = /^#[0-9a-f]{3}$/i;
const FULL_HEX = /^#[0-9a-f]{6}$/i;
const HEX_WITH_ALPHA = /^#[0-9a-f]{8}$/i;

const toAlphaByte = (alpha: number): string =>
  Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");

/**
 * Applies an alpha channel to a hex colour, standing in for Tailwind's
 * `bg-primary/90` slash syntax which has no React Native equivalent.
 *
 * Throws rather than returning a malformed colour: React Native silently
 * ignores unparseable colour strings, so a typo would otherwise surface as an
 * invisible element rather than an error.
 */
export const withOpacity = (color: HexColor, alpha: number): HexColor => {
  if (FULL_HEX.test(color)) return `${color}${toAlphaByte(alpha)}`;

  // Expand #abc to #aabbcc so the alpha byte lands in the right place.
  if (SHORT_HEX.test(color)) {
    const r = color.slice(1, 2);
    const g = color.slice(2, 3);
    const b = color.slice(3, 4);
    return `#${r}${r}${g}${g}${b}${b}${toAlphaByte(alpha)}`;
  }

  // Already has an alpha channel — replace it rather than appending a 5th byte.
  if (HEX_WITH_ALPHA.test(color)) {
    return `${color.slice(0, 7)}${toAlphaByte(alpha)}` as HexColor;
  }

  throw new Error(
    `withOpacity expects a hex colour (#rgb, #rrggbb or #rrggbbaa), got "${color}"`,
  );
};
