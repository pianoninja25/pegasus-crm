"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  DollarSign,
  HardHat,
  PlugZap,
  Plus,
  ScrollText,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  Wrench,
} from "lucide-react";

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
import { EmptyState } from "@/components/common/EmptyState";
import { StatTile } from "@/components/common/StatTile";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useAuthStore } from "@/features/auth/authStore";
import { useDateLocale, useT } from "@/features/locale/hooks";
import { useContracts, useVisits } from "@/features/service/hooks";
import {
  contractStatusBuckets,
  currentUser,
  customerMap,
  engineers,
  engineerStats,
  overdueVisitsCount,
  salesThisMonth,
  salesThisWeek,
  salesThisYear,
  salesToday,
  upcomingVisitsCount,
  userMap,
} from "@/features/service/seed";
import {
  CONTRACT_STATUS_META,
  CONTRACT_TYPE_META,
  VISIT_STATUS_META,
} from "@/features/service/types";
import { formatCurrency, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function DashboardOverviewPage() {
  const user = useAuthStore((s) => s.user) ?? currentUser;
  const visitsQ = useVisits();
  const contractsQ = useContracts();
  const t = useT();
  const dateLocale = useDateLocale();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t("common.greeting.morning");
    if (h < 18) return t("common.greeting.afternoon");
    return t("common.greeting.evening");
  })();

  const today = salesToday();
  const week = salesThisWeek();
  const month = salesThisMonth();
  const year = salesThisYear();
  const buckets = contractStatusBuckets();
  const upcoming = upcomingVisitsCount();
  const overdue = overdueVisitsCount();

  const visits = useMemo(() => visitsQ.data ?? [], [visitsQ.data]);
  const contracts = useMemo(() => contractsQ.data ?? [], [contractsQ.data]);

  const nextVisits = useMemo(
    () =>
      [...visits]
        .filter((v) => v.status === "scheduled" || v.status === "in_progress")
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime(),
        )
        .slice(0, 6),
    [visits],
  );

  const expiringContracts = useMemo(
    () =>
      [...contracts]
        .filter(
          (c) => c.status === "expiring_soon" || c.status === "awaiting_renewal",
        )
        .sort(
          (a, b) =>
            new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
        )
        .slice(0, 5),
    [contracts],
  );

  const monthBounds = useMemo(() => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    return { start, end };
  }, []);

  const engineerLeaderboard = useMemo(
    () =>
      engineers
        .map((e) => engineerStats(e.id, monthBounds.start, monthBounds.end))
        .sort((a, b) => b.revenue - a.revenue),
    [monthBounds],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {greeting} ·{" "}
            {new Date().toLocaleDateString(dateLocale, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {t("dashboard.welcomeBack")}, {user.name.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pegasus AC Service · {upcoming} {t("dashboard.upcomingVisits").toLowerCase()} ·{" "}
            <span className={cn(overdue > 0 && "text-rose-400")}>
              {overdue} {t("common.overdue").toLowerCase()}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="gap-1.5">
            <Link href="/dashboard/scheduling">
              <CalendarClock className="h-3.5 w-3.5" />
              {t("dashboard.todaysSchedule")}
            </Link>
          </Button>
          <Button asChild className="gap-1.5">
            <Link href="/dashboard/quotations/new">
              <Plus className="h-3.5 w-3.5" />
              {t("dashboard.newQuotation")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Sales summary */}
      <section className="space-y-3">
        <SectionHeading icon={DollarSign} title={t("dashboard.salesSummary")} />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={Timer}
            label={t("common.today")}
            value={formatCurrency(today.income)}
            hint={`${formatCurrency(today.expense)} ${t("common.expenses").toLowerCase()}`}
            tone="primary"
          />
          <StatTile
            icon={CalendarDays}
            label={t("common.thisWeek")}
            value={formatCurrency(week.income)}
            hint={`${week.net >= 0 ? "+" : ""}${formatCurrency(week.net)} ${t("common.net").toLowerCase()}`}
            tone={week.net >= 0 ? "success" : "destructive"}
          />
          <StatTile
            icon={TrendingUp}
            label={t("common.thisMonth")}
            value={formatCurrency(month.income)}
            hint={`${month.net >= 0 ? "+" : ""}${formatCurrency(month.net)} ${t("common.net").toLowerCase()}`}
            tone={month.net >= 0 ? "success" : "destructive"}
          />
          <StatTile
            icon={Sparkles}
            label={t("common.thisYear")}
            value={formatCurrency(year.income)}
            hint={`${formatCurrency(year.expense)} ${t("common.expenses").toLowerCase()}`}
            tone="accent"
          />
        </div>
      </section>

      {/* Contracts summary */}
      <section className="space-y-3">
        <SectionHeading
          icon={ScrollText}
          title={t("dashboard.serviceContracts")}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={PlugZap}
            label={t("stats.active")}
            value={String(buckets.active)}
            hint={`${contracts.length} ${t("common.total").toLowerCase()}`}
            tone="success"
          />
          <StatTile
            icon={CalendarClock}
            label={t("stats.expiringSoon")}
            value={String(buckets.expiring_soon)}
            hint="30d"
            tone="warn"
          />
          <StatTile
            icon={CheckCircle2}
            label={t("common.completed")}
            value={String(buckets.completed)}
            tone="muted"
          />
          <StatTile
            icon={CircleAlert}
            label={t("stats.awaitingRenewal")}
            value={String(buckets.awaiting_renewal)}
            tone="accent"
          />
        </div>
      </section>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Upcoming visits */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">
                {t("dashboard.upcomingVisits")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.upcomingVisitsHint")}
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Link href="/dashboard/scheduling">
                {t("dashboard.openScheduling")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {nextVisits.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Inbox zero for the field."
                description="Nothing booked. Time to nudge those contract renewals."
              />
            ) : (
              nextVisits.map((v) => {
                const customer = customerMap[v.customerId];
                const engineer = userMap[v.engineerId];
                const status = VISIT_STATUS_META[v.status];
                return (
                  <Link
                    key={v.id}
                    href={`/dashboard/work-orders/${v.id}`}
                    className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 transition hover:border-primary/40"
                  >
                    <span
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
                      style={{
                        backgroundColor: `${status.color}22`,
                        color: status.color,
                      }}
                    >
                      {customer?.name.charAt(0).toUpperCase() ?? "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {customer?.name}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {CONTRACT_TYPE_META[v.type].label} ·{" "}
                        {engineer?.name ?? "Unassigned"} · {v.number}
                      </p>
                    </div>
                    <StatusBadge
                      label={status.label}
                      tone={status.tone}
                      color={status.color}
                    />
                    <span className="ml-2 hidden text-right text-[10px] text-muted-foreground sm:block">
                      {new Date(v.scheduledAt).toLocaleString(dateLocale, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </span>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Expiring contracts */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">
                {t("dashboard.renewalRadar")}
              </CardTitle>
              <CardDescription>
                {t("dashboard.renewalRadarHint")}
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Link href="/dashboard/contracts">
                {t("common.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {expiringContracts.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="Nothing expiring."
                description="Every contract is still healthy."
              />
            ) : (
              expiringContracts.map((c) => {
                const customer = customerMap[c.customerId];
                const meta = CONTRACT_STATUS_META[c.status];
                const daysOut = Math.ceil(
                  (new Date(c.endDate).getTime() - Date.now()) / 86_400_000,
                );
                return (
                  <Link
                    key={c.id}
                    href={`/dashboard/contracts/${c.id}`}
                    className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card/40 p-2.5 transition hover:border-primary/40"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                        {initials(customer?.name ?? "?")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {customer?.name}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {CONTRACT_TYPE_META[c.type].label} · {c.number}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <StatusBadge
                          label={meta.label}
                          tone={meta.tone}
                          color={meta.color}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {daysOut > 0 ? `in ${daysOut}d` : `${-daysOut}d ago`}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold tabular-nums">
                      {formatCurrency(c.value)}
                    </span>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Engineer performance */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-base">
              {t("dashboard.engineerPerformance")}
            </CardTitle>
            <CardDescription>
              {t("dashboard.engineerPerformanceHint")}
            </CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
            <Link href="/dashboard/engineers">
              {t("dashboard.openRoster")} <HardHat className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {engineerLeaderboard.map(
              ({
                engineer,
                completedJobs,
                scheduledJobs,
                serviceHours,
                revenue,
                rating,
              }) => (
                <Link
                  key={engineer?.id ?? "x"}
                  href={`/dashboard/engineers/${engineer?.id}`}
                  className="rounded-lg border border-border/60 bg-card/40 p-3 transition hover:border-primary/40"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback
                        className="text-[11px] font-semibold"
                        style={{
                          background: `hsl(${engineer?.hue ?? 215} 80% 35%)`,
                          color: "white",
                        }}
                      >
                        {initials(engineer?.name ?? "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {engineer?.name}
                      </p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {engineer?.title}
                      </p>
                    </div>
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {rating.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                    <Stat
                      label={t("common.completed")}
                      value={String(completedJobs)}
                    />
                    <Stat
                      label={t("common.scheduled")}
                      value={String(scheduledJobs)}
                    />
                    <Stat label="h" value={`${serviceHours}h`} />
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2 text-[10px]">
                    <span className="text-muted-foreground">
                      {t("common.income")} ({t("common.thisMonth")})
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(revenue)}
                    </span>
                  </div>
                </Link>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick alerts */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/dashboard/work-orders?status=overdue"
          className="group flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/8 p-3 text-rose-300 hover:bg-rose-500/12"
        >
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-80">
              {t("dashboard.alerts.overdue")}
            </p>
            <p className="mt-1 font-display text-xl font-semibold">{overdue}</p>
          </div>
          <CircleAlert className="h-5 w-5" />
        </Link>
        <Link
          href="/dashboard/scheduling"
          className="group flex items-center justify-between rounded-xl border border-sky-500/30 bg-sky-500/8 p-3 text-sky-300 hover:bg-sky-500/12"
        >
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-80">
              {t("dashboard.alerts.upcoming")}
            </p>
            <p className="mt-1 font-display text-xl font-semibold">
              {upcoming}
            </p>
          </div>
          <Wrench className="h-5 w-5" />
        </Link>
        <Link
          href="/dashboard/my-tasks"
          className="group flex items-center justify-between rounded-xl border border-primary/30 bg-primary/8 p-3 text-primary hover:bg-primary/12"
        >
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-80">
              {t("dashboard.alerts.myTasksToday")}
            </p>
            <p className="mt-1 font-display text-xl font-semibold">
              {
                visits.filter((v) => {
                  const sameDay =
                    new Date(v.scheduledAt).toDateString() ===
                    new Date().toDateString();
                  return (
                    sameDay &&
                    (v.engineerId === user.id ||
                      user.role === "administrator" ||
                      user.role === "manager")
                  );
                }).length
              }
            </p>
          </div>
          <ClipboardCheck className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: typeof DollarSign;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {title}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="uppercase tracking-wider">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
