import type { Icon as PhosphorIcon } from "phosphor-react-native";

import type { HexColor, IconSize, IconWeight } from "@ken/tokens/contracts";

import { useTokens } from "./theme";

const SIZES: Record<IconSize, number> = {
  sm: 16,
  default: 20,
  lg: 24,
};

export interface IconProps {
  /** Any icon from `phosphor-react-native`, e.g. `HouseIcon`. */
  as: PhosphorIcon;
  size?: IconSize;
  weight?: IconWeight;
  /**
   * Defaults to `foreground`. Web has no equivalent prop — its icons inherit
   * `currentColor`, which React Native has no concept of.
   */
  color?: HexColor;
}

export function Icon({
  as: Glyph,
  size = "default",
  weight = "regular",
  color,
}: IconProps) {
  const tokens = useTokens();

  return (
    <Glyph
      size={SIZES[size]}
      weight={weight}
      color={color ?? tokens.colors.foreground}
    />
  );
}
