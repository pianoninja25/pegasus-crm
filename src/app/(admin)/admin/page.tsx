"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Building2,
  CircleDollarSign,
  HardDrive,
  ShieldAlert,
  UserPlus,
  Users,
} from "lucide-react";

import { StorageUsageBar } from "@/components/admin/StorageUsageBar";
import { InsightCard } from "@/components/common/InsightCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useAdminUsers,
  usePlatformStats,
  useTenants,
} from "@/features/platform/hooks";
import {
  storageSeverity,
  storageUsageFraction,
} from "@/features/platform/storage";
import {
  TENANT_PLAN_META,
  TENANT_STATUS_META,
} from "@/features/platform/types";
import { ROLE_META } from "@/features/service/types";
import {
  formatBytes,
  formatNumber,
  formatPercent,
  initials,
  relativeTime,
} from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Platform "at-a-glance" landing page shown when the superadmin arrives
 * at `/admin`. Deliberately dense — one row of KPIs, one row of drill-in
 * cards — so the deeper `tenants` and `users` pages own the heavier UI.
 */
export default function AdminOverviewPage() {
  const stats = usePlatformStats();
  const tenants = useTenants();
  const users = useAdminUsers();

  const monthlyRevenue = tenants
    .filter((t) => t.status === "active" || t.status === "past_due")
    .reduce((sum, t) => sum + TENANT_PLAN_META[t.plan].priceMonthly, 0);

  const recentTenants = [...tenants]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  const recentUsers = [...users]
    .filter((u) => u.createdAt && u.role !== "superadmin")
    .sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
    )
    .slice(0, 5);

  const attentionTenants = tenants.filter(
    (t) => t.status === "past_due" || t.status === "suspended",
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-fuchsia-600 dark:text-fuchsia-400">
            Platform console
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage tenants and cross-tenant users across the whole platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline" className="h-8 gap-1.5 text-xs">
            <Link href="/admin/users">
              <UserPlus className="h-3.5 w-3.5" /> Manage users
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8 gap-1.5 text-xs">
            <Link href="/admin/tenants">
              <Building2 className="h-3.5 w-3.5" /> Manage tenants
            </Link>
          </Button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard
          icon={Building2}
          label="Tenants"
          value={formatNumber(stats.tenantCount)}
          caption="Across all plans"
          tone="primary"
          footer={[
            {
              label: "Active",
              value: String(stats.activeTenants),
              tone: "success",
            },
            {
              label: "Trial",
              value: String(stats.trialTenants),
              tone: "warn",
            },
          ]}
        />
        <InsightCard
          icon={Users}
          label="Users"
          value={formatNumber(stats.userCount)}
          caption="Superadmin + tenant members"
          tone="accent"
          footer={[
            {
              label: "Administrators",
              value: String(stats.usersByRole.administrator),
            },
            {
              label: "Engineers",
              value: String(stats.usersByRole.engineer),
              tone: "success",
            },
          ]}
        />
        <InsightCard
          icon={CircleDollarSign}
          label="MRR (mock)"
          value={`$${formatNumber(monthlyRevenue)}`}
          caption="Sum of billed plans"
          tone="success"
          footer={[
            {
              label: "Paying tenants",
              value: String(
                stats.activeTenants + stats.pastDueTenants,
              ),
            },
            {
              label: "Past due",
              value: String(stats.pastDueTenants),
              tone: stats.pastDueTenants > 0 ? "destructive" : "muted",
            },
          ]}
        />
        <InsightCard
          icon={ShieldAlert}
          label="Needs attention"
          value={formatNumber(
            attentionTenants.length + stats.tenantsNearQuota + stats.tenantsOverQuota,
          )}
          caption="Billing, status, or storage issues"
          tone={
            attentionTenants.length + stats.tenantsOverQuota > 0
              ? "destructive"
              : stats.tenantsNearQuota > 0
                ? "warn"
                : "muted"
          }
          footer={[
            {
              label: "Suspended / past due",
              value: String(attentionTenants.length),
              tone: attentionTenants.length > 0 ? "destructive" : "muted",
            },
            {
              label: "Storage near quota",
              value: String(stats.tenantsNearQuota + stats.tenantsOverQuota),
              tone:
                stats.tenantsOverQuota > 0
                  ? "destructive"
                  : stats.tenantsNearQuota > 0
                    ? "warn"
                    : "muted",
            },
          ]}
        />
      </div>

      {/* Platform storage */}
      <PlatformStorageCard
        used={stats.storageBytesUsed}
        quota={stats.storageBytesQuota}
        tenantsNearQuota={stats.tenantsNearQuota}
        tenantsOverQuota={stats.tenantsOverQuota}
        topTenants={tenants
          .slice()
          .sort(
            (a, b) =>
              storageUsageFraction(b) - storageUsageFraction(a),
          )
          .slice(0, 3)}
      />

      {/* Two-column drill-ins */}
      <div className="grid gap-3 lg:grid-cols-5">
        {/* Recent tenants */}
        <Card className="lg:col-span-3">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-sm font-semibold tracking-tight">
                  Newest tenants
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Most recently onboarded workspaces
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-[11px]">
                <Link href="/admin/tenants">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="divide-y divide-border/60 rounded-lg border border-border/60 bg-card/40">
              {recentTenants.map((t) => {
                const statusMeta = TENANT_STATUS_META[t.status];
                const planMeta = TENANT_PLAN_META[t.plan];
                return (
                  <Link
                    key={t.id}
                    href={`/admin/tenants/${t.id}`}
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-foreground/5"
                  >
                    <span
                      className={cn(
                        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold text-white",
                      )}
                      style={{
                        background: `hsl(${(t.name.charCodeAt(0) * 37) % 360} 70% 45%)`,
                      }}
                    >
                      {initials(t.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {t.name}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {t.industry} · {t.country} ·{" "}
                        {relativeTime(t.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0", planMeta.tone)}
                    >
                      {planMeta.label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn("shrink-0", statusMeta.tone)}
                    >
                      {statusMeta.label}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent users */}
        <Card className="lg:col-span-2">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-sm font-semibold tracking-tight">
                  Newest users
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Cross-tenant, most recent first
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-[11px]">
                <Link href="/admin/users">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
            <div className="divide-y divide-border/60 rounded-lg border border-border/60 bg-card/40">
              {recentUsers.map((u) => {
                const tenant = tenants.find((t) => t.id === u.tenantId);
                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <span
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                      style={{
                        background: `hsl(${u.hue ?? 215} 70% 45%)`,
                      }}
                    >
                      {initials(u.name, u.email)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {u.name}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {tenant?.name ?? "—"} · {ROLE_META[u.role].label}
                      </p>
                    </div>
                    {u.createdAt && (
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {relativeTime(u.createdAt)}
                      </span>
                    )}
                  </div>
                );
              })}
              {recentUsers.length === 0 && (
                <div className="px-3 py-6 text-center text-[11px] text-muted-foreground">
                  No users yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attention list */}
      {attentionTenants.length > 0 && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/15 text-rose-600 ring-1 ring-inset ring-rose-500/30 dark:text-rose-300">
                <Activity className="h-3.5 w-3.5" />
              </span>
              <div>
                <h2 className="font-display text-sm font-semibold tracking-tight">
                  Tenants needing attention
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Past-due or suspended — review before they churn.
                </p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {attentionTenants.map((t) => {
                const statusMeta = TENANT_STATUS_META[t.status];
                return (
                  <Link
                    key={t.id}
                    href={`/admin/tenants/${t.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-3 transition-colors hover:bg-foreground/5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {t.name}
                      </p>
                      {t.notes && (
                        <p className="truncate text-[10px] text-muted-foreground">
                          {t.notes}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className={cn("shrink-0", statusMeta.tone)}>
                      {statusMeta.label}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Platform storage card                                               */
/* ------------------------------------------------------------------ */

interface PlatformStorageCardProps {
  used: number;
  quota: number;
  tenantsNearQuota: number;
  tenantsOverQuota: number;
  topTenants: import("@/features/platform/types").Tenant[];
}

function PlatformStorageCard({
  used,
  quota,
  tenantsNearQuota,
  tenantsOverQuota,
  topTenants,
}: PlatformStorageCardProps) {
  const fraction = quota > 0 ? used / quota : 0;
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-inset ring-primary/25">
              <HardDrive className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-sm font-semibold tracking-tight">
                Platform storage
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Aggregate footprint across every tenant.
              </p>
            </div>
          </div>
          <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-[11px]">
            <Link href="/admin/tenants">
              Manage tenants <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-display text-lg font-semibold tracking-tight tabular-nums">
                {formatBytes(used)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  used across all tenants
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground tabular-nums">
                {formatPercent(fraction, fraction < 0.1 ? 1 : 0)} of{" "}
                {formatBytes(quota)} total quota
              </p>
            </div>
            <StorageUsageBar
              usedBytes={used}
              limitBytes={quota}
              hideCaption
            />

            <div className="pt-1 text-[11px] text-muted-foreground">
              <span
                className={cn(
                  tenantsOverQuota > 0 &&
                    "text-rose-700 dark:text-rose-400 font-semibold",
                )}
              >
                {tenantsOverQuota} over quota
              </span>
              {" · "}
              <span
                className={cn(
                  tenantsNearQuota > 0 &&
                    "text-amber-700 dark:text-amber-400 font-semibold",
                )}
              >
                {tenantsNearQuota} near quota (≥75%)
              </span>
            </div>
          </div>

          {/* Top storage-heavy tenants */}
          <div className="rounded-lg border border-border/60 bg-card/40 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Heaviest tenants
            </p>
            <div className="space-y-2">
              {topTenants.map((t) => {
                const planMeta = TENANT_PLAN_META[t.plan];
                const sev = storageSeverity(storageUsageFraction(t));
                return (
                  <Link
                    key={t.id}
                    href={`/admin/tenants/${t.id}`}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <span className="truncate font-medium text-foreground hover:underline">
                      {t.name}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 tabular-nums",
                        sev === "over" && "text-rose-700 dark:text-rose-400 font-semibold",
                        sev === "critical" && "text-orange-700 dark:text-orange-400 font-semibold",
                        sev === "warn" && "text-amber-700 dark:text-amber-400 font-semibold",
                        sev === "ok" && "text-muted-foreground",
                      )}
                    >
                      {formatBytes(t.storageBytesUsed)}
                      <span className="text-muted-foreground">
                        {" "}
                        / {formatBytes(planMeta.storageLimitBytes)}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
