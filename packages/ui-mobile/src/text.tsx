import type { TextProps as RNTextProps, TextStyle } from "react-native";

import { useMemo } from "react";
import { Text as RNText } from "react-native";

import type { ColorToken } from "@ken/tokens/contracts";

import { useTokens } from "./theme";
import { fontSize, lineHeight } from "./typography";

/**
 * React Native's Text ships unstyled, so mobile needs a typography primitive
 * that web gets free from semantic tags. Deliberately mobile-only: the scale
 * below is not shared with web, which uses Tailwind's own steps.
 */
export type TextVariant = "h1" | "h2" | "h3" | "body" | "small" | "caption";
export type TextTone = "default" | "muted" | "primary" | "destructive";

const VARIANTS: Record<TextVariant, TextStyle> = {
  h1: {
    fontSize: fontSize.h1,
    lineHeight: lineHeight.h1,
    fontWeight: "800",
    letterSpacing: -1.2,
  },
  h2: {
    fontSize: fontSize.h2,
    lineHeight: lineHeight.h2,
    fontWeight: "700",
    letterSpacing: -0.6,
  },
  h3: { fontSize: fontSize.h3, lineHeight: lineHeight.h3, fontWeight: "600" },
  body: {
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    fontWeight: "400",
  },
  small: {
    fontSize: fontSize.small,
    lineHeight: lineHeight.small,
    fontWeight: "400",
  },
  caption: {
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
    fontWeight: "400",
  },
};

const TONES: Record<TextTone, ColorToken> = {
  default: "foreground",
  muted: "mutedForeground",
  primary: "primary",
  destructive: "destructive",
};

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
}

export function Text({
  variant = "body",
  tone = "default",
  style,
  ...props
}: TextProps) {
  const tokens = useTokens();
  const resolved = useMemo(
    () => [VARIANTS[variant], { color: tokens.colors[TONES[tone]] }],
    [variant, tone, tokens],
  );

  return <RNText style={[resolved, style]} {...props} />;
}
