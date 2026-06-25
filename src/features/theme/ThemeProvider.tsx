"use client";

import { useEffect, useMemo, useRef } from "react";

import { useResolvedTheme } from "./themeStore";
import { applyCssVariables, buildCssVariables } from "./themeUtils";

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Streams CSS variables for the current resolved theme onto :root and toggles
 * the `dark` class for Tailwind. Adds a brief transition window every time
 * the preset id changes so theme swaps feel cinematic.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useResolvedTheme();
  const previousPresetId = useRef<string | null>(null);

  const cssVars = useMemo(
    () => buildCssVariables(theme.palette, theme.tokens, theme.gradients),
    [theme.palette, theme.tokens, theme.gradients],
  );

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const body = document.body;

    const shouldAnimate =
      previousPresetId.current !== null &&
      previousPresetId.current !== theme.id;

    if (shouldAnimate) {
      root.classList.add("theme-transition");
    }

    applyCssVariables(root, cssVars);
    root.dataset.theme = theme.id;
    root.dataset.mode = theme.mode;
    root.classList.toggle("dark", theme.mode === "dark");
    root.classList.toggle("light", theme.mode === "light");
    body.classList.toggle("glass-enabled", theme.tokens.glass);
    body.classList.toggle("motion-disabled", !theme.tokens.motion);

    previousPresetId.current = theme.id;

    if (shouldAnimate) {
      const timer = window.setTimeout(() => {
        root.classList.remove("theme-transition");
      }, 700);
      return () => window.clearTimeout(timer);
    }
  }, [cssVars, theme.id, theme.mode, theme.tokens.glass, theme.tokens.motion]);

  return <>{children}</>;
}
