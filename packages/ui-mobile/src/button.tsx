import type { ReactNode } from "react";
import type {
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";

import type {
  ButtonSize,
  ButtonVariant,
  HexColor,
} from "@ken/tokens/contracts";
import type { Tokens } from "@ken/tokens/native";

import { controlHeight, minTouchTarget } from "./metrics";
import { renderChildren } from "./renderChildren";
import { useTokens } from "./theme";
import { fontSize } from "./typography";
import { withOpacity } from "./withOpacity";

type Fill = HexColor | "transparent";

interface VariantStyle {
  background: Fill;
  foreground: HexColor;
  border?: HexColor;
  /** Swapped in while pressed, standing in for web's hover background. */
  pressedBackground?: Fill;
  underline?: boolean;
  shadow?: boolean;
}

const buildVariants = (t: Tokens): Record<ButtonVariant, VariantStyle> => ({
  default: {
    background: t.colors.primary,
    foreground: t.colors.primaryForeground,
    pressedBackground: withOpacity(t.colors.primary, 0.9),
    shadow: true,
  },
  destructive: {
    background: t.colors.destructive,
    foreground: t.colors.destructiveForeground,
    pressedBackground: withOpacity(t.colors.destructive, 0.9),
    shadow: true,
  },
  outline: {
    background: t.colors.background,
    foreground: t.colors.foreground,
    border: t.colors.input,
    pressedBackground: t.colors.accent,
    shadow: true,
  },
  secondary: {
    background: t.colors.secondary,
    foreground: t.colors.secondaryForeground,
    pressedBackground: withOpacity(t.colors.secondary, 0.8),
    shadow: true,
  },
  ghost: {
    background: "transparent",
    foreground: t.colors.foreground,
    pressedBackground: t.colors.accent,
  },
  link: {
    background: "transparent",
    foreground: t.colors.primary,
    underline: true,
  },
});

const SIZES: Record<ButtonSize, ViewStyle> = {
  default: { height: controlHeight, paddingHorizontal: 16, gap: 8 },
  sm: { height: minTouchTarget, paddingHorizontal: 12, gap: 6 },
  lg: { height: 56, paddingHorizontal: 24, gap: 8 },
  icon: {
    height: controlHeight,
    width: controlHeight,
    paddingHorizontal: 0,
    gap: 0,
  },
};

export interface ButtonProps extends Omit<PressableProps, "style"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function Button({
  variant = "default",
  size = "default",
  disabled = false,
  style,
  children,
  ...props
}: ButtonProps) {
  const tokens = useTokens();

  const { container, label, pressed } = useMemo(() => {
    const v = buildVariants(tokens)[variant];
    return {
      container: {
        ...SIZES[size],
        flexDirection: "row" as const,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        borderRadius: tokens.radius.md,
        backgroundColor: v.background,
        ...(v.border ? { borderWidth: 1, borderColor: v.border } : {}),
        ...(v.shadow ? { boxShadow: tokens.shadows.xs } : {}),
      } satisfies ViewStyle,
      label: {
        color: v.foreground,
        fontSize: fontSize.small,
        fontWeight: "500",
        ...(v.underline ? { textDecorationLine: "underline" } : {}),
      } satisfies TextStyle,
      pressed: v.pressedBackground
        ? { backgroundColor: v.pressedBackground }
        : null,
    };
  }, [tokens, variant, size]);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed: isPressed }) => [
        container,
        isPressed && pressed,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    >
      {renderChildren(children, label)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disabled: { opacity: 0.5 },
});
