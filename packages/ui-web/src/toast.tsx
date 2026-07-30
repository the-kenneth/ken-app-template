"use client";

import type { ToasterProps } from "sonner";

import { Toaster as Sonner, toast } from "sonner";

import { useThemeMode } from "./theme";

export const Toaster = ({ ...props }: ToasterProps) => {
  const { mode } = useThemeMode();

  return (
    <Sonner
      theme={mode === "auto" ? "system" : mode}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { toast };
