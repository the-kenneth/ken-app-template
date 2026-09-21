"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "@phosphor-icons/react";
import * as React from "react";
import * as z from "zod/v4";

import type { ColorScheme, ThemeMode } from "@ken/tokens/contracts";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

// Parses untrusted localStorage; `satisfies` keeps it aligned with the shared
// contract that @ken/ui-mobile implements too.
const ThemeModeSchema = z.enum(["light", "dark", "auto"]);
const _modeParity = null as unknown as z.output<
  typeof ThemeModeSchema
> satisfies ThemeMode;

const themeKey = "theme-mode";

export type { ColorScheme, ThemeMode };

const getStoredThemeMode = (): ThemeMode => {
  if (typeof window === "undefined") return "auto";
  try {
    const storedTheme = localStorage.getItem(themeKey);
    return ThemeModeSchema.parse(storedTheme);
  } catch {
    return "auto";
  }
};

const setStoredThemeMode = (theme: ThemeMode) => {
  try {
    const parsedTheme = ThemeModeSchema.parse(theme);
    localStorage.setItem(themeKey, parsedTheme);
  } catch {
    // Silently fail if localStorage is unavailable
  }
};

const getSystemTheme = () => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const updateThemeClass = (themeMode: ThemeMode) => {
  const root = document.documentElement;
  root.classList.remove("light", "dark", "auto");
  const newTheme = themeMode === "auto" ? getSystemTheme() : themeMode;
  root.classList.add(newTheme);

  if (themeMode === "auto") {
    root.classList.add("auto");
  }
};

const setupPreferredListener = () => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = () => updateThemeClass("auto");
  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
};

const getNextTheme = (current: ThemeMode): ThemeMode => {
  const themes: ThemeMode[] =
    getSystemTheme() === "dark"
      ? ["auto", "light", "dark"]
      : ["auto", "dark", "light"];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return themes[(themes.indexOf(current) + 1) % themes.length]!;
};

export const themeDetectorScript = (function () {
  function themeFn() {
    // Must stay nested: themeFn is shipped as text via toString() and run by
    // the browser, so anything defined outside it does not exist there.
    // oxlint-disable-next-line unicorn/consistent-function-scoping
    const isValidTheme = (theme: string): theme is ThemeMode => {
      const validThemes = ["light", "dark", "auto"] as const;
      return validThemes.includes(theme as ThemeMode);
    };

    const storedTheme = localStorage.getItem("theme-mode") ?? "auto";
    const validTheme = isValidTheme(storedTheme) ? storedTheme : "auto";

    if (validTheme === "auto") {
      const autoTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      document.documentElement.classList.add(autoTheme, "auto");
    } else {
      document.documentElement.classList.add(validTheme);
    }
  }
  return `(${themeFn.toString()})();`;
})();

interface ThemeContextProps {
  mode: ThemeMode;
  resolvedMode: ColorScheme;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}
const ThemeContext = React.createContext<ThemeContextProps | undefined>(
  undefined,
);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const [mode, setModeState] = React.useState(getStoredThemeMode);

  React.useEffect(() => {
    if (mode !== "auto") return;
    return setupPreferredListener();
  }, [mode]);

  const resolvedMode = mode === "auto" ? getSystemTheme() : mode;

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    setStoredThemeMode(newMode);
    updateThemeClass(newMode);
  };

  const toggleMode = () => {
    setMode(getNextTheme(mode));
  };

  return (
    <ThemeContext
      value={{
        mode,
        resolvedMode,
        setMode,
        toggleMode,
      }}
    >
      <script
        dangerouslySetInnerHTML={{ __html: themeDetectorScript }}
        suppressHydrationWarning
      />
      {children}
    </ThemeContext>
  );
}

export function useThemeMode() {
  const context = React.use(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeProvider");
  }
  return context;
}

export interface ThemeToggleProps {
  labels: {
    toggle: string;
    light: string;
    dark: string;
    system: string;
  };
}

export function ThemeToggle({ labels }: ThemeToggleProps) {
  const { setMode } = useThemeMode();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="[&>svg]:absolute [&>svg]:size-5 [&>svg]:scale-0"
        >
          <SunIcon className="light:scale-100! auto:scale-0!" />
          <MoonIcon className="dark:scale-100! auto:scale-0!" />
          <MonitorIcon className="auto:scale-100!" />
          <span className="sr-only">{labels.toggle}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setMode("light")}>
          {labels.light}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("dark")}>
          {labels.dark}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setMode("auto")}>
          {labels.system}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
