"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  MapPin,
  Phone,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";

import { InsightCard } from "@/components/common/InsightCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/features/auth/authStore";
import { useT } from "@/features/locale/hooks";
import { useVisits } from "@/features/service/hooks";
import { customerMap, engineers, userMap } from "@/features/service/seed";
import {
  CONTRACT_TYPE_META,
  VISIT_STATUS_META,
} from "@/features/service/types";
import {
  engineerAvatarStyle,
  formatDate,
  formatTime,
  initials,
  relativeTime,
} from "@/lib/format";

export default function MyTasksPage() {
  const t = useT();
  const sessionUser = useAuthStore((s) => s.user);
  const visitsQ = useVisits();
  const visits = useMemo(() => visitsQ.data ?? [], [visitsQ.data]);

  /* ── Resolve "the engineer" for this view ───────────────────────────
   *
   * - If a real engineer is signed in, scope to them.
   * - Otherwise (admin / manager demo) we fall back to the first engineer
   *   so the page is never empty in the demo build.
   */
  const engineerId =
    sessionUser?.role === "engineer" ? sessionUser.id : engineers[0]?.id;
  const engineer = engineerId ? userMap[engineerId] : undefined;

  /* ── Bucketed visit lists ──────────────────────────────────────── */
  const today = useMemo(() => new Date(), []);

  const myVisits = useMemo(
    () => visits.filter((v) => v.engineerId === engineerId),
    [visits, engineerId],
  );

  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const todays = useMemo(
    () =>
      myVisits
        .filter((v) => {
          const d = new Date(v.scheduledAt);
          return (
            `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === todayKey
          );
        })
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime(),
        ),
    [myVisits, todayKey],
  );

  const upcoming = useMemo(
    () =>
      myVisits
        .filter(
          (v) =>
            (v.status === "scheduled" || v.status === "in_progress") &&
            new Date(v.scheduledAt).getTime() > today.getTime(),
        )
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime(),
        ),
    [myVisits, today],
  );

  const completedThisWeek = useMemo(
    () =>
      myVisits.filter((v) => {
        if (v.status !== "completed") return false;
        const d = new Date(v.completedAt ?? v.scheduledAt);
        const days = Math.floor((today.getTime() - d.getTime()) / 86_400_000);
        return days >= 0 && days <= 7;
      }),
    [myVisits, today],
  );

  /* ── Time-of-day greeting ──────────────────────────────────────── */
  const greeting = (() => {
    const h = today.getHours();
    if (h < 12) return t("common.greeting.morning");
    if (h < 18) return t("common.greeting.afternoon");
    return t("common.greeting.evening");
  })();

  const firstName = engineer?.name.split(" ")[0] ?? "";

  /* ── Captions for the next-visit / next-week summaries ─────────── */
  const nextVisit = upcoming[0];
  const upcomingCaption = nextVisit
    ? `${formatDate(nextVisit.scheduledAt)} · ${relativeTime(nextVisit.scheduledAt)}`
    : t("myTasks.insight.upcomingCaption");

  return (
    <div className="space-y-4">
      {/* ── Greeting strip ─────────────────────────────────────────── */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          {engineer && (
            <Avatar className="h-12 w-12">
              <AvatarFallback
                className="text-sm font-semibold"
                style={engineerAvatarStyle(engineer.hue)}
              >
                {initials(engineer.name)}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold">
              {greeting}
              {firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {t("myTasks.subtitle")}
            </p>
          </div>
          <Button asChild size="sm" className="h-8 gap-1.5">
            <Link href="/dashboard/scheduling">
              <CalendarClock className="h-3.5 w-3.5" />
              {t("myTasks.openCalendar")}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* ── Insight strip ─────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          icon={ClipboardCheck}
          tone={todays.length > 0 ? "primary" : "muted"}
          label={t("myTasks.insight.today")}
          value={String(todays.length)}
          caption={t("myTasks.insight.todayCaption")}
        />
        <InsightCard
          icon={Wrench}
          tone={upcoming.length > 0 ? "accent" : "muted"}
          label={t("myTasks.insight.upcoming")}
          value={String(upcoming.length)}
          caption={upcomingCaption}
        />
        <InsightCard
          icon={CheckCircle2}
          tone="success"
          label={t("myTasks.insight.completed")}
          value={String(completedThisWeek.length)}
          caption={t("myTasks.insight.completedCaption")}
        />
        <InsightCard
          icon={Star}
          tone={engineer?.rating ? "warn" : "muted"}
          label={t("myTasks.insight.rating")}
          value={
            engineer?.rating ? `${engineer.rating.toFixed(1)}/5` : "—"
          }
          caption={
            engineer?.rating
              ? t("myTasks.insight.ratingCaption")
              : t("myTasks.insight.ratingNone")
          }
        />
      </div>

      {/* ── Today + Coming up ─────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Today */}
        <Card className="h-fit">
          <CardContent className="space-y-2 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold">
                {t("myTasks.today.title")}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {todays.length}{" "}
                {todays.length === 1
                  ? t("myTasks.today.stopsOne")
                  : t("myTasks.today.stopsMany")}
                {" · "}
                {formatDate(today, { withYear: true })}
              </p>
            </div>
            {todays.length === 0 ? (
              <EmptyRow text={t("myTasks.today.empty")} />
            ) : (
              <div className="space-y-1.5">
                {todays.map((v) => {
                  const cust = customerMap[v.customerId];
                  const meta = VISIT_STATUS_META[v.status];
                  return (
                    <Link
                      key={v.id}
                      href={`/dashboard/work-orders/${v.id}`}
                      className="block rounded-lg border border-border/60 bg-card/40 p-2.5 transition hover:border-primary/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 shrink-0 text-center">
                          <p className="font-display text-sm font-semibold tabular-nums">
                            {formatTime(v.scheduledAt)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {CONTRACT_TYPE_META[v.type].label}
                          </p>
                        </div>
                        <Separator orientation="vertical" className="h-10" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold">
                            {cust?.name}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            <MapPin className="mr-0.5 inline h-3 w-3" />
                            {cust?.address}, {cust?.city}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            <Phone className="mr-0.5 inline h-3 w-3" />
                            {cust?.phone}
                          </p>
                        </div>
                        <StatusBadge
                          label={meta.label}
                          tone={meta.tone}
                          color={meta.color}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coming up */}
        <Card className="h-fit">
          <CardContent className="space-y-2 p-3">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-sm font-semibold">
                {t("myTasks.upcoming.title")}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {t("myTasks.upcoming.hint")}
              </p>
            </div>
            {upcoming.length === 0 ? (
              <EmptyRow text={t("myTasks.upcoming.empty")} />
            ) : (
              <div className="space-y-1.5">
                {upcoming.slice(0, 8).map((v) => {
                  const cust = customerMap[v.customerId];
                  const meta = VISIT_STATUS_META[v.status];
                  return (
                    <Link
                      key={v.id}
                      href={`/dashboard/work-orders/${v.id}`}
                      className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/40 p-2.5 transition hover:border-primary/40"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                          {initials(cust?.name ?? "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {cust?.name}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {CONTRACT_TYPE_META[v.type].label} · {v.number}
                        </p>
                      </div>
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {relativeTime(v.scheduledAt)}
                      </span>
                      <StatusBadge
                        label={meta.label}
                        tone={meta.tone}
                        color={meta.color}
                      />
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ───────────────────────── Sub-components ─────────────────────────────── */

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/60 py-6 text-center">
      <Sparkles className="h-4 w-4 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}
