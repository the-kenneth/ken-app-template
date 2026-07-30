import type { ViewProps } from "react-native";

import { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useTokens } from "./theme";
import { withOpacity } from "./withOpacity";

/**
 * Placeholder block for content that is still loading. Size it to match the
 * real content so the swap doesn't shift layout.
 *
 * Fill is `mutedForeground` at 20%, matching the web Skeleton — this theme
 * defines `muted` and `accent` as the same colour used by real surfaces, so
 * either would leave the pulse as the only cue that it's a placeholder.
 */
export function Skeleton({ style, ...props }: ViewProps) {
  const tokens = useTokens();
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 1;
      return;
    }
    opacity.value = withRepeat(withTiming(0.4, { duration: 1000 }), -1, true);
  }, [reducedMotion, opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        {
          borderRadius: tokens.radius.md,
          backgroundColor: withOpacity(tokens.colors.mutedForeground, 0.2),
        },
        pulse,
        style,
      ]}
      {...props}
    />
  );
}
