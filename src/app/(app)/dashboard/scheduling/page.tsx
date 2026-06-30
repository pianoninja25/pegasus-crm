"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Plus,
  Search,
  Sparkles,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

import { StatusBadge } from "@/components/common/StatusBadge";
import { useSearchSuggestions } from "@/components/common/useSearchSuggestions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { DictKey } from "@/features/locale/dictionary";
import { useT } from "@/features/locale/hooks";
import { useVisits } from "@/features/service/hooks";
import {
  customerMap,
  engineers as allEngineers,
  userMap,
} from "@/features/service/seed";
import {
  CONTRACT_TYPE_META,
  VISIT_STATUS_META,
  type ServiceVisit,
  type VisitStatus,
} from "@/features/service/types";
import {
  engineerAvatarStyle,
  formatDate,
  formatTime,
  humanLatency,
  initials,
} from "@/lib/format";
import { cn } from "@/lib/utils";

/* ─────────────────────── Date helpers ──────────────────────────────────── */

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfMonth(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(1);
  return d;
}
function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}
function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** Engineer hue → CSS colour (matches engineer avatars). */
function hueColor(hue: number | undefined): string {
  return `hsl(${hue ?? 215} 70% 50%)`;
}

/* ─────────────────────── Constants ─────────────────────────────────────── */

const STATUS_ORDER: VisitStatus[] = [
  "scheduled",
  "in_progress",
  "completed",
  "overdue",
  "cancelled",
];

const STATUS_DOT: Record<VisitStatus, string> = {
  scheduled: "bg-sky-500",
  in_progress: "bg-amber-500",
  completed: "bg-emerald-500",
  overdue: "bg-rose-500",
  cancelled: "bg-slate-400",
};

/** Saturation cap for the load bar — a "full" day = 8 booked stops. */
const DAY_CAPACITY = 8;

/* ──────────────────────────── Page ─────────────────────────────────────── */

export default function SchedulingPage() {
  const t = useT();
  const visitsQ = useVisits();
  const list = useMemo(() => visitsQ.data ?? [], [visitsQ.data]);

  /* ── Local state ─────────────────────────────────────────────────── */
  const [cursor, setCursor] = useState<Date>(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date>(() =>
    startOfDay(new Date()),
  );
  const [statusFilters, setStatusFilters] = useState<VisitStatus[]>([]);
  const [engineerFilter, setEngineerFilter] = useState<string>("");
  const [globalSearch, setGlobalSearch] = useState<string>("");

  const toggleStatus = (s: VisitStatus) =>
    setStatusFilters((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
    );

  const filtersActive =
    statusFilters.length > 0 ||
    engineerFilter !== "" ||
    globalSearch.trim() !== "";

  const clearAllFilters = () => {
    setStatusFilters([]);
    setEngineerFilter("");
    setGlobalSearch("");
  };

  /* ── Month grid ──────────────────────────────────────────────────── */
  const days = useMemo(() => {
    const first = startOfMonth(cursor);
    const startWeekday = first.getDay();
    const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
    const totalDays = last.getDate();
    const cells: { date: Date; current: boolean }[] = [];
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(first);
      d.setDate(d.getDate() - (i + 1));
      cells.push({ date: d, current: false });
    }
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        date: new Date(cursor.getFullYear(), cursor.getMonth(), i),
        current: true,
      });
    }
    while (cells.length % 7 !== 0) {
      const tail = cells[cells.length - 1]!.date;
      cells.push({ date: addDays(tail, 1), current: false });
    }
    return cells;
  }, [cursor]);

  /* ── Filtered list (drives calendar + day panel) ────────────────── */
  const filtered = useMemo(() => {
    const needle = globalSearch.trim().toLowerCase();
    return list.filter((v) => {
      if (statusFilters.length > 0 && !statusFilters.includes(v.status))
        return false;
      if (engineerFilter && v.engineerId !== engineerFilter) return false;
      if (needle) {
        const cust = customerMap[v.customerId]?.name ?? "";
        const eng = userMap[v.engineerId]?.name ?? "";
        const hay =
          `${v.number} ${cust} ${eng} ${CONTRACT_TYPE_META[v.type].label}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [list, statusFilters, engineerFilter, globalSearch]);

  /* ── Bucket visits by day, sorted within each ───────────────────── */
  const visitsByDay = useMemo(() => {
    const m: Record<string, ServiceVisit[]> = {};
    for (const v of filtered) {
      (m[dayKey(new Date(v.scheduledAt))] ??= []).push(v);
    }
    for (const k in m) {
      m[k]!.sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() -
          new Date(b.scheduledAt).getTime(),
      );
    }
    return m;
  }, [filtered]);

  const daysVisits = useMemo(
    () => visitsByDay[dayKey(selectedDay)] ?? [],
    [visitsByDay, selectedDay],
  );

  /* ── KPI insights (always on the *full* roster) ─────────────────── */
  const kpis = useMemo(() => {
    const now = new Date();
    const today0 = startOfDay(now);
    const tomorrow0 = addDays(today0, 1);
    const yesterday0 = addDays(today0, -1);
    const weekStart = startOfWeek(today0);
    const weekEnd = addDays(weekStart, 7);
    const lastWeekStart = addDays(weekStart, -7);

    let todayScheduled = 0;
    let todayCompleted = 0;
    let todayInProgress = 0;
    let yesterdayScheduled = 0;
    let weekTotal = 0;
    let weekAssigned = 0;
    let lastWeekTotal = 0;
    let inProgressCount = 0;
    let inProgressDurationSum = 0;
    let inProgressDurationCount = 0;
    let longestRunning: ServiceVisit | null = null;
    let longestRunningMs = 0;
    let overdueCount = 0;
    let unassignedCount = 0;

    for (const v of list) {
      const sched = new Date(v.scheduledAt).getTime();
      if (sched >= today0.getTime() && sched < tomorrow0.getTime()) {
        todayScheduled += 1;
        if (v.status === "completed") todayCompleted += 1;
        if (v.status === "in_progress") todayInProgress += 1;
      }
      if (sched >= yesterday0.getTime() && sched < today0.getTime()) {
        yesterdayScheduled += 1;
      }
      if (sched >= weekStart.getTime() && sched < weekEnd.getTime()) {
        weekTotal += 1;
        if (v.engineerId) weekAssigned += 1;
      }
      if (sched >= lastWeekStart.getTime() && sched < weekStart.getTime()) {
        lastWeekTotal += 1;
      }
      if (v.status === "in_progress") {
        inProgressCount += 1;
        if (v.durationMinutes) {
          inProgressDurationSum += v.durationMinutes;
          inProgressDurationCount += 1;
        }
        if (v.startedAt) {
          const elapsed = Date.now() - new Date(v.startedAt).getTime();
          if (elapsed > longestRunningMs) {
            longestRunningMs = elapsed;
            longestRunning = v;
          }
        }
      }
      if (v.status === "overdue") overdueCount += 1;
      if (!v.engineerId) unassignedCount += 1;
    }

    const coverage =
      weekTotal > 0 ? Math.round((weekAssigned / weekTotal) * 100) : 0;
    const todayDelta = todayScheduled - yesterdayScheduled;
    const weekDelta =
      lastWeekTotal > 0
        ? Math.round(((weekTotal - lastWeekTotal) / lastWeekTotal) * 100)
        : 0;
    const avgDuration =
      inProgressDurationCount > 0
        ? Math.round(inProgressDurationSum / inProgressDurationCount)
        : 0;
    const todayRemaining = Math.max(
      0,
      todayScheduled - todayCompleted - todayInProgress,
    );

    return {
      todayScheduled,
      todayCompleted,
      todayInProgress,
      todayRemaining,
      todayDelta,
      weekTotal,
      weekAssigned,
      coverage,
      lastWeekTotal,
      weekDelta,
      inProgressCount,
      avgDuration,
      longestRunning,
      longestRunningMs,
      overdueCount,
      unassignedCount,
      attentionTotal: overdueCount + unassignedCount,
    };
  }, [list]);

  /* ── Engineer workload this week ─────────────────────────────────── */
  const engineerLoad = useMemo(() => {
    const today0 = startOfDay(new Date());
    const weekStart = startOfWeek(today0);
    const weekStartMs = weekStart.getTime();
    const nowMs = Date.now();
    type EngLoad = {
      engineer: (typeof allEngineers)[number];
      total: number;
      perDay: number[];
      overdue: number;
      completed: number;
      currentVisit?: ServiceVisit;
      nextVisit?: ServiceVisit;
    };
    const map = new Map<string, EngLoad>();
    for (const e of allEngineers) {
      map.set(e.id, {
        engineer: e,
        total: 0,
        perDay: [0, 0, 0, 0, 0, 0, 0],
        overdue: 0,
        completed: 0,
      });
    }
    for (const v of list) {
      const ld = map.get(v.engineerId);
      if (!ld) continue;
      const ts = new Date(v.scheduledAt).getTime();
      const offset = Math.floor((ts - weekStartMs) / 86_400_000);
      if (offset >= 0 && offset < 7) {
        ld.perDay[offset] = ld.perDay[offset]! + 1;
        ld.total += 1;
        if (v.status === "overdue") ld.overdue += 1;
        if (v.status === "completed") ld.completed += 1;
      }
      if (v.status === "in_progress" && !ld.currentVisit) {
        ld.currentVisit = v;
      }
      if (v.status === "scheduled" && ts > nowMs) {
        if (
          !ld.nextVisit ||
          ts < new Date(ld.nextVisit.scheduledAt).getTime()
        ) {
          ld.nextVisit = v;
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [list]);

  const teamWeekTotal = useMemo(
    () => engineerLoad.reduce((sum, e) => sum + e.total, 0),
    [engineerLoad],
  );
  const teamIdleCount = useMemo(
    () => engineerLoad.filter((e) => e.total === 0).length,
    [engineerLoad],
  );

  /* ── Search ─────────────────────────────────────────────────────── */
  const trimmedSearch = globalSearch.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (trimmedSearch.length < 2) return [] as ServiceVisit[];
    return list
      .filter((v) => {
        const cust = customerMap[v.customerId]?.name ?? "";
        const eng = userMap[v.engineerId]?.name ?? "";
        const hay = `${v.number} ${cust} ${eng}`.toLowerCase();
        return hay.includes(trimmedSearch);
      })
      .slice(0, 8);
  }, [list, trimmedSearch]);

  const {
    open: searchOpen,
    setOpen: setSearchOpen,
    activeIndex: activeSuggestion,
    setActiveIndex: setActiveSuggestion,
    boxRef: searchBoxRef,
    onKeyDown: onSearchKeyDown,
  } = useSearchSuggestions({
    suggestions,
    onPick: (v) => {
      const d = new Date(v.scheduledAt);
      setCursor(startOfMonth(d));
      setSelectedDay(startOfDay(d));
      setGlobalSearch("");
    },
    resetKey: trimmedSearch,
  });

  /* ── Weekday labels (locale-aware, narrow) ──────────────────────── */
  const weekdayLabels = useMemo(() => {
    const refSunday = new Date(2024, 0, 7);
    return Array.from({ length: 7 }, (_, i) =>
      addDays(refSunday, i).toLocaleDateString(undefined, { weekday: "narrow" }),
    );
  }, []);

  /* ── Day-panel derived values ───────────────────────────────────── */
  const dayEngineerCount = useMemo(
    () => new Set(daysVisits.map((v) => v.engineerId)).size,
    [daysVisits],
  );
  const selectedIsToday = isSameDay(selectedDay, new Date());
  const nextUpcomingId = useMemo(() => {
    if (!selectedIsToday) return undefined;
    const now = Date.now();
    return daysVisits.find(
      (v) =>
        v.status === "scheduled" && new Date(v.scheduledAt).getTime() > now,
    )?.id;
  }, [daysVisits, selectedIsToday]);

  const engineerFilterMeta = engineerFilter
    ? userMap[engineerFilter]
    : undefined;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-[calc(100dvh-7rem)] flex-col gap-3">
        {/* ── Command strip (metrics + toolbar in one row) ─────────── */}
        <Card>
          <CardContent className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <MiniMetric
                icon={CalendarClock}
                tone="primary"
                label={t("scheduling.metric.today")}
                value={kpis.todayScheduled}
                delta={kpis.todayDelta}
                deltaLabel={t("scheduling.delta.vsYesterday")}
                hint={[
                  {
                    label: t("scheduling.footer.completed"),
                    value: String(kpis.todayCompleted),
                  },
                  {
                    label: t("scheduling.footer.inProgress"),
                    value: String(kpis.todayInProgress),
                  },
                  {
                    label: t("scheduling.footer.remaining"),
                    value: String(kpis.todayRemaining),
                  },
                ]}
              />
              <Divider />
              <MiniMetric
                icon={CalendarDays}
                tone="accent"
                label={t("scheduling.metric.week")}
                value={kpis.weekTotal}
                delta={kpis.lastWeekTotal > 0 ? kpis.weekDelta : null}
                deltaSuffix="%"
                deltaLabel={t("scheduling.delta.vsLastWeek")}
                hint={[
                  {
                    label: t("scheduling.footer.coverage"),
                    value: `${kpis.coverage}%`,
                  },
                ]}
              />
              <Divider />
              <MiniMetric
                icon={Wrench}
                tone={kpis.inProgressCount > 0 ? "warn" : "muted"}
                label={t("scheduling.metric.active")}
                value={kpis.inProgressCount}
                hint={
                  kpis.avgDuration > 0
                    ? [
                        {
                          label: t("scheduling.footer.avgDuration"),
                          value: humanLatency(kpis.avgDuration * 60),
                        },
                      ]
                    : kpis.longestRunning
                      ? [
                          {
                            label: t("scheduling.footer.longest"),
                            value: humanLatency(
                              Math.floor(kpis.longestRunningMs / 1000),
                            ),
                          },
                        ]
                      : []
                }
              />
              <Divider />
              <MiniMetric
                icon={CircleAlert}
                tone={kpis.attentionTotal > 0 ? "destructive" : "muted"}
                label={t("scheduling.metric.risk")}
                value={kpis.attentionTotal}
                hint={[
                  {
                    label: t("scheduling.footer.overdue"),
                    value: String(kpis.overdueCount),
                  },
                  {
                    label: t("scheduling.footer.unassigned"),
                    value: String(kpis.unassignedCount),
                  },
                ]}
              />
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-2">
              {/* Search */}
              <div ref={searchBoxRef} className="relative">
                <Search
                  strokeWidth={2.25}
                  className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-foreground/70"
                />
                <Input
                  value={globalSearch}
                  onChange={(e) => {
                    setGlobalSearch(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={onSearchKeyDown}
                  placeholder={t("scheduling.searchPlaceholder")}
                  className="h-7 w-52 pl-8 text-xs"
                />
                {searchOpen && trimmedSearch.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-lg border border-border/60 bg-popover/95 shadow-xl backdrop-blur">
                    {trimmedSearch.length < 2 ? (
                      <p className="px-3 py-2 text-[11px] text-muted-foreground">
                        {t("customers.search.minChars")}
                      </p>
                    ) : suggestions.length === 0 ? (
                      <p className="px-3 py-2 text-[11px] text-muted-foreground">
                        {t("customers.search.noResults")}
                      </p>
                    ) : (
                      <ul className="max-h-72 overflow-y-auto">
                        {suggestions.map((v, idx) => {
                          const sMeta = VISIT_STATUS_META[v.status];
                          const cust = customerMap[v.customerId];
                          const active = idx === activeSuggestion;
                          return (
                            <li key={v.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  const d = new Date(v.scheduledAt);
                                  setCursor(startOfMonth(d));
                                  setSelectedDay(startOfDay(d));
                                  setGlobalSearch("");
                                  setSearchOpen(false);
                                }}
                                onMouseEnter={() => setActiveSuggestion(idx)}
                                className={cn(
                                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors",
                                  active
                                    ? "bg-primary/15 text-foreground"
                                    : "hover:bg-foreground/5",
                                )}
                              >
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
                                  <Wrench className="h-3.5 w-3.5" />
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-medium text-foreground">
                                    {v.number}
                                  </p>
                                  <p className="truncate text-[10px] text-muted-foreground">
                                    {cust?.name} ·{" "}
                                    {CONTRACT_TYPE_META[v.type].label}
                                  </p>
                                </div>
                                <StatusBadge
                                  label={sMeta.label}
                                  tone={sMeta.tone}
                                  color={sMeta.color}
                                />
                                <span className="text-[10px] tabular-nums text-muted-foreground">
                                  {formatDate(v.scheduledAt)}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Status filter chips */}
              <div className="flex flex-wrap items-center gap-1">
                {STATUS_ORDER.map((s) => {
                  const active = statusFilters.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStatus(s)}
                      className={cn(
                        "inline-flex h-6 items-center gap-1 rounded-full border px-2 text-[10px] transition",
                        active
                          ? "border-primary/40 bg-primary/10 text-foreground"
                          : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          STATUS_DOT[s],
                        )}
                      />
                      {t(`workOrders.status.${s}` as const)}
                    </button>
                  );
                })}
              </div>

              {/* Engineer filter chip (controlled by clicks on the workload rail) */}
              {engineerFilterMeta && (
                <button
                  type="button"
                  onClick={() => setEngineerFilter("")}
                  className="inline-flex h-6 items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-1.5 text-[10px] text-foreground"
                >
                  <Avatar className="h-3.5 w-3.5">
                    <AvatarFallback
                      className="text-[7px] font-semibold"
                      style={engineerAvatarStyle(engineerFilterMeta.hue)}
                    >
                      {initials(engineerFilterMeta.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{engineerFilterMeta.name.split(" ")[0]}</span>
                  <X className="h-3 w-3" />
                </button>
              )}

              {filtersActive && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[10px] font-medium text-primary hover:underline"
                >
                  {t("common.clearFilters")}
                </button>
              )}

              <Button asChild size="sm" className="h-7 gap-1.5 text-xs">
                <Link href="/dashboard/work-orders/new">
                  <Plus className="h-3 w-3" />
                  {t("scheduling.new")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Main 3-column workspace ──────────────────────────────── */}
        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
          {/* Calendar */}
          <Card className="flex flex-col">
            <CardContent className="flex flex-1 flex-col gap-2 p-3 min-h-0">
              <div className="flex items-center justify-between gap-2">
                <h2 className="truncate text-sm font-semibold">
                  {cursor.toLocaleString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <div className="flex shrink-0 items-center gap-0.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setCursor(addMonths(cursor, -1))}
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => {
                      const now = new Date();
                      setCursor(startOfMonth(now));
                      setSelectedDay(startOfDay(now));
                    }}
                  >
                    {t("common.today")}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => setCursor(addMonths(cursor, 1))}
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-[9px] uppercase tracking-wider text-muted-foreground">
                {weekdayLabels.map((d, i) => (
                  <div key={i} className="py-0.5 text-center">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-7 gap-1">
                {days.map(({ date, current }) => (
                  <DayCell
                    key={date.toISOString()}
                    date={date}
                    current={current}
                    isSelected={isSameDay(date, selectedDay)}
                    isToday={isSameDay(date, new Date())}
                    visits={visitsByDay[dayKey(date)] ?? []}
                    onSelect={() => setSelectedDay(startOfDay(date))}
                  />
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2 text-[9px] text-muted-foreground">
                <div className="flex flex-wrap items-center gap-2">
                  {STATUS_ORDER.map((s) => (
                    <div key={s} className="flex items-center gap-1">
                      <span
                        className={cn(
                          "inline-block h-1.5 w-1.5 rounded-full",
                          STATUS_DOT[s],
                        )}
                      />
                      {t(`workOrders.status.${s}` as const)}
                    </div>
                  ))}
                </div>
                <span className="italic">
                  {t("scheduling.day.dayCapacity")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Day panel */}
          <Card className="flex flex-col">
            <CardContent className="flex flex-1 flex-col gap-2 p-3 min-h-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold">
                    {selectedDay.toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {selectedIsToday && (
                      <span className="ml-1.5 inline-flex items-center rounded-full bg-primary/15 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wider text-primary">
                        {t("common.today")}
                      </span>
                    )}
                  </h2>
                  <p className="text-[10px] text-muted-foreground">
                    <span className="tabular-nums">{daysVisits.length}</span>{" "}
                    {daysVisits.length === 1
                      ? t("scheduling.day.stopsOne")
                      : t("scheduling.day.stopsMany")}
                    {daysVisits.length > 0 && (
                      <>
                        {" · "}
                        <span className="tabular-nums">
                          {dayEngineerCount}
                        </span>{" "}
                        {dayEngineerCount === 1
                          ? t("scheduling.day.engineerOne")
                          : t("scheduling.day.engineerMany")}
                      </>
                    )}
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="h-6 shrink-0 gap-1 px-1.5 text-[10px]"
                >
                  <Link href="/dashboard/work-orders/new">
                    <Plus className="h-3 w-3" /> {t("scheduling.book")}
                  </Link>
                </Button>
              </div>

              {daysVisits.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <EmptyDay text={t("scheduling.day.empty")} />
                </div>
              ) : (
                <>
                  <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                    {daysVisits.map((v) => (
                      <li key={v.id}>
                        <DayVisitRow
                          visit={v}
                          isNext={v.id === nextUpcomingId}
                          nextLabel={t("scheduling.day.next")}
                        />
                      </li>
                    ))}
                  </ul>
                  <DayStatusFooter visits={daysVisits} t={t} />
                </>
              )}
            </CardContent>
          </Card>

          {/* Engineer workload */}
          <Card className="flex flex-col">
            <CardContent className="flex flex-1 flex-col gap-2 p-3 min-h-0">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">
                  {t("scheduling.workload.title")}
                </h2>
                <p className="truncate text-[10px] text-muted-foreground">
                  {t("scheduling.workload.hint")}
                </p>
              </div>
              {engineerLoad.length === 0 ||
              engineerLoad.every((e) => e.total === 0) ? (
                <div className="flex flex-1 items-center justify-center">
                  <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                    {t("scheduling.workload.empty")}
                  </p>
                </div>
              ) : (
                <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-0.5 [scrollbar-width:thin]">
                  {engineerLoad.map(
                    ({
                      engineer,
                      total,
                      perDay,
                      overdue,
                      completed,
                      currentVisit,
                      nextVisit,
                    }) => (
                      <li key={engineer.id}>
                        <EngineerLoadRow
                          engineer={engineer}
                          total={total}
                          perDay={perDay}
                          overdue={overdue}
                          completed={completed}
                          currentVisit={currentVisit}
                          nextVisit={nextVisit}
                          isFiltered={engineerFilter === engineer.id}
                          onToggle={() =>
                            setEngineerFilter((cur) =>
                              cur === engineer.id ? "" : engineer.id,
                            )
                          }
                          stopsOne={t("scheduling.workload.stopsOne")}
                          stopsMany={t("scheduling.workload.stopsMany")}
                          overdueLabel={t("scheduling.workload.overdue")}
                          completedLabel={t("scheduling.workload.completed")}
                          idleLabel={t("scheduling.workload.idle")}
                          nowLabel={t("scheduling.workload.now")}
                          nextLabel={t("scheduling.day.next")}
                        />
                      </li>
                    ),
                  )}
                </ul>
              )}
              {engineerLoad.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2 text-[9px] text-muted-foreground">
                  <span>
                    <span className="font-semibold tabular-nums text-foreground">
                      {teamWeekTotal}
                    </span>{" "}
                    {t("scheduling.workload.teamStops")}
                  </span>
                  {teamIdleCount > 0 ? (
                    <span>
                      <span className="tabular-nums">{teamIdleCount}</span>{" "}
                      {t("scheduling.workload.idle")}
                    </span>
                  ) : (
                    <span className="italic">
                      {t("scheduling.workload.fullyBooked")}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}

/* ────────────────────────── Sub-components ─────────────────────────────── */

type MetricTone = "primary" | "accent" | "warn" | "destructive" | "muted";

const TONE_TEXT: Record<MetricTone, string> = {
  primary: "text-primary",
  accent: "text-violet-500",
  warn: "text-amber-500",
  destructive: "text-rose-500",
  muted: "text-muted-foreground",
};

interface MiniMetricProps {
  icon: LucideIcon;
  tone: MetricTone;
  label: string;
  value: number;
  delta?: number | null;
  deltaSuffix?: string;
  deltaLabel?: string;
  hint?: { label: string; value: string }[];
}

/**
 * Single-line metric pill: icon + label + value + (optional) delta badge.
 * Hovering reveals the supporting context (done/active/remaining etc.) so
 * the strip can stay short without losing the secondary breakdown.
 */
function MiniMetric({
  icon: Icon,
  tone,
  label,
  value,
  delta,
  deltaSuffix = "",
  deltaLabel,
  hint = [],
}: MiniMetricProps) {
  const hasDelta = typeof delta === "number" && delta !== 0;
  const positive = (delta ?? 0) >= 0;

  const content = (
    <span className="flex items-center gap-1.5 whitespace-nowrap">
      <Icon className={cn("h-3.5 w-3.5", TONE_TEXT[tone])} />
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-display text-sm font-semibold leading-none tabular-nums text-foreground">
        {value}
      </span>
      {hasDelta && (
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded px-1 py-[1px] text-[9px] font-semibold",
            positive
              ? "bg-emerald-500/10 text-emerald-600 ring-1 ring-inset ring-emerald-500/25 dark:text-emerald-400"
              : "bg-rose-500/10 text-rose-600 ring-1 ring-inset ring-rose-500/25 dark:text-rose-400",
          )}
        >
          {positive ? (
            <ArrowUpRight className="h-2.5 w-2.5" />
          ) : (
            <ArrowDownRight className="h-2.5 w-2.5" />
          )}
          {positive ? "+" : ""}
          {delta}
          {deltaSuffix}
        </span>
      )}
    </span>
  );

  if (hint.length === 0 && !deltaLabel) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="cursor-help focus:outline-none focus:ring-1 focus:ring-primary/40 rounded"
        >
          {content}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-[11px]">
        <p className="mb-0.5 font-semibold text-foreground">
          {label}: {value}
          {hasDelta && deltaLabel && (
            <span className="ml-1 font-normal text-muted-foreground">
              ({positive ? "+" : ""}
              {delta}
              {deltaSuffix} {deltaLabel})
            </span>
          )}
        </p>
        {hint.map((h, i) => (
          <p key={i} className="flex items-center gap-2 text-muted-foreground">
            <span>{h.label}</span>
            <span className="tabular-nums text-foreground">{h.value}</span>
          </p>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}

function Divider() {
  return (
    <span className="hidden h-5 w-px bg-border/60 lg:block" aria-hidden="true" />
  );
}

interface DayCellProps {
  date: Date;
  current: boolean;
  isSelected: boolean;
  isToday: boolean;
  visits: ServiceVisit[];
  onSelect: () => void;
}

/**
 * Calendar day cell — 40 px tall. Day number + visit count on one line,
 * engineer-coloured stacked load bar at the bottom, overdue marker as a
 * tiny inline dot beside the count. Nothing in the middle by design.
 */
function DayCell({
  date,
  current,
  isSelected,
  isToday,
  visits,
  onSelect,
}: DayCellProps) {
  const total = visits.length;
  const overdueHere = visits.some((v) => v.status === "overdue");

  const segments = useMemo(() => {
    const byEng = new Map<string, { count: number; hue: number | undefined }>();
    for (const v of visits) {
      const cur = byEng.get(v.engineerId);
      if (cur) {
        cur.count += 1;
      } else {
        byEng.set(v.engineerId, {
          count: 1,
          hue: userMap[v.engineerId]?.hue,
        });
      }
    }
    return Array.from(byEng.entries())
      .map(([id, x]) => ({ id, ...x }))
      .sort((a, b) => b.count - a.count);
  }, [visits]);

  const loadPct = Math.min(100, (total / DAY_CAPACITY) * 100);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex min-h-10 flex-col justify-between rounded-md border bg-card/30 px-1 py-1 text-left transition-all hover:border-primary/40",
        current ? "border-border/40" : "border-border/20 opacity-40",
        isSelected &&
          "border-primary/60 bg-primary/10 ring-1 ring-primary/30",
        isToday && !isSelected && "ring-1 ring-primary/40",
      )}
    >
      <div className="flex items-center justify-between gap-1 leading-none">
        <span
          className={cn(
            "text-[10px] font-semibold tabular-nums",
            isToday
              ? "text-primary"
              : current
                ? "text-foreground"
                : "text-muted-foreground",
          )}
        >
          {date.getDate()}
        </span>
        <span className="flex items-center gap-1">
          {overdueHere && (
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500"
              aria-label="Overdue on this day"
            />
          )}
          {total > 0 && (
            <span className="font-display text-[10px] font-semibold tabular-nums text-foreground/80">
              {total}
            </span>
          )}
        </span>
      </div>

      {total > 0 ? (
        <div
          className="relative h-1.5 w-full overflow-hidden rounded-full bg-foreground/10"
          title={`${total} stop${total === 1 ? "" : "s"} · ${segments.length} engineer${segments.length === 1 ? "" : "s"}`}
        >
          <div
            className="absolute inset-y-0 left-0 flex overflow-hidden rounded-full"
            style={{ width: `${Math.max(8, loadPct)}%` }}
          >
            {segments.map((seg) => (
              <span
                key={seg.id}
                className="block h-full"
                style={{
                  background: hueColor(seg.hue),
                  width: `${(seg.count / total) * 100}%`,
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        // Keep a 6 px placeholder so cells with and without visits share a
        // baseline — the row stays visually steady when filters change.
        <span className="h-1.5 w-full" aria-hidden="true" />
      )}
    </button>
  );
}

function DayVisitRow({
  visit,
  isNext,
  nextLabel,
}: {
  visit: ServiceVisit;
  isNext: boolean;
  nextLabel: string;
}) {
  const meta = VISIT_STATUS_META[visit.status];
  const eng = userMap[visit.engineerId];
  const cust = customerMap[visit.customerId];
  return (
    <Link
      href={`/dashboard/work-orders/${visit.id}`}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card/40 px-2 py-1.5 transition hover:border-primary/40",
        isNext
          ? "border-primary/40 ring-1 ring-primary/20"
          : "border-border/60",
      )}
    >
      <div className="w-10 shrink-0 text-center">
        <p className="font-display text-[11px] font-semibold tabular-nums leading-tight">
          {formatTime(visit.scheduledAt)}
        </p>
        {visit.durationMinutes ? (
          <p className="text-[8px] text-muted-foreground">
            {humanLatency(visit.durationMinutes * 60)}
          </p>
        ) : null}
      </div>
      <Avatar className="h-5 w-5 shrink-0">
        <AvatarFallback
          className="text-[8px] font-semibold"
          style={engineerAvatarStyle(eng?.hue)}
        >
          {initials(eng?.name ?? "")}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 truncate text-[11px] font-medium">
          {cust?.name}
          {isNext && (
            <span className="inline-flex items-center rounded bg-primary/15 px-1 py-0 text-[8px] font-semibold uppercase tracking-wider text-primary">
              {nextLabel}
            </span>
          )}
        </p>
        <p className="truncate text-[9px] text-muted-foreground">
          {CONTRACT_TYPE_META[visit.type].label} · {visit.number}
        </p>
      </div>
      <StatusBadge label={meta.label} tone={meta.tone} color={meta.color} />
    </Link>
  );
}

interface EngineerLoadRowProps {
  engineer: (typeof allEngineers)[number];
  total: number;
  perDay: number[];
  overdue: number;
  completed: number;
  currentVisit?: ServiceVisit;
  nextVisit?: ServiceVisit;
  isFiltered: boolean;
  onToggle: () => void;
  stopsOne: string;
  stopsMany: string;
  overdueLabel: string;
  completedLabel: string;
  idleLabel: string;
  nowLabel: string;
  nextLabel: string;
}

function EngineerLoadRow({
  engineer,
  total,
  perDay,
  overdue,
  completed,
  currentVisit,
  nextVisit,
  isFiltered,
  onToggle,
  stopsOne,
  stopsMany,
  overdueLabel,
  completedLabel,
  idleLabel,
  nowLabel,
  nextLabel,
}: EngineerLoadRowProps) {
  const idle = total === 0;
  const max = Math.max(1, ...perDay);
  const today0 = startOfDay(new Date());
  const weekStart = startOfWeek(today0);

  /* Pick the most relevant secondary line for this engineer: an active job
   * beats a future one beats "idle". */
  const currentCustomer = currentVisit
    ? customerMap[currentVisit.customerId]?.name
    : undefined;
  const nextCustomer = nextVisit
    ? customerMap[nextVisit.customerId]?.name
    : undefined;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left transition hover:border-primary/40",
        isFiltered
          ? "border-primary/60 bg-primary/10"
          : idle
            ? "border-border/40 bg-transparent opacity-70"
            : "border-border/60 bg-card/40",
      )}
    >
      <Avatar
        className={cn(
          "h-7 w-7 shrink-0",
          idle && !isFiltered && "saturate-50",
        )}
      >
        <AvatarFallback
          className="text-[10px] font-semibold"
          style={engineerAvatarStyle(engineer.hue)}
        >
          {initials(engineer.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-[11px] font-semibold leading-tight">
            {engineer.name}
          </p>
          <span className="ml-auto shrink-0 font-display text-[11px] font-semibold tabular-nums leading-none text-foreground/80">
            {total}
          </span>
        </div>
        {idle ? (
          <p className="truncate text-[9px] italic leading-tight text-muted-foreground">
            {idleLabel}
          </p>
        ) : currentVisit ? (
          <p className="flex items-center gap-1 truncate text-[9px] leading-tight">
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            <span className="font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              {nowLabel}
            </span>
            <span className="truncate text-muted-foreground">
              {currentCustomer ?? "—"}
            </span>
          </p>
        ) : nextVisit ? (
          <p className="flex items-center gap-1 truncate text-[9px] leading-tight">
            <span className="font-semibold uppercase tracking-wider text-primary">
              {nextLabel}
            </span>
            <span className="truncate text-muted-foreground">
              {formatTime(nextVisit.scheduledAt)} · {nextCustomer ?? "—"}
            </span>
          </p>
        ) : (
          <p className="truncate text-[9px] leading-tight text-muted-foreground">
            <span className="tabular-nums">{total}</span>{" "}
            {total === 1 ? stopsOne : stopsMany}
            {overdue > 0 && (
              <span className="ml-1 text-rose-500">
                · {overdue} {overdueLabel}
              </span>
            )}
            {completed > 0 && (
              <span className="ml-1 text-emerald-500">
                · {completed} {completedLabel}
              </span>
            )}
          </p>
        )}
      </div>
      <div
        className="flex h-6 shrink-0 items-end gap-[2px]"
        aria-hidden="true"
      >
        {perDay.map((n, i) => {
          const dayDate = addDays(weekStart, i);
          const isCurrentDay = isSameDay(dayDate, today0);
          return (
            <span
              key={i}
              className={cn(
                "w-1 rounded-sm",
                n === 0
                  ? "bg-foreground/10"
                  : isCurrentDay
                    ? "bg-primary"
                    : "bg-primary/60",
              )}
              style={{
                height: `${
                  n === 0 ? 16 : Math.max(28, (n / max) * 100)
                }%`,
              }}
              title={`${formatDate(dayDate)}: ${n}`}
            />
          );
        })}
      </div>
    </button>
  );
}

function EmptyDay({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-border/60 py-5 text-center">
      <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
      <p className="text-[11px] text-muted-foreground">{text}</p>
    </div>
  );
}

/**
 * Tiny status breakdown for the selected day — sits below the visit list as
 * a single horizontal strip so the card never trails off into empty space.
 */
function DayStatusFooter({
  visits,
  t,
}: {
  visits: ServiceVisit[];
  t: (k: DictKey) => string;
}) {
  const counts = useMemo(() => {
    const init: Record<VisitStatus, number> = {
      scheduled: 0,
      in_progress: 0,
      completed: 0,
      overdue: 0,
      cancelled: 0,
    };
    for (const v of visits) init[v.status] += 1;
    return init;
  }, [visits]);

  const items = STATUS_ORDER.filter((s) => counts[s] > 0);
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-border/40 pt-2 text-[9px] text-muted-foreground">
      {items.map((s) => (
        <div key={s} className="flex items-center gap-1">
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              STATUS_DOT[s],
            )}
          />
          <span className="tabular-nums text-foreground">{counts[s]}</span>{" "}
          {t(`workOrders.status.${s}` as const)}
        </div>
      ))}
    </div>
  );
}
