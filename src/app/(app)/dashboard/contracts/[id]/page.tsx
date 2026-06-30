"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  ArrowLeft,
  CalendarRange,
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  Snowflake,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";

import { InsightCard } from "@/components/common/InsightCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useT } from "@/features/locale/hooks";
import {
  useContract,
  useSetContractStatus,
} from "@/features/service/hooks";
import {
  customerMap,
  unitMap,
  unitsByCustomer,
  userMap,
  visits,
} from "@/features/service/seed";
import {
  CONTRACT_STATUS_META,
  CONTRACT_TYPE_META,
  FREQUENCY_META,
  UNIT_TYPE_META,
  VISIT_STATUS_META,
} from "@/features/service/types";
import {
  engineerAvatarStyle,
  formatCurrency,
  formatDate,
  initials,
  relativeTime,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export default function ContractDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useT();
  const contractQ = useContract(params.id);
  const setContractStatus = useSetContractStatus();
  const contract = contractQ.data ?? null;

  /* ── Derived data ──────────────────────────────────────────────── */
  const derived = useMemo(() => {
    if (!contract) return null;
    const customer = customerMap[contract.customerId];
    const engineer = userMap[contract.engineerId];

    const contractVisits = visits
      .filter((v) => v.contractId === contract.id)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() -
          new Date(b.scheduledAt).getTime(),
      );
    const completed = contractVisits.filter((v) => v.status === "completed");
    const upcoming = contractVisits.filter(
      (v) => v.status === "scheduled" || v.status === "in_progress",
    );
    const nextUpcoming =
      upcoming.find((v) => new Date(v.scheduledAt).getTime() >= Date.now()) ??
      upcoming[0] ??
      null;

    const totalDays = Math.max(
      1,
      (new Date(contract.endDate).getTime() -
        new Date(contract.startDate).getTime()) /
        86_400_000,
    );
    const elapsedDays = Math.max(
      0,
      Math.min(
        totalDays,
        (Date.now() - new Date(contract.startDate).getTime()) / 86_400_000,
      ),
    );
    const pctElapsed = Math.round((elapsedDays / totalDays) * 100);
    const daysRemaining = Math.max(
      0,
      Math.round((new Date(contract.endDate).getTime() - Date.now()) / 86_400_000),
    );

    // If unitIds is empty, the contract covers every AC unit owned by the
    // customer (current and future). Resolve that into the visible list.
    const coveredUnits =
      contract.unitIds.length > 0
        ? contract.unitIds.map((id) => unitMap[id]).filter(Boolean)
        : (unitsByCustomer[contract.customerId] ?? []);

    return {
      customer,
      engineer,
      contractVisits,
      completed,
      upcoming,
      nextUpcoming,
      pctElapsed,
      daysRemaining,
      coveredUnits,
      coversAllUnits: contract.unitIds.length === 0,
    };
  }, [contract]);

  /* ── Loading / not-found states ────────────────────────────────── */
  if (!contractQ.isLoading && !contract) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/contracts">
            <ArrowLeft className="h-3.5 w-3.5" /> Contracts
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            {t("contracts.detail.notFound")}
          </CardContent>
        </Card>
      </div>
    );
  }
  if (!contract || !derived) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  const {
    customer,
    engineer,
    contractVisits,
    completed,
    upcoming,
    nextUpcoming,
    pctElapsed,
    daysRemaining,
    coveredUnits,
    coversAllUnits,
  } = derived;

  const sMeta = CONTRACT_STATUS_META[contract.status];
  const tMeta = CONTRACT_TYPE_META[contract.type];
  const freqMeta = FREQUENCY_META[contract.frequency];

  /* ── Action buttons (status-dependent) ────────────────────────── */
  const isPending = setContractStatus.isPending;
  const canActivate = contract.status === "draft";
  const canRenew =
    contract.status === "awaiting_renewal" ||
    contract.status === "expiring_soon";
  const canComplete =
    contract.status === "active" ||
    contract.status === "expiring_soon" ||
    contract.status === "awaiting_renewal";

  return (
    <div className="space-y-4">
      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5">
        <Link href="/dashboard/contracts">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("contracts.title")}
        </Link>
      </Button>

      {/* ── Header card ─────────────────────────────────────────────── */}
      <Card>
        <CardContent className="flex flex-wrap items-start gap-3 p-3 sm:p-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold">
                {customer?.name ?? "Customer"}
              </h1>
              <StatusBadge
                label={sMeta.label}
                tone={sMeta.tone}
                color={sMeta.color}
              />
              <StatusBadge label={tMeta.label} tone={tMeta.tone} />
              <Badge
                variant="outline"
                className="h-5 gap-1 border-border/60 text-[10px] text-muted-foreground"
              >
                {contract.number}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarRange className="h-3 w-3" />
                {formatDate(contract.startDate, { withYear: true })} →{" "}
                {formatDate(contract.endDate, { withYear: true })}
              </span>
              <span className="inline-flex items-center gap-1">
                <RotateCcw className="h-3 w-3" />
                {freqMeta.label}
              </span>
              {daysRemaining > 0 && contract.status !== "completed" && (
                <span className="inline-flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {daysRemaining} days remaining
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canActivate && (
              <Button
                size="sm"
                className="h-8 gap-1.5"
                disabled={isPending}
                onClick={() =>
                  setContractStatus.mutate({
                    id: contract.id,
                    status: "active",
                  })
                }
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("contracts.detail.markActivated")}
              </Button>
            )}
            {canRenew && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                disabled={isPending}
                onClick={() =>
                  setContractStatus.mutate({
                    id: contract.id,
                    status: "active",
                  })
                }
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t("contracts.detail.markRenewed")}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              disabled={contract.status === "completed" || contract.status === "draft"}
            >
              <Wrench className="h-3.5 w-3.5" />
              {t("contracts.detail.scheduleNext")}
            </Button>
            {canComplete && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-muted-foreground"
                disabled={isPending}
                onClick={() =>
                  setContractStatus.mutate({
                    id: contract.id,
                    status: "completed",
                  })
                }
              >
                <ClipboardCheck className="h-3.5 w-3.5" />
                {t("contracts.detail.markCompleted")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Insight strip ───────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          icon={Sparkles}
          tone="success"
          label={t("contracts.detail.contractValue")}
          value={formatCurrency(contract.value)}
          caption={freqMeta.label}
        />
        <InsightCard
          icon={CheckCircle2}
          tone="accent"
          label={t("contracts.detail.workOrdersCompleted")}
          value={`${completed.length}/${contractVisits.length}`}
          caption={`${upcoming.length} upcoming`}
        />
        <InsightCard
          icon={TrendingUp}
          tone={pctElapsed >= 80 ? "warn" : "primary"}
          label={t("contracts.detail.coverage")}
          value={`${pctElapsed}%`}
          caption={
            contract.status === "completed"
              ? "Contract complete"
              : daysRemaining > 0
                ? `${daysRemaining}d remaining`
                : "Past end date"
          }
        />
        <InsightCard
          icon={CalendarRange}
          tone={nextUpcoming ? "primary" : "muted"}
          label={t("contracts.detail.nextWorkOrder")}
          value={
            nextUpcoming
              ? formatDate(nextUpcoming.scheduledAt, { withYear: true })
              : "—"
          }
          caption={
            nextUpcoming
              ? `${relativeTime(nextUpcoming.scheduledAt)} · ${userMap[nextUpcoming.engineerId]?.name ?? ""}`
              : t("contracts.detail.noWorkOrders")
          }
        />
      </div>

      {/* ── Main grid: rail + content ──────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Profile rail */}
        <div className="space-y-3">
          <Card className="h-fit">
            <CardContent className="space-y-3 p-3 text-xs">
              {customer && (
                <Link
                  href={`/dashboard/customers/${customer.id}`}
                  className="flex items-center gap-2 transition hover:text-primary"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                      {initials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("contracts.column.customer")}
                    </p>
                    <p className="truncate font-medium text-foreground">
                      {customer.name}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {customer.city}, {customer.country}
                    </p>
                  </div>
                </Link>
              )}
              {engineer && (
                <Link
                  href={`/dashboard/engineers/${engineer.id}`}
                  className="flex items-center gap-2 border-t border-border/40 pt-2 transition hover:text-primary"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className="text-[10px] font-semibold"
                      style={engineerAvatarStyle(engineer.hue)}
                    >
                      {initials(engineer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t("contracts.column.engineer")}
                    </p>
                    <p className="truncate font-medium text-foreground">
                      {engineer.name}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {engineer.title}
                    </p>
                  </div>
                </Link>
              )}
              <div className="border-t border-border/40 pt-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("contracts.detail.coverage")}
                </p>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      contract.status === "expiring_soon"
                        ? "bg-amber-500"
                        : contract.status === "completed"
                          ? "bg-violet-500"
                          : "bg-[image:var(--gradient-primary)]",
                    )}
                    style={{ width: `${pctElapsed}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground tabular-nums">
                  {pctElapsed}% elapsed · {freqMeta.intervalDays}d interval
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notes / scope */}
          {contract.notes && (
            <Card className="h-fit">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("contracts.detail.terms")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs leading-relaxed text-muted-foreground">
                {contract.notes}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main content */}
        <div className="space-y-4">
          {/* Units covered */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {t("contracts.detail.units")}
              </CardTitle>
              <CardDescription>
                {coversAllUnits
                  ? t("contracts.detail.unitsHint")
                  : `${coveredUnits.length} unit${coveredUnits.length === 1 ? "" : "s"} explicitly included.`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coveredUnits.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                  No registered units for this customer yet.
                </div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {coveredUnits.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-card/40 p-2.5"
                    >
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                        <Snowflake className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold">
                          {u.brand} {u.model}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {UNIT_TYPE_META[u.type].label} · {u.location} ·{" "}
                          {u.btu.toLocaleString()} BTU
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work order schedule */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {t("contracts.detail.workOrderSchedule")}
              </CardTitle>
              <CardDescription>
                {t("contracts.detail.workOrderScheduleHint")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {contractVisits.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
                  {t("contracts.detail.noWorkOrders")}
                </div>
              ) : (
                contractVisits.map((v) => {
                  const meta = VISIT_STATUS_META[v.status];
                  const eng = userMap[v.engineerId];
                  return (
                    <Link
                      key={v.id}
                      href={`/dashboard/work-orders/${v.id}`}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-2.5 transition hover:border-primary/40"
                    >
                      <span
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[10px] font-bold tabular-nums"
                        style={{
                          backgroundColor: `${meta.color}22`,
                          color: meta.color,
                        }}
                      >
                        {v.number.slice(-3)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {formatDate(v.scheduledAt, { withYear: true })}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {relativeTime(v.scheduledAt)}
                          {eng && ` · ${eng.name}`}
                        </p>
                      </div>
                      <StatusBadge
                        label={meta.label}
                        tone={meta.tone}
                        color={meta.color}
                      />
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
