"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Award,
  BarChart3,
  DollarSign,
  HardHat,
  PackageMinus,
  PieChart,
  Star,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";

import { InsightCard } from "@/components/common/InsightCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useT } from "@/features/locale/hooks";
import {
  useExpenses,
  useInvoices,
  useVisits,
} from "@/features/service/hooks";
import {
  contractStatusBuckets,
  customerMap,
  engineerStats,
  engineers,
  quotations,
} from "@/features/service/seed";
import {
  type ContractStatus,
  type ContractType,
  type ExpenseCategory,
} from "@/features/service/types";
import { engineerAvatarStyle, formatCurrency, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const t = useT();
  const visitsQ = useVisits();
  const invoicesQ = useInvoices();
  const expensesQ = useExpenses();
  const visits = useMemo(() => visitsQ.data ?? [], [visitsQ.data]);
  const invoices = useMemo(() => invoicesQ.data ?? [], [invoicesQ.data]);
  const expenses = useMemo(() => expensesQ.data ?? [], [expensesQ.data]);

  /* ── Top customers by lifetime revenue ─────────────────────────── */
  const topCustomers = useMemo(() => {
    const map: Record<string, number> = {};
    for (const inv of invoices) {
      if (inv.status === "paid" || inv.status === "partially_paid") {
        map[inv.customerId] =
          (map[inv.customerId] ?? 0) +
          inv.amount * (inv.status === "partially_paid" ? 0.5 : 1);
      }
    }
    return Object.entries(map)
      .map(([id, total]) => ({ customer: customerMap[id], total }))
      .filter((x) => x.customer)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [invoices]);

  /* ── Most frequent services ────────────────────────────────────── */
  const serviceFrequency = useMemo(() => {
    const map: Record<string, number> = {};
    for (const v of visits) {
      if (v.status !== "completed") continue;
      map[v.type] = (map[v.type] ?? 0) + 1;
    }
    return Object.entries(map)
      .map(([type, count]) => ({
        type: type as ContractType,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [visits]);

  /* ── Expenses by category ──────────────────────────────────────── */
  const expensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of expenses) {
      map[e.category] = (map[e.category] ?? 0) + e.amount;
    }
    return Object.entries(map)
      .map(([cat, total]) => ({
        cat: cat as ExpenseCategory,
        total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  /* ── Engineer leaderboard YTD ──────────────────────────────────── */
  const ytdStart = new Date();
  ytdStart.setMonth(0, 1);
  ytdStart.setHours(0, 0, 0, 0);
  const ytdEnd = new Date();
  ytdEnd.setFullYear(ytdEnd.getFullYear() + 1);
  ytdEnd.setMonth(0, 1);
  ytdEnd.setHours(0, 0, 0, 0);

  const engineerLeaderboard = useMemo(
    () =>
      engineers
        .map((e) => engineerStats(e.id, ytdStart, ytdEnd))
        .sort((a, b) => b.revenue - a.revenue),
    [ytdStart.getTime(), ytdEnd.getTime()], // eslint-disable-line react-hooks/exhaustive-deps
  );

  /* ── Quotation funnel ──────────────────────────────────────────── */
  const quotationStats = useMemo(() => {
    const total = quotations.length;
    const sent = quotations.filter((q) => q.status === "sent").length;
    const approved = quotations.filter((q) => q.status === "approved").length;
    const won = approved / Math.max(1, total);
    return { total, sent, approved, won };
  }, []);

  /* ── P&L by month (last 6 months) ──────────────────────────────── */
  const pnl = useMemo(() => {
    const now = new Date();
    const months: { label: string; income: number; expense: number; net: number }[] =
      [];
    for (let i = 5; i >= 0; i--) {
      const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const income = invoices
        .filter(
          (inv) =>
            (inv.status === "paid" || inv.status === "partially_paid") &&
            new Date(inv.paidAt ?? inv.issuedAt).getTime() >= from.getTime() &&
            new Date(inv.paidAt ?? inv.issuedAt).getTime() < to.getTime(),
        )
        .reduce(
          (s, inv) =>
            s + inv.amount * (inv.status === "partially_paid" ? 0.5 : 1),
          0,
        );
      const expense = expenses
        .filter(
          (e) =>
            new Date(e.spentAt).getTime() >= from.getTime() &&
            new Date(e.spentAt).getTime() < to.getTime(),
        )
        .reduce((s, e) => s + e.amount, 0);
      months.push({
        label: from.toLocaleString(undefined, { month: "short" }),
        income,
        expense,
        net: income - expense,
      });
    }
    return months;
  }, [invoices, expenses]);

  const totalIncomeYTD = pnl.reduce((s, m) => s + m.income, 0);
  const totalExpenseYTD = pnl.reduce((s, m) => s + m.expense, 0);
  const profit = totalIncomeYTD - totalExpenseYTD;

  const contractBuckets = contractStatusBuckets();

  return (
    <div className="space-y-4">
      {/* ── Title row ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">
            {t("reports.title")}
          </h1>
          <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">
            {t("reports.description")}
          </p>
        </div>
      </div>

      {/* ── KPI strip ─────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          icon={DollarSign}
          tone="success"
          label={t("reports.insight.income6mo")}
          value={formatCurrency(totalIncomeYTD)}
          caption={t("reports.insight.income6moCaption")}
        />
        <InsightCard
          icon={TrendingDown}
          tone="destructive"
          label={t("reports.insight.expenses6mo")}
          value={formatCurrency(totalExpenseYTD)}
          caption={t("reports.insight.expenses6moCaption")}
        />
        <InsightCard
          icon={profit >= 0 ? TrendingUp : TrendingDown}
          tone={profit >= 0 ? "success" : "destructive"}
          label={t("reports.insight.profit6mo")}
          value={formatCurrency(profit)}
          caption={t("reports.insight.profit6moCaption")}
        />
        <InsightCard
          icon={Award}
          tone="primary"
          label={t("reports.insight.winRate")}
          value={`${Math.round(quotationStats.won * 100)}%`}
          caption={`${quotationStats.approved}/${quotationStats.total} · ${t(
            "reports.insight.winRateCaption",
          )}`}
        />
      </div>

      {/* ── P&L chart ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> {t("reports.pnl.title")}
          </CardTitle>
          <CardDescription>{t("reports.pnl.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {pnl.map((m) => {
              const max = Math.max(m.income, m.expense, 1);
              return (
                <div key={m.label} className="flex flex-col items-center">
                  <div className="relative flex h-40 w-full items-end justify-center gap-1">
                    <div
                      className="w-5 rounded-t bg-[image:var(--gradient-primary)]"
                      style={{ height: `${(m.income / max) * 100}%` }}
                      title={formatCurrency(m.income)}
                    />
                    <div
                      className="w-5 rounded-t bg-rose-500/70"
                      style={{ height: `${(m.expense / max) * 100}%` }}
                      title={formatCurrency(m.expense)}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {m.label}
                  </p>
                  <p
                    className={cn(
                      "font-display text-xs font-semibold tabular-nums",
                      m.net >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400",
                    )}
                  >
                    {formatCurrency(m.net)}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Detail panels ─────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top customers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4" /> {t("reports.topCustomers.title")}
            </CardTitle>
            <CardDescription>
              {t("reports.topCustomers.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {topCustomers.map(({ customer, total }, idx) => (
              <Link
                key={customer?.id}
                href={`/dashboard/customers/${customer?.id ?? ""}`}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-2.5 transition-colors hover:border-primary/40 hover:bg-foreground/5"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[11px] font-bold text-primary">
                  {idx + 1}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                    {initials(customer?.name ?? "")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {customer?.name}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {customer?.city}
                  </p>
                </div>
                <span className="text-xs font-semibold tabular-nums">
                  {formatCurrency(total)}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Engineer leaderboard */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HardHat className="h-4 w-4" />{" "}
              {t("reports.engineerLeaderboard.title")}
            </CardTitle>
            <CardDescription>
              {t("reports.engineerLeaderboard.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {engineerLeaderboard.map(
              ({ engineer, completedJobs, revenue, rating }, idx) => (
                <Link
                  key={engineer?.id ?? idx}
                  href={`/dashboard/engineers/${engineer?.id ?? ""}`}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-2.5 transition-colors hover:border-primary/40 hover:bg-foreground/5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {idx + 1}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback
                      className="text-[10px] font-semibold"
                      style={engineerAvatarStyle(engineer?.hue)}
                    >
                      {initials(engineer?.name ?? "")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">
                      {engineer?.name}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {completedJobs} {t("reports.engineer.jobsSuffix")} ·{" "}
                      <Star className="inline h-3 w-3 fill-amber-400 text-amber-400" />{" "}
                      {rating.toFixed(1)}
                    </p>
                  </div>
                  <span className="text-xs font-semibold tabular-nums">
                    {formatCurrency(revenue)}
                  </span>
                </Link>
              ),
            )}
          </CardContent>
        </Card>

        {/* Most frequent services */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4" />{" "}
              {t("reports.frequentServices.title")}
            </CardTitle>
            <CardDescription>
              {t("reports.frequentServices.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {serviceFrequency.map(({ type, count }) => {
              const max = serviceFrequency[0]?.count ?? 1;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span>{t(`contracts.type.${type}` as const)}</span>
                    <span className="font-semibold tabular-nums">{count}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                      style={{ width: `${(count / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Expenses by category */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <PackageMinus className="h-4 w-4" />{" "}
              {t("reports.expensesByCategory.title")}
            </CardTitle>
            <CardDescription>
              {t("reports.expensesByCategory.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {expensesByCategory.map(({ cat, total }) => {
              const max = expensesByCategory[0]?.total ?? 1;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span>{t(`expenses.category.${cat}` as const)}</span>
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-rose-500/70"
                      style={{ width: `${(total / max) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ── Contract health ───────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" /> {t("reports.contractHealth.title")}
          </CardTitle>
          <CardDescription>
            {t("reports.contractHealth.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(Object.entries(contractBuckets) as [ContractStatus, number][]).map(
            ([status, count]) => (
              <div
                key={status}
                className="rounded-lg border border-border/60 bg-card/40 p-3"
              >
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t(`contracts.status.${status}` as const)}
                </p>
                <p className="mt-1 font-display text-xl font-semibold tabular-nums">
                  {count}
                </p>
              </div>
            ),
          )}
        </CardContent>
      </Card>
    </div>
  );
}
