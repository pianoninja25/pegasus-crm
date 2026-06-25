"use client";

import { useMemo } from "react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { DEFAULT_THEME_ID, themePresetMap, themePresets } from "./themes";
import { mergePreset } from "./themeUtils";
import type {
  ThemeGradients,
  ThemePalette,
  ThemePreset,
  ThemeTokens,
} from "./types";

interface ThemeStoreState {
  presetId: string;
  paletteOverrides: Partial<ThemePalette>;
  tokenOverrides: Partial<ThemeTokens>;
  gradientOverrides: Partial<ThemeGradients>;
  hydrated: boolean;
}

interface ThemeStoreActions {
  setPreset: (id: string) => void;
  setPaletteColor: (key: keyof ThemePalette, value: string) => void;
  setToken: <K extends keyof ThemeTokens>(key: K, value: ThemeTokens[K]) => void;
  resetCustomizations: () => void;
  setHydrated: (value: boolean) => void;
}

export type ThemeStore = ThemeStoreState & ThemeStoreActions;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      presetId: DEFAULT_THEME_ID,
      paletteOverrides: {},
      tokenOverrides: {},
      gradientOverrides: {},
      hydrated: false,
      setPreset: (id) =>
        set(() => ({
          presetId: themePresetMap[id] ? id : DEFAULT_THEME_ID,
          paletteOverrides: {},
          tokenOverrides: {},
          gradientOverrides: {},
        })),
      setPaletteColor: (key, value) =>
        set((state) => ({
          paletteOverrides: { ...state.paletteOverrides, [key]: value },
        })),
      setToken: (key, value) =>
        set((state) => ({
          tokenOverrides: { ...state.tokenOverrides, [key]: value },
        })),
      resetCustomizations: () =>
        set(() => ({
          paletteOverrides: {},
          tokenOverrides: {},
          gradientOverrides: {},
        })),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "pegasus-crm-theme",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        presetId: state.presetId,
        paletteOverrides: state.paletteOverrides,
        tokenOverrides: state.tokenOverrides,
        gradientOverrides: state.gradientOverrides,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export function resolveTheme(state: ThemeStoreState): ThemePreset {
  const base = themePresetMap[state.presetId] ?? themePresetMap[DEFAULT_THEME_ID];
  return mergePreset(base!, {
    palette: state.paletteOverrides,
    tokens: state.tokenOverrides,
    gradients: state.gradientOverrides,
  });
}

/**
 * Returns the fully resolved theme.
 *
 * Reads each store slice individually so Zustand can return stable
 * references for unchanged state; recomposes via useMemo. Passing a
 * pre-composing selector to `useThemeStore` would trip React's
 * `useSyncExternalStore` "getServerSnapshot should be cached" warning.
 */
export function useResolvedTheme(): ThemePreset {
  const presetId = useThemeStore((s) => s.presetId);
  const paletteOverrides = useThemeStore((s) => s.paletteOverrides);
  const tokenOverrides = useThemeStore((s) => s.tokenOverrides);
  const gradientOverrides = useThemeStore((s) => s.gradientOverrides);

  return useMemo(() => {
    const base = themePresetMap[presetId] ?? themePresetMap[DEFAULT_THEME_ID];
    return mergePreset(base!, {
      palette: paletteOverrides,
      tokens: tokenOverrides,
      gradients: gradientOverrides,
    });
  }, [presetId, paletteOverrides, tokenOverrides, gradientOverrides]);
}

export { themePresets };
