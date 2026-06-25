"use client";

import { useMemo } from "react";
import { Activity, Award, Briefcase, Clock, TrendingUp, Users } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { compactNumber, formatCurrency } from "@/lib/format";
import {
  ACTIVE_STAGES,
  DEAL_STAGE_META,
  type DealStage,
} from "@/features/common/types";
import {
  memberMap,
  pipelineByStage,
  openPipelineValue,
  wonThisMonth,
  winRate,
} from "@/features/common/seed";
import { useDealList } from "@/features/deals/hooks";
import { useActivityList } from "@/features/activities/hooks";

export default function ReportsPage() {
  const { data: deals = [] } = useDealList();
  const { data: activities = [] } = useActivityList();

  const stageTotals = pipelineByStage();
  const open = openPipelineValue();
  const won = wonThisMonth();
  const rate = winRate();

  const byOwner = useMemo(() => {
    const map = new Map<string, { open: number; won: number; lost: number; count: number }>();
    for (const d of deals) {
      const cur = map.get(d.ownerId) ?? { open: 0, won: 0, lost: 0, count: 0 };
      cur.count += 1;
      if (d.stage === "closed_won") cur.won += d.value;
      else if (d.stage === "closed_lost") cur.lost += d.value;
      else cur.open += d.value;
      map.set(d.ownerId, cur);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].won + b[1].open - (a[1].won + a[1].open));
  }, [deals]);

  const sourceTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of deals) {
      map.set(d.source, (map.get(d.source) ?? 0) + d.value);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [deals]);

  const activityCounts = useMemo(() => {
    const counts: Record<string, number> = { call: 0, email: 0, meeting: 0, task: 0, note: 0 };
    for (const a of activities) counts[a.kind] = (counts[a.kind] ?? 0) + 1;
    return counts;
  }, [activities]);

  const maxOwner = Math.max(1, ...byOwner.map(([, v]) => v.open + v.won));
  const maxSource = Math.max(1, ...sourceTotals.map(([, v]) => v));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Reports
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Revenue & velocity
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A high-level read on how the team is doing this period.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Open pipeline" value={formatCurrency(open)} icon={Briefcase} tone="primary" />
        <Kpi label="Closed-won (MTD)" value={formatCurrency(won)} icon={Award} tone="success" />
        <Kpi label="Win rate" value={`${Math.round(rate * 100)}%`} icon={TrendingUp} tone="accent" />
        <Kpi label="Active deals" value={String(deals.filter((d) => ACTIVE_STAGES.includes(d.stage)).length)} icon={Activity} tone="default" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pipeline by stage</CardTitle>
            <CardDescription>Value distribution across active stages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {(Object.keys(stageTotals) as DealStage[]).map((stage) => {
              const meta = DEAL_STAGE_META[stage];
              const total = stageTotals[stage];
              const pct = Math.round((total.value / Math.max(open + total.value, 1)) * 100);
              return (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-flex h-2 w-2 rounded-full"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span className="font-medium">{meta.label}</span>
                      <span className="text-muted-foreground">· {total.count}</span>
                    </span>
                    <span className="font-semibold tabular-nums">{formatCurrency(total.value)}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        background: `linear-gradient(90deg, ${meta.color}, ${meta.color}66)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Activity mix (this period)</CardTitle>
            <CardDescription>What the team actually did.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(activityCounts).map(([kind, count]) => (
                <div
                  key={kind}
                  className="rounded-lg border border-border/60 bg-card/40 p-3"
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {kind}
                  </p>
                  <p className="mt-0.5 font-display text-xl font-semibold">
                    {count}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Revenue by owner</CardTitle>
            <CardDescription>
              <Users className="mr-1 inline h-3 w-3" /> Stack-ranked by total influence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {byOwner.map(([ownerId, totals]) => {
              const owner = memberMap[ownerId];
              const total = totals.open + totals.won;
              const wonPct = total > 0 ? (totals.won / total) * 100 : 0;
              const openPct = total > 0 ? (totals.open / total) * 100 : 0;
              const widthPct = (total / maxOwner) * 100;
              return (
                <div key={ownerId} className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{owner?.name}</span>
                    <span className="text-muted-foreground tabular-nums">
                      ${compactNumber(total)} · {totals.count} deals
                    </span>
                  </div>
                  <div
                    className="mt-1 flex h-2 overflow-hidden rounded-full bg-muted"
                    style={{ width: `${Math.max(widthPct, 6)}%` }}
                  >
                    <div
                      className="h-full bg-emerald-500/70"
                      style={{ width: `${wonPct}%` }}
                    />
                    <div
                      className="h-full bg-primary/70"
                      style={{ width: `${openPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="mt-3 flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500/70" /> Won
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary/70" /> Open
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Top deal sources</CardTitle>
            <CardDescription>Where revenue is coming from.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sourceTotals.map(([source, value]) => {
              const pct = (value / maxSource) * 100;
              return (
                <div key={source} className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{source}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {formatCurrency(value)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[image:var(--gradient-primary)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Briefcase;
  tone: "primary" | "success" | "accent" | "default";
}) {
  const toneClass: Record<typeof tone, string> = {
    primary: "text-primary",
    success: "text-emerald-400",
    accent: "text-accent",
    default: "text-muted-foreground",
  } as const;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-md bg-foreground/5 ring-1 ring-inset ring-border/60 ${toneClass[tone]}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          <Clock className="h-3 w-3 text-muted-foreground" />
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 font-display text-2xl font-semibold tracking-tight">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
