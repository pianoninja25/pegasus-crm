"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { NewTenantDialog } from "@/components/admin/NewTenantDialog";
import { StorageUsageBar } from "@/components/admin/StorageUsageBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminUsers,
  useTenants,
} from "@/features/platform/hooks";
import {
  storageSeverity,
  storageUsageFraction,
} from "@/features/platform/storage";
import { usePlatformStore } from "@/features/platform/store";
import {
  TENANT_PLAN_META,
  TENANT_STATUS_META,
  type TenantPlan,
  type TenantStatus,
} from "@/features/platform/types";
import { initials, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const PLAN_OPTIONS: TenantPlan[] = ["Starter", "Growth", "Scale", "Enterprise"];
const STATUS_OPTIONS: TenantStatus[] = [
  "trial",
  "active",
  "past_due",
  "suspended",
];

export default function AdminTenantsPage() {
  const tenants = useTenants();
  const users = useAdminUsers();
  const suspendTenant = usePlatformStore((s) => s.suspendTenant);
  const resumeTenant = usePlatformStore((s) => s.resumeTenant);
  const deleteTenant = usePlatformStore((s) => s.deleteTenant);
  const updateTenant = usePlatformStore((s) => s.updateTenant);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<TenantStatus | "all">("all");
  const [plan, setPlan] = useState<TenantPlan | "all">("all");
  const [storage, setStorage] = useState<"all" | "warn" | "over">("all");
  const [creating, setCreating] = useState(false);

  const usersByTenant = useMemo(() => {
    const map = new Map<string, number>();
    for (const u of users) {
      if (!u.tenantId) continue;
      map.set(u.tenantId, (map.get(u.tenantId) ?? 0) + 1);
    }
    return map;
  }, [users]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tenants.filter((t) => {
      if (status !== "all" && t.status !== status) return false;
      if (plan !== "all" && t.plan !== plan) return false;
      if (storage !== "all") {
        const sev = storageSeverity(storageUsageFraction(t));
        if (storage === "warn" && sev !== "warn" && sev !== "critical")
          return false;
        if (storage === "over" && sev !== "over") return false;
      }
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.industry.toLowerCase().includes(q) ||
        t.country.toLowerCase().includes(q)
      );
    });
  }, [tenants, query, status, plan, storage]);

  const handleConfirmDelete = (id: string, name: string) => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        `Delete tenant "${name}" and all its users? This cannot be undone.`,
      );
      if (!ok) return;
    }
    deleteTenant(id);
  };

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-fuchsia-600 dark:text-fuchsia-400">
            Platform · Tenants
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            Tenants
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every workspace on the platform. Change plans, suspend access, or
            drill into a tenant to manage its users.
          </p>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setCreating(true)}>
          <Plus className="h-3.5 w-3.5" />
          New tenant
        </Button>
      </header>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, slug, industry or country…"
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as TenantStatus | "all")}
          >
            <SelectTrigger className="h-8 w-full text-xs sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {TENANT_STATUS_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={plan}
            onValueChange={(v) => setPlan(v as TenantPlan | "all")}
          >
            <SelectTrigger className="h-8 w-full text-xs sm:w-[160px]">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All plans</SelectItem>
              {PLAN_OPTIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  {TENANT_PLAN_META[p].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={storage}
            onValueChange={(v) => setStorage(v as "all" | "warn" | "over")}
          >
            <SelectTrigger className="h-8 w-full text-xs sm:w-[160px]">
              <SelectValue placeholder="Storage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any storage</SelectItem>
              <SelectItem value="warn">≥ 75% (needs review)</SelectItem>
              <SelectItem value="over">Over quota</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-border/60 bg-card/40">
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2 font-semibold">Tenant</th>
                  <th className="px-3 py-2 font-semibold">Plan</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Users</th>
                  <th className="px-3 py-2 font-semibold min-w-[180px]">Storage</th>
                  <th className="px-3 py-2 font-semibold">Country</th>
                  <th className="px-3 py-2 font-semibold">Created</th>
                  <th className="px-3 py-2 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((t) => {
                  const planMeta = TENANT_PLAN_META[t.plan];
                  const statusMeta = TENANT_STATUS_META[t.status];
                  const seatCount = usersByTenant.get(t.id) ?? 0;
                  const overCapacity = seatCount > planMeta.seats;
                  return (
                    <tr
                      key={t.id}
                      className="group transition-colors hover:bg-foreground/5"
                    >
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/admin/tenants/${t.id}`}
                          className="flex items-center gap-2.5"
                        >
                          <span
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold text-white"
                            style={{
                              background: `hsl(${(t.name.charCodeAt(0) * 37) % 360} 70% 45%)`,
                            }}
                          >
                            {initials(t.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground">
                              {t.name}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {t.slug} · {t.industry}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-3 py-2.5">
                        <PlanCell
                          plan={t.plan}
                          onChange={(next) =>
                            updateTenant(t.id, { plan: next })
                          }
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge
                          variant="outline"
                          className={cn("gap-1", statusMeta.tone)}
                        >
                          <span
                            className={cn(
                              "inline-block h-1.5 w-1.5 rounded-full",
                              statusMeta.dotClass,
                            )}
                          />
                          {statusMeta.label}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "font-semibold tabular-nums",
                              overCapacity && "text-rose-600 dark:text-rose-400",
                            )}
                          >
                            {seatCount}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            / {planMeta.seats}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <StorageUsageBar
                          usedBytes={t.storageBytesUsed}
                          limitBytes={planMeta.storageLimitBytes}
                          size="sm"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {t.country}
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {relativeTime(t.createdAt)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            asChild
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1 px-2 text-[11px]"
                          >
                            <Link href={`/admin/tenants/${t.id}`}>
                              Manage <ArrowRight className="h-3 w-3" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                aria-label="Tenant actions"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                Tenant
                              </DropdownMenuLabel>
                              {t.status !== "suspended" ? (
                                <DropdownMenuItem
                                  onSelect={() => suspendTenant(t.id)}
                                  className="gap-2 text-xs"
                                >
                                  <Pause className="h-3.5 w-3.5" /> Suspend
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onSelect={() => resumeTenant(t.id)}
                                  className="gap-2 text-xs"
                                >
                                  <Play className="h-3.5 w-3.5" /> Resume
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() =>
                                  handleConfirmDelete(t.id, t.name)
                                }
                                className="gap-2 text-xs text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete tenant
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-12 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                        <Building2 className="h-6 w-6 opacity-70" />
                        <p className="text-xs">No tenants match your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <NewTenantDialog open={creating} onOpenChange={setCreating} />
    </div>
  );
}

function PlanCell({
  plan,
  onChange,
}: {
  plan: TenantPlan;
  onChange: (next: TenantPlan) => void;
}) {
  return (
    <Select value={plan} onValueChange={(v) => onChange(v as TenantPlan)}>
      <SelectTrigger
        className={cn(
          "h-7 w-[110px] gap-1 border-border/60 text-[11px]",
          TENANT_PLAN_META[plan].tone,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PLAN_OPTIONS.map((p) => (
          <SelectItem key={p} value={p}>
            {TENANT_PLAN_META[p].label} · ${TENANT_PLAN_META[p].priceMonthly}/mo
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
