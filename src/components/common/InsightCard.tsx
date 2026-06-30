import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { StatTone } from "./StatTile";

const toneText: Record<StatTone, string> = {
  primary: "text-primary",
  success: "text-emerald-600 dark:text-emerald-400",
  accent: "text-violet-600 dark:text-violet-400",
  warn: "text-amber-600 dark:text-amber-400",
  muted: "text-muted-foreground",
  destructive: "text-rose-600 dark:text-rose-400",
};

const toneBg: Record<StatTone, string> = {
  primary: "bg-primary/10 ring-primary/25",
  success: "bg-emerald-500/15 ring-emerald-500/30",
  accent: "bg-violet-500/15 ring-violet-500/30",
  warn: "bg-amber-500/15 ring-amber-500/30",
  muted: "bg-muted ring-border/60",
  destructive: "bg-rose-500/15 ring-rose-500/30",
};

export interface InsightFooterItem {
  label: string;
  value: string;
  /** Optional tone for the value (defaults to muted). */
  tone?: StatTone;
}

export interface InsightCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  /** Short context phrase shown just under the value, e.g. "across all accounts". */
  caption?: string;
  /** Period-over-period change. Number drives the arrow + colour; suffix is the
   *  formatted label (e.g. "+12% MoM" or "+5 last 30d"). */
  delta?: { value: number; label: string };
  /** Up to four mini-rows printed at the bottom in a 2-column grid. */
  footer?: InsightFooterItem[];
  tone?: StatTone;
  /**
   * Density variant.
   *
   * - `default` — list-page KPI grid (4 across); supports `delta` + `footer`.
   * - `compact` — detail-page insight strip (5+ across); ignores `delta`
   *   and `footer`, smaller icon + value text.
   */
  variant?: "default" | "compact";
  /**
   * Highlight the value as the "hero" number of the strip (e.g. the
   * grand total). Renders a slightly larger display value and a subtle
   * shadow. Only respected in `compact` variant.
   */
  emphasize?: boolean;
  className?: string;
}

/**
 * Enterprise-grade KPI card.
 *
 * Use the `default` variant on list pages where 4 cards fit across the
 * grid and you want supporting context (delta arrow + footer rows).
 * Use the `compact` variant on detail pages where 4–6 cards summarise
 * the entity itself and the supporting context is conveyed by the
 * caption alone.
 */
export function InsightCard({
  icon: Icon,
  label,
  value,
  caption,
  delta,
  footer,
  tone = "primary",
  variant = "default",
  emphasize,
  className,
}: InsightCardProps) {
  if (variant === "compact") {
    return (
      <Card className={cn("overflow-hidden", emphasize && "shadow-sm", className)}>
        <CardContent className="flex items-start gap-2.5 p-3">
          <span
            className={cn(
              "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md ring-1 ring-inset",
              toneBg[tone],
              toneText[tone],
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p
              className={cn(
                "truncate tabular-nums text-foreground",
                emphasize
                  ? "font-display text-base font-semibold"
                  : "text-sm font-semibold",
              )}
            >
              {value}
            </p>
            {caption && (
              <p className="truncate text-[10px] text-muted-foreground">
                {caption}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const positive = delta ? delta.value >= 0 : false;
  const deltaTone = delta
    ? positive
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400"
    : "";

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="flex items-start gap-3 p-3.5">
        <span
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md ring-1 ring-inset",
            toneBg[tone],
            toneText[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            {delta && (
              <span
                className={cn(
                  "flex shrink-0 items-center gap-0.5 rounded px-1.5 py-[1px] text-[10px] font-semibold",
                  positive
                    ? "bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/30"
                    : "bg-rose-500/10 ring-1 ring-inset ring-rose-500/30",
                  deltaTone,
                )}
              >
                {positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {delta.label}
              </span>
            )}
          </div>
          <p className="font-display text-xl font-semibold leading-tight tracking-tight tabular-nums">
            {value}
          </p>
          {caption && (
            <p className="truncate text-[11px] text-muted-foreground">
              {caption}
            </p>
          )}
          {footer && footer.length > 0 && (
            <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-0.5 border-t border-border/60 pt-1.5">
              {footer.map((row, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 text-[10px]"
                >
                  <span className="truncate uppercase tracking-wider text-muted-foreground">
                    {row.label}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-semibold tabular-nums",
                      row.tone ? toneText[row.tone] : "text-foreground",
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
