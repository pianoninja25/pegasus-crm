import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatTone =
  | "primary"
  | "success"
  | "accent"
  | "warn"
  | "muted"
  | "destructive";

const toneClass: Record<StatTone, string> = {
  primary: "text-primary",
  success: "text-emerald-400",
  accent: "text-accent-foreground",
  warn: "text-amber-400",
  muted: "text-muted-foreground",
  destructive: "text-rose-400",
};

export interface StatTileProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: StatTone;
  /**
   * `default` — vertical card, 2xl number, hint top-right (dashboard hero).
   * `compact` — horizontal row, lg number, hint inline (list pages).
   */
  size?: "default" | "compact";
  className?: string;
}

export function StatTile({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
  size = "default",
  className,
}: StatTileProps) {
  if (size === "compact") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="flex items-center gap-2.5 p-2.5">
          <span
            className={cn(
              "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground/5 ring-1 ring-inset ring-border/60",
              toneClass[tone],
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="truncate font-display text-base font-semibold leading-tight tracking-tight tabular-nums">
              {value}
            </p>
          </div>
          {hint && (
            <span
              className={cn(
                "shrink-0 self-end whitespace-nowrap text-[10px] font-medium",
                toneClass[tone],
              )}
            >
              {hint}
            </span>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md bg-foreground/5 ring-1 ring-inset ring-border/60",
              toneClass[tone],
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          {hint && (
            <span className={cn("text-[10px] font-medium", toneClass[tone])}>
              {hint}
            </span>
          )}
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
