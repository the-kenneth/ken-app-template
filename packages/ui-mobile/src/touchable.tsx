import type { ReactNode } from "react";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";

import { useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";

import type { Tokens } from "@ken/tokens/native";

import { minTouchTarget } from "./metrics";
import { useTokens } from "./theme";

// Press feedback for controls that are not Buttons.
export type TouchableFeedback = "dim" | "tint" | "none";

export interface TouchableProps extends Omit<PressableProps, "style"> {
  feedback?: TouchableFeedback;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

export function Touchable({
  feedback = "none",
  style,
  ...props
}: TouchableProps) {
  const tokens = useTokens();
  const pressed = useMemo(
    () => buildFeedback(tokens)[feedback],
    [tokens, feedback],
  );

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed: isPressed }) => [floor, style, isPressed && pressed]}
      {...props}
    />
  );
}

const { floor } = StyleSheet.create({
  floor: { minHeight: minTouchTarget, minWidth: minTouchTarget },
});

const buildFeedback = (t: Tokens): Record<TouchableFeedback, ViewStyle> => ({
  dim: { opacity: 0.7 },
  tint: { backgroundColor: t.colors.accent },
  none: {},
});
