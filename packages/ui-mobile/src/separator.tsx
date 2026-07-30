import type { ViewProps } from "react-native";

import { StyleSheet, View } from "react-native";

import type { SeparatorOrientation } from "@ken/tokens/contracts";

import { useTokens } from "./theme";

export interface SeparatorProps extends ViewProps {
  orientation?: SeparatorOrientation;
}

export function Separator({
  orientation = "horizontal",
  style,
  ...props
}: SeparatorProps) {
  const tokens = useTokens();

  return (
    <View
      accessibilityRole="none"
      style={[
        { backgroundColor: tokens.colors.border },
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: { height: StyleSheet.hairlineWidth, width: "100%" },
  vertical: { width: StyleSheet.hairlineWidth, height: "100%" },
});
