"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDateTime, initials } from "@/lib/format";
import { ACTIVITY_META } from "@/features/common/types";
import { contactMap, memberMap } from "@/features/common/seed";
import { useActivityList } from "@/features/activities/hooks";

export default function CalendarPage() {
  const { data: activities = [] } = useActivityList();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const monthGrid = useMemo(() => buildMonthGrid(cursor), [cursor]);
  const monthLabel = cursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Bucket activities by yyyy-mm-dd
  const byDay = useMemo(() => {
    const map = new Map<string, typeof activities>();
    for (const a of activities) {
      const key = new Date(a.dueAt).toISOString().slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(a);
      map.set(key, list);
    }
    return map;
  }, [activities]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const upcoming = [...activities]
    .filter((a) => new Date(a.dueAt).getTime() >= Date.now() - 86400000)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Calendar
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {monthLabel}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setCursor(addMonths(cursor, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => {
              const d = new Date();
              d.setHours(0, 0, 0, 0);
              setCursor(d);
            }}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setCursor(addMonths(cursor, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button size="sm" className="h-9 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New event
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[2.4fr_1fr]">
        <Card className="overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border/60 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthGrid.map((date, idx) => {
              const key = date.toISOString().slice(0, 10);
              const isThisMonth = date.getMonth() === cursor.getMonth();
              const isToday = key === todayKey;
              const items = byDay.get(key) ?? [];
              return (
                <div
                  key={idx}
                  className={cn(
                    "relative min-h-[96px] border-b border-r border-border/60 p-2 text-[10px]",
                    isThisMonth ? "bg-card/30" : "bg-background/30 text-muted-foreground",
                    idx % 7 === 6 && "border-r-0",
                    idx >= 35 && "border-b-0",
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold",
                      isToday && "bg-primary text-primary-foreground shadow-glow-sm",
                    )}
                  >
                    {date.getDate()}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {items.slice(0, 3).map((a) => {
                      const meta = ACTIVITY_META[a.kind];
                      return (
                        <div
                          key={a.id}
                          className={cn(
                            "truncate rounded px-1 py-0.5 text-[9px]",
                            meta.tone,
                          )}
                        >
                          {a.subject}
                        </div>
                      );
                    })}
                    {items.length > 3 && (
                      <div className="text-[9px] text-muted-foreground">
                        +{items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Upcoming
            </p>
            <ul className="mt-2 space-y-1.5">
              {upcoming.length === 0 ? (
                <li className="text-xs text-muted-foreground">
                  Nothing scheduled.
                </li>
              ) : (
                upcoming.map((a) => {
                  const meta = ACTIVITY_META[a.kind];
                  const owner = memberMap[a.ownerId];
                  const contact = a.contactId ? contactMap[a.contactId] : null;
                  return (
                    <li
                      key={a.id}
                      className="flex items-start gap-2 rounded-lg border border-border/60 bg-card/40 p-2.5"
                    >
                      <Badge variant="outline" className={cn("h-4 text-[9px]", meta.tone)}>
                        {meta.label}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {a.subject}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDateTime(a.dueAt)}
                        </p>
                        {contact && (
                          <p className="truncate text-[10px] text-muted-foreground">
                            @ {contact.fullName}
                          </p>
                        )}
                      </div>
                      <Avatar className="h-5 w-5 ring-1 ring-border/60">
                        <AvatarFallback className="bg-muted text-[8px]">
                          {initials(owner?.name, owner?.email)}
                        </AvatarFallback>
                      </Avatar>
                    </li>
                  );
                })
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function buildMonthGrid(cursor: Date): Date[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const startDay = first.getDay();
  const start = new Date(first);
  start.setDate(start.getDate() - startDay);
  const grid: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    grid.push(d);
  }
  return grid;
}
