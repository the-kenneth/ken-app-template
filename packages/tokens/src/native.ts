import type {
  ColorScheme,
  ColorToken,
  HexColor,
  NativeShadow,
  ShadowToken,
} from "./contracts";

import { nativeColors, nativeShadows } from "./__generated__/native";
import { radius, spacingUnit } from "./scale";

/** Everything a React Native component needs for one appearance. */
export interface Tokens {
  scheme: ColorScheme;
  colors: Record<ColorToken, HexColor>;
  shadows: Record<ShadowToken, NativeShadow[]>;
  radius: typeof radius;
  /** Base spacing unit in px — multiply, don't hardcode. */
  spacing: number;
}

const build = (scheme: ColorScheme): Tokens => ({
  scheme,
  colors: nativeColors[scheme],
  shadows: nativeShadows[scheme],
  radius,
  spacing: spacingUnit,
});

/**
 * Both appearances, built once. Referentially stable, so `useMemo` keyed on a
 * `Tokens` object only recomputes when the scheme actually changes.
 */
export const tokens: Record<ColorScheme, Tokens> = {
  light: build("light"),
  dark: build("dark"),
};
