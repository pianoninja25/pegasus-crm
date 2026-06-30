"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Currency, Locale } from "./types";

interface LocaleStoreState {
  locale: Locale;
  currency: Currency;
  hydrated: boolean;
}

interface LocaleStoreActions {
  setLocale: (locale: Locale) => void;
  setCurrency: (currency: Currency) => void;
  setHydrated: (value: boolean) => void;
}

export type LocaleStore = LocaleStoreState & LocaleStoreActions;

/**
 * Persisted locale + currency selection.
 *
 * Defaults are tuned for the demo's natural audience (Indonesian HVAC
 * operator) but everything is overridable from settings / topbar.
 */
export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: "en",
      currency: "USD",
      hydrated: false,
      setLocale: (locale) => set({ locale }),
      setCurrency: (currency) => set({ currency }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "pegasus-ac-locale",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ locale: s.locale, currency: s.currency }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
