/**
 * Locale + currency primitives.
 *
 * Pegasus AC Service supports two locales for the UI chrome (en, id) and four
 * currencies. We keep the resolver dead-simple — locale flips strings,
 * currency flips `formatCurrency` output via Intl.NumberFormat.
 */

export type Locale = "en" | "id";

export type Currency = "USD" | "IDR" | "SGD" | "MYR";

export interface LocaleMeta {
  id: Locale;
  /** Display label (in the locale itself). */
  label: string;
  /** English label for accessibility tooltips. */
  englishLabel: string;
  /** 🇮🇩 / 🇺🇸 emoji for the picker. */
  flag: string;
  /** Intl.NumberFormat locale code. */
  intl: string;
}

export interface CurrencyMeta {
  code: Currency;
  /** Short label, e.g. "USD · $". */
  label: string;
  /** ISO 4217 code (same as code) — passed to Intl.NumberFormat. */
  iso: Currency;
  /** Symbol for compact UI ("$", "Rp"). */
  symbol: string;
  /** Approximate USD→Currency rate used to convert seed values, which are
   *  authored in USD. Not a financial rate; just enough to keep the demo
   *  realistic when the user switches currency. */
  usdRate: number;
  /** Display locale for number grouping (e.g. "id-ID" puts dots as thousands). */
  intl: string;
}

export const LOCALES: LocaleMeta[] = [
  {
    id: "en",
    label: "English",
    englishLabel: "English",
    flag: "🇺🇸",
    intl: "en-US",
  },
  {
    id: "id",
    label: "Bahasa Indonesia",
    englishLabel: "Indonesian",
    flag: "🇮🇩",
    intl: "id-ID",
  },
];

export const CURRENCIES: CurrencyMeta[] = [
  {
    code: "USD",
    label: "USD · $",
    iso: "USD",
    symbol: "$",
    usdRate: 1,
    intl: "en-US",
  },
  {
    code: "IDR",
    label: "IDR · Rp",
    iso: "IDR",
    symbol: "Rp",
    usdRate: 16_200,
    intl: "id-ID",
  },
  {
    code: "SGD",
    label: "SGD · S$",
    iso: "SGD",
    symbol: "S$",
    usdRate: 1.34,
    intl: "en-SG",
  },
  {
    code: "MYR",
    label: "MYR · RM",
    iso: "MYR",
    symbol: "RM",
    usdRate: 4.7,
    intl: "ms-MY",
  },
];

export const LOCALE_MAP: Record<Locale, LocaleMeta> = Object.fromEntries(
  LOCALES.map((l) => [l.id, l]),
) as Record<Locale, LocaleMeta>;

export const CURRENCY_MAP: Record<Currency, CurrencyMeta> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c]),
) as Record<Currency, CurrencyMeta>;
