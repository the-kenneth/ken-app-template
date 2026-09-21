import type { PropsWithChildren } from "react";

import { createContext, use, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { createMMKV } from "react-native-mmkv";

import type { ColorScheme, ThemeMode } from "@ken/tokens/contracts";
import type { Tokens } from "@ken/tokens/native";

import { tokens } from "@ken/tokens/native";

// MMKV rather than AsyncStorage because reads are synchronous: the stored
// choice is known during the first render, so the app never paints in the
// system scheme and then snap to the user's. This is the native counterpart
// of the blocking themeDetectorScript in @ken/ui-web.
const storage = createMMKV({ id: "ken-theme" });
const THEME_KEY = "theme-mode";

const MODES: ThemeMode[] = ["light", "dark", "auto"];

const isThemeMode = (value: string | undefined): value is ThemeMode =>
  value !== undefined && (MODES as string[]).includes(value);

const getStoredMode = (): ThemeMode => {
  const stored = storage.getString(THEME_KEY);
  return isThemeMode(stored) ? stored : "auto";
};

/**
 * Resolves the persisted choice against the OS scheme without a provider —
 * for code that can render outside the tree, such as a crash screen. The read
 * is synchronous, so this is correct on the very first frame.
 */
export const resolveStoredTokens = (systemScheme: ColorScheme): Tokens => {
  const mode = getStoredMode();
  return tokens[mode === "auto" ? systemScheme : mode];
};

export interface ThemeModeContextValue {
  mode: ThemeMode;
  resolvedMode: ColorScheme;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(
  undefined,
);
const TokensContext = createContext<Tokens | undefined>(undefined);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme: ColorScheme =
    useColorScheme() === "dark" ? "dark" : "light";
  const [mode, setModeState] = useState(getStoredMode);

  const resolvedMode: ColorScheme = mode === "auto" ? systemScheme : mode;

  const modeValue = useMemo<ThemeModeContextValue>(() => {
    const setMode = (next: ThemeMode) => {
      storage.set(THEME_KEY, next);
      setModeState(next);
    };
    return {
      mode,
      resolvedMode,
      setMode,
      // Same cycle as the web toggle: auto first, then the scheme that
      // visibly differs from the system one.
      toggleMode: () => {
        const order: ThemeMode[] =
          systemScheme === "dark"
            ? ["auto", "light", "dark"]
            : ["auto", "dark", "light"];
        setMode(order[(order.indexOf(mode) + 1) % order.length] ?? "auto");
      },
    };
  }, [mode, resolvedMode, systemScheme]);

  return (
    <ThemeModeContext value={modeValue}>
      <TokensContext value={tokens[resolvedMode]}>{children}</TokensContext>
    </ThemeModeContext>
  );
}

/** The switch. Same shape as `useThemeMode` in @ken/ui-web. */
export function useThemeMode(): ThemeModeContextValue {
  const context = use(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeProvider");
  }
  return context;
}

/**
 * The resolved values. Mobile-only — web components read the same tokens
 * through CSS variables, so they never need this.
 *
 * The returned object is referentially stable per scheme, so
 * `useMemo(() => buildStyles(t), [t])` only recomputes on an actual change.
 */
export function useTokens(): Tokens {
  const context = use(TokensContext);
  if (!context) {
    throw new Error("useTokens must be used within a ThemeProvider");
  }
  return context;
}
