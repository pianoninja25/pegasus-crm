"use client";

import { storageSeverity, type StorageSeverity } from "@/features/platform/storage";
import { formatBytes, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const SEVERITY_BAR_CLASS: Record<StorageSeverity, string> = {
  ok: "bg-emerald-500",
  warn: "bg-amber-500",
  critical: "bg-orange-500",
  over: "bg-rose-500",
};

const SEVERITY_TEXT_CLASS: Record<StorageSeverity, string> = {
  ok: "text-muted-foreground",
  warn: "text-amber-700 dark:text-amber-400",
  critical: "text-orange-700 dark:text-orange-400",
  over: "text-rose-700 dark:text-rose-400",
};

const SEVERITY_TRACK_CLASS: Record<StorageSeverity, string> = {
  ok: "bg-muted",
  warn: "bg-amber-500/12",
  critical: "bg-orange-500/12",
  over: "bg-rose-500/15",
};

interface StorageUsageBarProps {
  usedBytes: number;
  limitBytes: number;
  /** `sm` for table rows, `md` for KPI cards. */
  size?: "sm" | "md";
  /** Hide the numeric caption underneath. Useful in dense cells. */
  hideCaption?: boolean;
  className?: string;
}

/**
 * Progress bar + numeric caption for a tenant's storage against its plan
 * quota. Colour is driven by {@link storageSeverity} so admins can spot
 * warn/critical/over-quota tenants at a glance.
 */
export function StorageUsageBar({
  usedBytes,
  limitBytes,
  size = "md",
  hideCaption,
  className,
}: StorageUsageBarProps) {
  const fraction = limitBytes > 0 ? usedBytes / limitBytes : 0;
  const severity = storageSeverity(fraction);
  const clamped = Math.min(1, Math.max(0, fraction));

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div
        className={cn(
          "w-full overflow-hidden rounded-full",
          SEVERITY_TRACK_CLASS[severity],
          size === "sm" ? "h-1.5" : "h-2",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all",
            SEVERITY_BAR_CLASS[severity],
          )}
          style={{ width: `${Math.max(clamped * 100, 2)}%` }}
        />
      </div>
      {!hideCaption && (
        <div
          className={cn(
            "flex items-center justify-between text-[10px] tabular-nums",
            SEVERITY_TEXT_CLASS[severity],
          )}
        >
          <span>
            {formatBytes(usedBytes)}{" "}
            <span className="text-muted-foreground">
              / {formatBytes(limitBytes)}
            </span>
          </span>
          <span>{formatPercent(fraction, fraction < 0.1 ? 1 : 0)}</span>
        </div>
      )}
    </div>
  );
}
