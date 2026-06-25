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

/** Locale-aware absolute time for tooltips and audit rows. */
export function formatDateTime(
  iso: string | Date,
  opts: { withYear?: boolean; withSeconds?: boolean } = {},
): string {
  const { withYear = false, withSeconds = false } = opts;
  const target = typeof iso === "string" ? new Date(iso) : iso;
  return target.toLocaleString(undefined, {
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
  return target.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: opts.withYear ? "numeric" : undefined,
  });
}

/**
 * Compact currency formatting for deal values: $42K / $1.2M / $128 etc.
 * Default currency USD; pass an ISO-4217 code to override.
 */
export function formatCurrency(
  amount: number,
  opts: { currency?: string; compact?: boolean } = {},
): string {
  const { currency = "USD", compact = true } = opts;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(amount);
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
