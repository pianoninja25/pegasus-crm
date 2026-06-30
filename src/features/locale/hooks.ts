"use client";

import { useCallback } from "react";

import { DICTIONARIES, type DictKey } from "./dictionary";
import { useLocaleStore } from "./store";
import {
  CURRENCY_MAP,
  LOCALE_MAP,
  type Currency,
  type Locale,
} from "./types";

/**
 * Resolves a UI string for the currently selected locale, falling back to
 * English when a key is missing from the translated dictionary.
 *
 * Usage:
 * ```tsx
 * const t = useT();
 * <h1>{t("dashboard.welcomeBack")}, {user.name}</h1>
 * ```
 *
 * Implementation note: we also subscribe to `currency` here even though
 * `t()` itself only consults the dictionary. Every screen that calls
 * `t()` also tends to render `formatCurrency(...)` somewhere — by binding
 * currency to this hook we guarantee those screens re-render when the
 * user flips Rp ↔ USD from the topbar dropdown. Without this, the global
 * resolver in `format.ts` would already return the new value, but no
 * component would re-render to display it.
 */
export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  useLocaleStore((s) => s.currency);
  return useCallback(
    (key: DictKey): string => {
      return DICTIONARIES[locale][key] ?? DICTIONARIES.en[key] ?? key;
    },
    [locale],
  );
}

/** Read-only access to the active locale. */
export function useLocale(): Locale {
  return useLocaleStore((s) => s.locale);
}

/** Locale-aware formatter. Falls back to system locale if needed. */
export function useDateLocale(): string {
  return LOCALE_MAP[useLocale()]?.intl ?? "en-US";
}

/**
 * Returns the active currency + a memoised formatter that converts USD seed
 * amounts into the selected currency for display.
 */
export function useCurrency() {
  const code = useLocaleStore((s) => s.currency);
  const meta = CURRENCY_MAP[code];
  const format = useCallback(
    (
      usdAmount: number,
      opts: { compact?: boolean; sign?: boolean } = {},
    ): string => {
      return formatCurrencyValue(usdAmount, code, opts);
    },
    [code],
  );
  return { code, meta, format };
}

/**
 * Pure currency formatter. Exposed for callsites that read from the store
 * directly (e.g. inside selectors or non-React utilities).
 */
export function formatCurrencyValue(
  usdAmount: number,
  currency: Currency,
  opts: { compact?: boolean; sign?: boolean } = {},
): string {
  const { compact = true, sign = false } = opts;
  const meta = CURRENCY_MAP[currency];
  const converted = usdAmount * meta.usdRate;
  const formatted = new Intl.NumberFormat(meta.intl, {
    style: "currency",
    currency: meta.iso,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : currency === "IDR" ? 0 : 2,
  }).format(converted);
  if (sign && converted > 0) return `+${formatted}`;
  return formatted;
}

/** Sets a global so non-React utilities can read the current currency
 *  without depending on the store directly. Keeps formatCurrency working
 *  for chip rendering loops where calling a hook is impossible. */
let activeCurrency: Currency = "USD";

export function getActiveCurrency(): Currency {
  return activeCurrency;
}

export function setActiveCurrency(c: Currency) {
  activeCurrency = c;
}
