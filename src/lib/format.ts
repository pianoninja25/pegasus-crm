/**
 * Small, dependency-free formatters shared across the CRM dashboard.
 * Lifted verbatim from the Pegasus orchestrator so the visual language —
 * "12m ago", "$1.2M", "JS" initials — stays consistent across products.
 */

/** Compact "x ago" / "in x" string suitable for dense list rows. */
export function relativeTime(iso: string | Date): string {
  const target = typeof iso === "string" ? new Date(iso) : iso;
  const ms = Date.now() - target.getTime();
  const abs = Math.abs(ms);
  const future = ms < 0;
  const minutes = Math.round(abs / 60_000);
  const hours = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);
  const f = (v: number, u: string) =>
    future ? `in ${v}${u}` : `${v}${u} ago`;
  if (abs < 60_000) return future ? "in <1m" : "just now";
  if (minutes < 60) return f(minutes, "m");
  if (hours < 36) return f(hours, "h");
  return f(days, "d");
}

/** Latency / duration formatting for measurements expressed in seconds. */
export function humanLatency(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(seconds < 10 ? 1 : 0)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m < 60) return `${m}m ${s}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

/**
 * Two-letter (max) uppercase initials from a free-form name. Falls back to
 * the email's local-part when the name is missing.
 */
export function initials(name?: string | null, email?: string | null): string {
  const source = (name ?? "").trim();
  if (source) {
    return (
      source
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]!.toUpperCase())
        .join("") || "?"
    );
  }
  const local = (email ?? "").split("@")[0] ?? "";
  return local.slice(0, 2).toUpperCase() || "?";
}

/** Has the given ISO instant already passed? */
export function isOverdue(iso: string | Date): boolean {
  const target = typeof iso === "string" ? new Date(iso) : iso;
  return target.getTime() < Date.now();
}

/**
 * Same pluggable-resolver pattern as {@link resolveActiveCurrency}: we read
 * the live store value on every format call so date strings track the
 * user's locale immediately, even mid-render.
 */
let resolveActiveLocale: () => string | undefined = () => undefined;

export function setActiveFormatLocaleResolver(
  resolver: () => string | undefined,
): void {
  resolveActiveLocale = resolver;
}

/**
 * @deprecated Prefer {@link setActiveFormatLocaleResolver} so format.ts
 * stays reactive to store changes.
 */
export function setActiveFormatLocale(loc: string | undefined): void {
  resolveActiveLocale = () => loc;
}

export function getActiveFormatLocale(): string | undefined {
  return resolveActiveLocale();
}

/** Locale-aware absolute time for tooltips and audit rows. */
export function formatDateTime(
  iso: string | Date,
  opts: { withYear?: boolean; withSeconds?: boolean } = {},
): string {
  const { withYear = false, withSeconds = false } = opts;
  const target = typeof iso === "string" ? new Date(iso) : iso;
  return target.toLocaleString(resolveActiveLocale(), {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
    hour: "numeric",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
  });
}

/** Short calendar date "Jan 24" / "Jan 24, 2026". */
export function formatDate(
  iso: string | Date,
  opts: { withYear?: boolean } = {},
): string {
  const target = typeof iso === "string" ? new Date(iso) : iso;
  return target.toLocaleDateString(resolveActiveLocale(), {
    month: "short",
    day: "numeric",
    year: opts.withYear ? "numeric" : undefined,
  });
}

/**
 * Just the hour + minute of an instant, locale-aware. Useful when the
 * surrounding row already conveys the calendar date (e.g. the "Today"
 * card on `/dashboard/my-tasks`).
 */
export function formatTime(iso: string | Date): string {
  const target = typeof iso === "string" ? new Date(iso) : iso;
  return target.toLocaleTimeString(resolveActiveLocale(), {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Compact currency formatting for service values: $42K / Rp 680M / S$56K etc.
 *
 * Seed amounts are authored in USD. We multiply by a per-currency rate so
 * switching the workspace currency reframes every monetary value without
 * having to re-seed the database. If a caller passes an explicit `currency`,
 * it overrides the active one — useful for tests and exports.
 */
const CURRENCY_RATES: Record<string, { rate: number; intl: string }> = {
  USD: { rate: 1, intl: "en-US" },
  IDR: { rate: 16_200, intl: "id-ID" },
  SGD: { rate: 1.34, intl: "en-SG" },
  MYR: { rate: 4.7, intl: "ms-MY" },
};

/**
 * Pluggable resolver for "what currency should I render in right now?".
 * Wired up to the Zustand locale store by {@link LocaleSync} during module
 * init so {@link formatCurrency} always sees the user's live selection —
 * not a stale `useEffect`-plumbed snapshot.
 *
 * Kept as a function (not a value) so we read the latest store state on
 * every call rather than capturing it at module load.
 */
let resolveActiveCurrency: () => string = () => "USD";

export function setActiveFormatCurrencyResolver(
  resolver: () => string,
): void {
  resolveActiveCurrency = resolver;
}

/**
 * @deprecated Prefer {@link setActiveFormatCurrencyResolver} so format.ts
 * stays reactive to store changes. Retained for callers that just want to
 * pin a one-shot fallback (tests, exports).
 */
export function setActiveFormatCurrency(code: string): void {
  resolveActiveCurrency = () => code;
}

export function getActiveFormatCurrency(): string {
  return resolveActiveCurrency();
}

export function formatCurrency(
  amount: number,
  opts: { currency?: string; compact?: boolean } = {},
): string {
  const code = opts.currency ?? resolveActiveCurrency();
  const compact = opts.compact ?? true;
  const meta = CURRENCY_RATES[code] ?? CURRENCY_RATES.USD;
  const converted = amount * meta.rate;
  return new Intl.NumberFormat(meta.intl, {
    style: "currency",
    currency: code,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : code === "IDR" ? 0 : 2,
  }).format(converted);
}

/** Plain compact number ("1.2K", "42M"). */
export function formatNumber(
  value: number,
  opts: { compact?: boolean } = {},
): string {
  const { compact = true } = opts;
  return new Intl.NumberFormat(undefined, {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Alias for {@link formatNumber} with compact=true — reads more naturally
 * in dense layouts ("$\{compactNumber(value)\}"). */
export const compactNumber = (value: number) => formatNumber(value, { compact: true });

/** Percentage formatter — accepts 0..1 fraction. */
export function formatPercent(fraction: number, digits = 0): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}

/**
 * Byte formatter using the binary (IEC) scale — "1.4 GB" style. Uses base
 * 1024 to match how disk usage is universally reported in dashboards and
 * cloud-provider consoles.
 *
 * @example
 *   formatBytes(1_536_000)          // "1.5 MB"
 *   formatBytes(0)                  // "0 B"
 *   formatBytes(1_099_511_627_776)  // "1 TB"
 */
export function formatBytes(bytes: number, digits = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"] as const;
  const idx = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024)),
  );
  const value = bytes / 1024 ** idx;
  const rounded =
    idx === 0
      ? Math.round(value).toString()
      : value.toFixed(value >= 100 ? 0 : digits);
  return `${rounded} ${units[idx]}`;
}

/**
 * Inline style for engineer avatars — keeps the same coloured-disc look
 * everywhere (sidebar, lists, detail header rails, schedule rows).
 *
 * Hue is stored on each engineer in the seed; missing values fall back
 * to the brand blue. Saturation/lightness are intentionally fixed so
 * the avatars stay readable against both light and dark themes.
 */
export function engineerAvatarStyle(hue: number | undefined): {
  background: string;
  color: string;
} {
  return {
    background: `hsl(${hue ?? 215} 70% 35%)`,
    color: "white",
  };
}
