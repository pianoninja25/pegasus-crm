"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  ArrowLeft,
  Award,
  CalendarClock,
  CheckCircle2,
  Clock,
  HardHat,
  Mail,
  Phone,
  Sparkles,
  Star,
  Timer,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useT } from "@/features/locale/hooks";
import { useEngineer } from "@/features/service/hooks";
import {
  customerMap,
  engineerStats,
  visitsByEngineer,
} from "@/features/service/seed";
import {
  CONTRACT_TYPE_META,
  VISIT_STATUS_META,
} from "@/features/service/types";
import {
  engineerAvatarStyle,
  formatCurrency,
  formatDate,
  initials,
  relativeTime,
} from "@/lib/format";

export default function EngineerDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useT();
  const engineerQ = useEngineer(params.id);
  const engineer = engineerQ.data ?? null;

  /* ── MTD stats (calendar month) ──────────────────────────────────── */
  const monthly = useMemo(() => {
    if (!engineer) return null;
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    return engineerStats(engineer.id, start, end);
  }, [engineer]);

  /* ── Visit history ──────────────────────────────────────────────── */
  const visits = useMemo(
    () => (engineer ? visitsByEngineer[engineer.id] ?? [] : []),
    [engineer],
  );
  const sortedVisits = useMemo(
    () =>
      [...visits].sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() -
          new Date(a.scheduledAt).getTime(),
      ),
    [visits],
  );

  const upcoming = sortedVisits.filter(
    (v) => v.status === "scheduled" || v.status === "in_progress",
  );
  const completed = sortedVisits.filter((v) => v.status === "completed");

  /* ── derived lifetime metrics ───────────────────────────────────── */
  const nextVisit = useMemo(
    () =>
      [...upcoming].sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() -
          new Date(b.scheduledAt).getTime(),
      )[0] ?? null,
    [upcoming],
  );
  const lastVisit = completed[0] ?? null;
  const lifetimeRevenue = useMemo(
    () => completed.reduce((s, v) => s + (v.revenue ?? 0), 0),
    [completed],
  );

  /* ── Empty / loading states ─────────────────────────────────────── */
  if (!engineerQ.isLoading && !engineer) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/engineers">
            <ArrowLeft className="h-3.5 w-3.5" /> {t("common.engineers")}
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            {t("engineers.detail.notFound")}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!engineer || !monthly) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2 h-7 gap-1.5">
        <Link href="/dashboard/engineers">
          <ArrowLeft className="h-3.5 w-3.5" /> {t("common.engineers")}
        </Link>
      </Button>

      {/* ── Hero card: avatar + name + chips + actions on one strip ── */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback
              className="text-sm font-semibold"
              style={engineerAvatarStyle(engineer.hue)}
            >
              {initials(engineer.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold">
                {engineer.name}
              </h1>
              <Badge
                variant="outline"
                className="h-5 gap-1 border-primary/40 text-[10px] text-primary"
              >
                <HardHat className="h-3 w-3" /> {engineer.title}
              </Badge>
              {(engineer.experienceYears ?? 0) > 0 && (
                <Badge
                  variant="outline"
                  className="h-5 gap-1 border-border/60 text-[10px] text-muted-foreground"
                >
                  <Award className="h-3 w-3" /> {engineer.experienceYears}
                  {t("engineers.experienceShort")}
                </Badge>
              )}
              {(engineer.rating ?? 0) > 0 && (
                <Badge
                  variant="outline"
                  className="h-5 gap-1 border-amber-500/40 text-[10px] text-amber-700 dark:text-amber-300"
                >
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {engineer.rating?.toFixed(1)}
                </Badge>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" /> {engineer.phone}
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" /> {engineer.email}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" />
              {t("engineers.detail.assignVisit")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Insight strip ─────────────────────────────────────────────── */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <InsightCard
          variant="compact"
          icon={Wrench}
          tone="success"
          label={t("engineers.column.completed")}
          value={String(monthly.completedJobs)}
          caption={t("engineers.insight.jobsCompletedCaption")}
        />
        <InsightCard
          variant="compact"
          icon={CalendarClock}
          tone={monthly.scheduledJobs > 0 ? "primary" : "muted"}
          label={t("engineers.column.scheduled")}
          value={String(monthly.scheduledJobs)}
          caption={
            nextVisit
              ? `${formatDate(nextVisit.scheduledAt)} · ${relativeTime(nextVisit.scheduledAt)}`
              : t("engineers.detail.noUpcoming")
          }
        />
        <InsightCard
          variant="compact"
          icon={Timer}
          tone="accent"
          label={t("engineers.column.hours")}
          value={`${monthly.serviceHours}h`}
          caption={t("engineers.insight.serviceHoursCaption")}
        />
        <InsightCard
          variant="compact"
          icon={Star}
          tone={monthly.rating > 0 ? "warn" : "muted"}
          label={t("engineers.column.rating")}
          value={monthly.rating > 0 ? `${monthly.rating.toFixed(1)}/5` : "—"}
          caption={t("engineers.insight.avgRatingCaption")}
        />
        <InsightCard
          variant="compact"
          icon={Clock}
          tone="muted"
          label={t("engineers.detail.lastVisit")}
          value={lastVisit ? relativeTime(lastVisit.scheduledAt) : "—"}
          caption={
            lastVisit
              ? CONTRACT_TYPE_META[lastVisit.type].label
              : t("engineers.detail.noCompleted")
          }
        />
        <InsightCard
          variant="compact"
          icon={TrendingUp}
          tone="primary"
          label={t("engineers.column.revenue")}
          value={formatCurrency(monthly.revenue)}
          caption={`${formatCurrency(lifetimeRevenue)} ${t("engineers.detail.lifetimeRevenue")}`}
        />
      </div>

      {/* ── Main grid: profile rail + activity tabs ──────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Profile rail (compact) */}
        <Card className="h-fit">
          <CardContent className="space-y-3 p-3 text-xs">
            {/* Avatar + identity */}
            <div className="flex items-center gap-2">
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
                  {t("engineers.detail.profile")}
                </p>
                <p className="truncate font-medium text-foreground">
                  {engineer.name}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {engineer.title}
                </p>
              </div>
            </div>

            {/* Skills */}
            {(engineer.skills?.length ?? 0) > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("engineers.detail.skills")}
                </p>
                <div className="flex flex-wrap gap-1">
                  {engineer.skills?.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="h-5 text-[10px]"
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 border-t border-border/40 pt-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("engineers.detail.experience")}
                </p>
                <p className="font-medium text-foreground tabular-nums">
                  {engineer.experienceYears ?? 0} {t("engineers.years")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("engineers.detail.revenueMtd")}
                </p>
                <p className="font-medium text-foreground tabular-nums">
                  {formatCurrency(monthly.revenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity tabs */}
        <Tabs defaultValue="upcoming" className="space-y-3">
          <TabsList className="h-9">
            <TabsTrigger value="upcoming" className="text-xs">
              <CalendarClock className="mr-1 h-3 w-3" />
              {t("engineers.detail.upcoming")} · {upcoming.length}
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {t("engineers.detail.completedTimeline")} · {completed.length}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="m-0 space-y-1.5">
            {upcoming.length === 0 ? (
              <EmptyRow text={t("engineers.detail.noUpcoming")} />
            ) : (
              upcoming.slice(0, 12).map((v) => {
                const cust = customerMap[v.customerId];
                const meta = VISIT_STATUS_META[v.status];
                return (
                  <Link
                    key={v.id}
                    href={`/dashboard/work-orders/${v.id}`}
                    className="block"
                  >
                    <Card className="transition hover:border-primary/40">
                      <CardContent className="flex flex-wrap items-center gap-3 p-2.5">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                          <Wrench className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold">
                            {cust?.name}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {CONTRACT_TYPE_META[v.type].label} · {v.number}
                          </p>
                        </div>
                        <span className="hidden text-[10px] tabular-nums text-muted-foreground sm:inline">
                          {formatDate(v.scheduledAt)}
                        </span>
                        <StatusBadge
                          label={meta.label}
                          tone={meta.tone}
                          color={meta.color}
                        />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="timeline" className="m-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  {t("engineers.detail.completedTimeline")}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t("engineers.detail.completedTimelineHint")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-1">
                {completed.length === 0 ? (
                  <EmptyRow text={t("engineers.detail.noCompleted")} />
                ) : (
                  <ol className="relative space-y-2.5 border-l border-border/60 pl-5">
                    {completed.slice(0, 20).map((v) => {
                      const cust = customerMap[v.customerId];
                      return (
                        <li key={v.id} className="relative">
                          <span className="absolute -left-[28px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 ring-4 ring-background dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                          </span>
                          <Link
                            href={`/dashboard/work-orders/${v.id}`}
                            className="block"
                          >
                            <p className="text-xs font-medium text-foreground">
                              {cust?.name} ·{" "}
                              {CONTRACT_TYPE_META[v.type].label}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {v.number}
                              {v.revenue
                                ? ` · ${formatCurrency(v.revenue)}`
                                : ""}
                            </p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground/80">
                              {relativeTime(v.completedAt ?? v.scheduledAt)} ·{" "}
                              {formatDate(v.completedAt ?? v.scheduledAt, {
                                withYear: true,
                              })}
                            </p>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ───────────────────────── Sub-components ─────────────────────────────── */

function EmptyRow({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
        <Sparkles className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}
