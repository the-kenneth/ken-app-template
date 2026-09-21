import type { TextVariant } from "./text";

/**
 * The mobile type scale in points. Deliberately not design tokens: colour,
 * radius and spacing are shared with web, but this scale is mobile-only —
 * web steps through Tailwind's own sizes instead.
 *
 * Control labels sit on the same steps as body copy, so a Button and the text
 * beside it stay on one scale.
 */
export const fontSize: Record<TextVariant, number> = {
  h1: 48,
  h2: 30,
  h3: 24,
  h4: 20,
  body: 16,
  small: 14,
  caption: 12,
};

export const lineHeight: Record<TextVariant, number> = {
  h1: 52,
  h2: 36,
  h3: 32,
  h4: 28,
  body: 24,
  small: 20,
  caption: 16,
};
