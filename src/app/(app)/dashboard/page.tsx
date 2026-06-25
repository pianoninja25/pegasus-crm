"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  CircleDot,
  Clock,
  Flame,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TimeStamp } from "@/components/common/TimeStamp";
import { PersonChip } from "@/components/common/PersonChip";
import { cn } from "@/lib/utils";
import { compactNumber, formatCurrency, initials, relativeTime } from "@/lib/format";
import {
  contactMap,
  companyMap,
  currentUser,
  memberMap,
  overdueActivitiesCount,
  pipelineByStage,
  openPipelineValue,
  wonThisMonth,
  winRate,
} from "@/features/common/seed";
import { useDealList } from "@/features/deals/hooks";
import { useActivityList } from "@/features/activities/hooks";
import { useInboxList } from "@/features/inbox/hooks";
import { DEAL_STAGE_META, type DealStage } from "@/features/common/types";
import { useAuthStore } from "@/features/auth/authStore";

export default function DashboardOverviewPage() {
  const user = useAuthStore((s) => s.user) ?? currentUser;
  const dealsQ = useDealList();
  const activitiesQ = useActivityList();
  const inboxQ = useInboxList();

  const deals = dealsQ.data ?? [];
  const activities = activitiesQ.data ?? [];
  const inbox = inboxQ.data ?? [];

  const stageTotals = pipelineByStage();
  const openValue = openPipelineValue();
  const wonMonth = wonThisMonth();
  const rate = winRate();
  const overdue = overdueActivitiesCount();

  const topDeals = [...deals]
    .filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost")
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const upcomingTasks = [...activities]
    .filter((a) => !a.completedAt)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 5);

  const unreadInbox = inbox.filter((c) => c.unread).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {greeting()} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Welcome back, {user.name.split(" ")[0]}.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your pipeline is humming. Here&apos;s what to look at first.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            Today
          </Button>
          <Button className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New deal
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Briefcase}
          label="Open pipeline"
          value={formatCurrency(openValue)}
          trend="+12% MoM"
          tone="primary"
        />
        <StatCard
          icon={Award}
          label="Closed-won this month"
          value={formatCurrency(wonMonth)}
          trend="+8 deals"
          tone="success"
        />
        <StatCard
          icon={TrendingUp}
          label="Win rate"
          value={`${Math.round(rate * 100)}%`}
          trend="last 90 days"
          tone="accent"
        />
        <StatCard
          icon={Flame}
          label="Overdue tasks"
          value={overdue.toString()}
          trend={overdue > 0 ? "Needs attention" : "All clear"}
          tone={overdue > 0 ? "warn" : "muted"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Pipeline summary */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Pipeline by stage</CardTitle>
              <CardDescription>Click into a stage to see the deals.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Link href="/dashboard/pipeline">
                Open pipeline <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {(Object.keys(stageTotals) as DealStage[])
              .filter((s) => s !== "closed_lost")
              .map((stage) => {
                const meta = DEAL_STAGE_META[stage];
                const slot = stageTotals[stage];
                const pct =
                  openValue > 0
                    ? Math.round((slot.value / Math.max(openValue, 1)) * 100)
                    : 0;
                return (
                  <Link
                    key={stage}
                    href={`/dashboard/pipeline?stage=${stage}`}
                    className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 transition hover:border-primary/40"
                  >
                    <span
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold"
                      style={{
                        backgroundColor: `${meta.color}22`,
                        color: meta.color,
                      }}
                    >
                      {slot.count}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-medium text-foreground">
                          {meta.label}
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {formatCurrency(slot.value)}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${meta.color}, ${meta.color}99)`,
                          }}
                        />
                      </div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                  </Link>
                );
              })}
          </CardContent>
        </Card>

        {/* Inbox preview */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Inbox highlights</CardTitle>
              <CardDescription>{inbox.filter((c) => c.unread).length} unread threads</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Link href="/dashboard/inbox">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {unreadInbox.length === 0 ? (
              <EmptyHint icon={CheckCircle2} text="Inbox zero. Nice work." />
            ) : (
              unreadInbox.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/inbox?thread=${c.id}`}
                  className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card/40 p-2.5 transition hover:border-primary/40"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                      {initials(c.fromName, c.fromEmail)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-xs font-semibold text-foreground">
                        {c.fromName}
                      </p>
                      <span className="text-[10px] text-muted-foreground">
                        {relativeTime(c.receivedAt)}
                      </span>
                    </div>
                    <p className="truncate text-[11px] font-medium text-foreground">
                      {c.subject}
                    </p>
                    <p className="line-clamp-2 text-[10px] text-muted-foreground">
                      {c.preview}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Top deals */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">Top open deals</CardTitle>
              <CardDescription>Sorted by value across all stages.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Link href="/dashboard/deals">
                All deals <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {topDeals.map((d) => {
              const meta = DEAL_STAGE_META[d.stage];
              const owner = memberMap[d.ownerId];
              return (
                <Link
                  key={d.id}
                  href={`/dashboard/deals/${d.id}`}
                  className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 px-3 py-2 transition hover:border-primary/40"
                >
                  <span
                    className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold uppercase"
                    style={{
                      backgroundColor: `${meta.color}22`,
                      color: meta.color,
                    }}
                  >
                    {companyMap[d.companyId]?.name.charAt(0) ?? "?"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {d.name}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {companyMap[d.companyId]?.name} · {owner?.name ?? "Unassigned"}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="h-5 text-[10px]"
                    style={{ borderColor: `${meta.color}66`, color: meta.color }}
                  >
                    {meta.label}
                  </Badge>
                  <span className="ml-2 text-xs font-semibold tabular-nums">
                    ${compactNumber(d.value)}
                  </span>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Upcoming tasks */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base">My next tasks</CardTitle>
              <CardDescription>
                {upcomingTasks.length} open this week
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Link href="/dashboard/activities">
                All <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {upcomingTasks.length === 0 ? (
              <EmptyHint icon={Sparkles} text="No tasks left. Touch grass." />
            ) : (
              upcomingTasks.map((t) => {
                const isOverdue = new Date(t.dueAt).getTime() < Date.now();
                return (
                  <div
                    key={t.id}
                    className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-card/40 p-2.5"
                  >
                    <CircleDot
                      className={cn(
                        "mt-0.5 h-3.5 w-3.5 shrink-0",
                        isOverdue ? "text-destructive" : "text-primary",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">
                        {t.subject}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className={cn(isOverdue && "text-destructive")}>
                          {relativeTime(t.dueAt)}
                        </span>
                        {t.contactId && (
                          <>
                            <span>·</span>
                            <span className="truncate">
                              {contactMap[t.contactId]?.fullName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Team activity */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-base">Team this week</CardTitle>
            <CardDescription>Who&apos;s closing what.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" /> Roster
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.values(memberMap).map((member) => {
              const owned = deals.filter((d) => d.ownerId === member.id);
              const wonVal = owned
                .filter((d) => d.stage === "closed_won")
                .reduce((s, d) => s + d.value, 0);
              const openVal = owned
                .filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost")
                .reduce((s, d) => s + d.value, 0);
              return (
                <div
                  key={member.id}
                  className="rounded-lg border border-border/60 bg-card/40 p-3"
                >
                  <PersonChip
                    name={member.name}
                    email={member.email}
                    size="md"
                  />
                  <p className="mt-1 ml-9 -translate-y-3 text-[10px] text-muted-foreground">
                    {member.title}
                  </p>
                  <div className="mt-1 grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
                    <div>
                      <p className="uppercase tracking-wider">Open</p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        ${compactNumber(openVal)}
                      </p>
                    </div>
                    <div>
                      <p className="uppercase tracking-wider">Won</p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        ${compactNumber(wonVal)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  tone,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
  trend: string;
  tone: "primary" | "success" | "accent" | "warn" | "muted";
}) {
  const toneClass: Record<typeof tone, string> = {
    primary: "text-primary",
    success: "text-emerald-400",
    accent: "text-accent",
    warn: "text-amber-400",
    muted: "text-muted-foreground",
  } as const;
  return (
    <Card className="overflow-hidden">
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
          <span className={cn("text-[10px] font-medium", toneClass[tone])}>
            {trend}
          </span>
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

function EmptyHint({ icon: Icon, text }: { icon: typeof Sparkles; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 px-4 py-8 text-center">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// Hint to silence the unused-import warning in environments where TimeStamp
// might be tree-shaken away if no callsite remains.
void TimeStamp;
