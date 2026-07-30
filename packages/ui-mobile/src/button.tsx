import type { ReactNode } from "react";
import type {
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from "react-native";

import { Children, Fragment, useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import type {
  ButtonSize,
  ButtonVariant,
  HexColor,
} from "@ken/tokens/contracts";
import type { Tokens } from "@ken/tokens/native";

import { useTokens } from "./theme";
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
  default: { height: 36, paddingHorizontal: 16, gap: 8 },
  sm: { height: 32, paddingHorizontal: 12, gap: 6 },
  lg: { height: 40, paddingHorizontal: 24, gap: 8 },
  icon: { height: 36, width: 36, paddingHorizontal: 0, gap: 0 },
};

const isPrimitive = (child: ReactNode): child is string | number =>
  typeof child === "string" || typeof child === "number";

/**
 * Wraps bare text in `<Text>`, which React Native requires and the DOM does
 * not — without this, `<Button>Add {n} items</Button>` renders identically on
 * web and throws at runtime on native.
 *
 * Consecutive primitives are grouped into a single `<Text>` so interpolated
 * strings read as one run, while element children (icons) stay siblings of it
 * and keep the container's `gap` spacing.
 */
const renderChildren = (children: ReactNode, style: TextStyle): ReactNode => {
  const items = Children.toArray(children);
  if (!items.some(isPrimitive)) return children;

  const output: ReactNode[] = [];
  let run: (string | number)[] = [];

  const flush = () => {
    if (run.length === 0) return;
    output.push(
      <Text key={`text-${output.length}`} style={style}>
        {run}
      </Text>,
    );
    run = [];
  };

  for (const item of items) {
    if (isPrimitive(item)) {
      run.push(item);
      continue;
    }
    flush();
    output.push(<Fragment key={`node-${output.length}`}>{item}</Fragment>);
  }
  flush();

  return output;
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
        fontSize: 14,
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
