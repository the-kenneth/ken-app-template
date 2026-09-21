import type { TextInputProps } from "react-native";

import { useMemo, useState } from "react";
import { TextInput } from "react-native";

import { controlHeight } from "./metrics";
import { shadowToCss } from "./shadow";
import { useTokens } from "./theme";
import { fontSize } from "./typography";
import { withOpacity } from "./withOpacity";

export type InputProps = TextInputProps;

export function Input({ style, onFocus, onBlur, ...props }: InputProps) {
  const tokens = useTokens();
  const [focused, setFocused] = useState(false);

  const styles = useMemo(() => {
    const dark = tokens.scheme === "dark";
    return {
      height: controlHeight,
      width: "100%",
      borderWidth: 1,
      borderRadius: tokens.radius.md,
      paddingHorizontal: 12,
      fontSize: fontSize.body,
      color: tokens.colors.foreground,
      // Mirrors web's `bg-transparent dark:bg-input/30`.
      backgroundColor: dark
        ? withOpacity(tokens.colors.input, 0.3)
        : "transparent",
      borderColor: focused ? tokens.colors.ring : tokens.colors.input,
      // Stands in for `focus-visible:ring-[3px] ring-ring/50` — React Native
      // has no outline, so the ring is drawn as a spread shadow.
      boxShadow: focused
        ? shadowToCss([
            {
              offsetX: 0,
              offsetY: 0,
              blurRadius: 0,
              spreadDistance: 3,
              color: withOpacity(tokens.colors.ring, 0.5),
            },
          ])
        : shadowToCss(tokens.shadows.xs),
    } as const;
  }, [tokens, focused]);

  return (
    <TextInput
      style={[styles, style]}
      placeholderTextColor={tokens.colors.mutedForeground}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      {...props}
    />
  );
}
