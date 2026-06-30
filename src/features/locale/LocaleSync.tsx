"use client";

import { useEffect } from "react";

import {
  setActiveFormatCurrencyResolver,
  setActiveFormatLocaleResolver,
} from "@/lib/format";

import { setActiveCurrency } from "./hooks";
import { useLocaleStore } from "./store";
import { LOCALE_MAP } from "./types";

/**
 * Wire the format.ts resolvers to read directly from the Zustand locale
 * store. We register the resolvers at module load (outside React) so the
 * very first server / client render of any `formatCurrency(...)` call sees
 * the persisted user selection — no `useEffect` lag, no first-paint flash
 * of USD before switching to Rp.
 *
 * Reading via `useLocaleStore.getState()` is safe in SSR — Zustand returns
 * the in-memory default until rehydration runs on the client.
 */
if (typeof window !== "undefined") {
  setActiveFormatCurrencyResolver(() => useLocaleStore.getState().currency);
  setActiveFormatLocaleResolver(
    () => LOCALE_MAP[useLocaleStore.getState().locale]?.intl,
  );
}

/**
 * Mirrors locale state into a couple of non-React side-effect targets
 * (document.lang, the activeCurrency global used by selectors). Subscribed
 * to both fields so the resolver registration above stays in sync if
 * anyone ever swaps them out mid-session.
 *
 * Renders nothing.
 */
export function LocaleSync() {
  const locale = useLocaleStore((s) => s.locale);
  const currency = useLocaleStore((s) => s.currency);

  useEffect(() => {
    // Re-bind resolvers on the client too (covers the case where window
    // wasn't defined at module init — e.g. some test runners).
    setActiveFormatCurrencyResolver(() => useLocaleStore.getState().currency);
    setActiveFormatLocaleResolver(
      () => LOCALE_MAP[useLocaleStore.getState().locale]?.intl,
    );
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "id" ? "id" : "en";
  }, [locale]);

  useEffect(() => {
    setActiveCurrency(currency);
  }, [currency]);

  return null;
}
