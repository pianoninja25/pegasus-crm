"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  Camera,
  Database,
  FileText,
  HardDrive,
  RefreshCcw,
  ScrollText,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { StorageUsageBar } from "@/components/admin/StorageUsageBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  storageBreakdownFor,
  storageSeverity,
  storageUsageFraction,
  type StorageSeverity,
} from "@/features/platform/storage";
import { usePlatformStore } from "@/features/platform/store";
import {
  STORAGE_CATEGORY_META,
  TENANT_PLAN_META,
  type StorageCategory,
  type Tenant,
} from "@/features/platform/types";
import { formatBytes, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<StorageCategory, LucideIcon> = {
  photos: Camera,
  database: Database,
  documents: FileText,
  logs: ScrollText,
};

const CATEGORY_BAR: Record<StorageCategory, string> = {
  photos: "bg-sky-500",
  database: "bg-emerald-500",
  documents: "bg-violet-500",
  logs: "bg-amber-500",
};

const SEVERITY_BANNER: Record<StorageSeverity, string | null> = {
  ok: null,
  warn: "Approaching quota — over 75% used.",
  critical: "Critical — over 90% used. Suggest upgrading or purging.",
  over: "Over quota — upload writes should be blocked in production.",
};

const SEVERITY_BANNER_TONE: Record<StorageSeverity, string> = {
  ok: "",
  warn: "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  critical:
    "border-orange-500/40 bg-orange-500/10 text-orange-800 dark:text-orange-300",
  over: "border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-300",
};

interface TenantStorageCardProps {
  tenant: Tenant;
}

/**
 * "Storage & usage" panel on the tenant detail page. Shows the plan
 * quota, a colour-coded progress bar, a deterministic category breakdown,
 * and two admin actions: purge cached logs, or refresh the reading.
 */
export function TenantStorageCard({ tenant }: TenantStorageCardProps) {
  const purgeTenantCache = usePlatformStore((s) => s.purgeTenantCache);
  const [pendingAction, setPendingAction] = useState<
    "purge" | "refresh" | null
  >(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  const limit = TENANT_PLAN_META[tenant.plan].storageLimitBytes;
  const fraction = storageUsageFraction(tenant);
  const severity = storageSeverity(fraction);
  const rows = storageBreakdownFor(tenant);
  const banner = SEVERITY_BANNER[severity];

  const handlePurge = async () => {
    setPendingAction("purge");
    const freed = purgeTenantCache(tenant.id);
    // Small fake delay so the button state is visible.
    await new Promise((r) => setTimeout(r, 350));
    setFlashMessage(`Freed ${formatBytes(freed)} of cached logs.`);
    setPendingAction(null);
    setTimeout(() => setFlashMessage(null), 3000);
  };

  const handleRefresh = async () => {
    setPendingAction("refresh");
    await new Promise((r) => setTimeout(r, 350));
    setFlashMessage("Usage recalculated.");
    setPendingAction(null);
    setTimeout(() => setFlashMessage(null), 3000);
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-inset ring-primary/25">
              <HardDrive className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-sm font-semibold tracking-tight">
                Storage &amp; usage
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Plan quota, per-category breakdown, and cleanup actions.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-xs"
              onClick={handleRefresh}
              disabled={pendingAction !== null}
            >
              <RefreshCcw
                className={cn(
                  "h-3.5 w-3.5",
                  pendingAction === "refresh" && "animate-spin",
                )}
              />
              Recalculate
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              onClick={handlePurge}
              disabled={pendingAction !== null || tenant.storageBytesUsed === 0}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Purge cached logs
            </Button>
          </div>
        </div>

        {banner && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-2 text-[11px]",
              SEVERITY_BANNER_TONE[severity],
            )}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span className="flex-1">{banner}</span>
          </div>
        )}

        {flashMessage && (
          <div className="flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-800 dark:text-emerald-300">
            <RefreshCcw className="h-3.5 w-3.5" />
            <span>{flashMessage}</span>
          </div>
        )}

        {/* Headline usage */}
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total used
              </p>
              <p className="font-display text-lg font-semibold tracking-tight tabular-nums">
                {formatBytes(tenant.storageBytesUsed)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  of {formatBytes(limit)} ({TENANT_PLAN_META[tenant.plan].label})
                </span>
              </p>
            </div>
            <p className="text-xs font-semibold tabular-nums text-muted-foreground">
              {formatPercent(fraction, fraction < 0.1 ? 1 : 0)}
            </p>
          </div>
          <StorageUsageBar
            usedBytes={tenant.storageBytesUsed}
            limitBytes={limit}
            hideCaption
          />
        </div>

        {/* Category breakdown */}
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Breakdown by category
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {rows.map((row) => {
              const meta = STORAGE_CATEGORY_META[row.category];
              const Icon = CATEGORY_ICON[row.category];
              return (
                <div
                  key={row.category}
                  className="rounded-md border border-border/60 bg-card/40 p-2.5"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md ring-1 ring-inset",
                        meta.tone,
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {meta.label}
                        </p>
                        <p className="shrink-0 text-[11px] font-semibold tabular-nums">
                          {formatBytes(row.bytes)}
                        </p>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            CATEGORY_BAR[row.category],
                          )}
                          style={{ width: `${row.share * 100}%` }}
                        />
                      </div>
                      <p className="line-clamp-2 text-[10px] text-muted-foreground">
                        {meta.caption}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
