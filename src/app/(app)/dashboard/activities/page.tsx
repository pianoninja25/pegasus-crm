"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  Search,
  StickyNote,
  Calendar as CalendarIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatDateTime, relativeTime } from "@/lib/format";
import { PersonChip } from "@/components/common/PersonChip";
import { contactMap, companyMap, dealMap, memberMap } from "@/features/common/seed";
import {
  ACTIVITY_META,
  PRIORITY_META,
  type ActivityKind,
} from "@/features/common/types";
import {
  useActivityList,
  useToggleActivityComplete,
} from "@/features/activities/hooks";

const KIND_ICON: Record<ActivityKind, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: CalendarIcon,
  task: CheckCircle2,
  note: StickyNote,
};

const TABS = [
  { id: "today", label: "Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
  { id: "done", label: "Done" },
  { id: "all", label: "All" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ActivitiesPage() {
  const { data: activities = [] } = useActivityList();
  const toggleDone = useToggleActivityComplete();
  const [tab, setTab] = useState<TabId>("today");
  const [kind, setKind] = useState<ActivityKind | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = Date.now();
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const endToday = new Date(startToday);
    endToday.setDate(endToday.getDate() + 1);

    return activities
      .filter((a) => {
        if (kind !== "all" && a.kind !== kind) return false;
        if (q) {
          const owner = memberMap[a.ownerId]?.name.toLowerCase() ?? "";
          if (
            !a.subject.toLowerCase().includes(q) &&
            !a.body.toLowerCase().includes(q) &&
            !owner.includes(q)
          ) {
            return false;
          }
        }
        const due = new Date(a.dueAt).getTime();
        if (tab === "today") {
          return !a.completedAt && due >= startToday.getTime() && due < endToday.getTime();
        }
        if (tab === "upcoming") {
          return !a.completedAt && due >= endToday.getTime();
        }
        if (tab === "overdue") {
          return !a.completedAt && due < now;
        }
        if (tab === "done") {
          return !!a.completedAt;
        }
        return true;
      })
      .sort((a, b) => {
        if (tab === "done") {
          return (
            new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
          );
        }
        return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      });
  }, [activities, tab, kind, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Activities
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Your task list
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Calls, emails, meetings, tasks and notes — one timeline of what to do.
          </p>
        </div>
        <Button size="sm" className="h-9 gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Log activity
        </Button>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search subject, body or owner…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={kind === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setKind("all")}
              className="h-8 gap-1.5"
            >
              <Filter className="h-3.5 w-3.5" /> All
            </Button>
            {(Object.keys(ACTIVITY_META) as ActivityKind[]).map((k) => {
              const Icon = KIND_ICON[k];
              return (
                <Button
                  key={k}
                  variant={kind === k ? "default" : "outline"}
                  size="sm"
                  onClick={() => setKind(k)}
                  className="h-8 gap-1.5 text-[11px]"
                >
                  <Icon className="h-3 w-3" />
                  {ACTIVITY_META[k].label}
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="text-xs">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            Nothing here. Touch grass.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filtered.map((a) => {
              const Icon = KIND_ICON[a.kind];
              const owner = memberMap[a.ownerId];
              const contact = a.contactId ? contactMap[a.contactId] : null;
              const company = a.companyId ? companyMap[a.companyId] : null;
              const deal = a.dealId ? dealMap[a.dealId] : null;
              const isOverdue = !a.completedAt && new Date(a.dueAt).getTime() < Date.now();
              const priorityMeta = PRIORITY_META[a.priority];
              return (
                <div
                  key={a.id}
                  className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-foreground/5"
                >
                  <button
                    type="button"
                    onClick={() => toggleDone.mutate(a.id)}
                    className="mt-0.5"
                    aria-label={a.completedAt ? "Mark incomplete" : "Mark complete"}
                  >
                    {a.completedAt ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md ring-1 ring-inset",
                      ACTIVITY_META[a.kind].tone,
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "truncate text-xs font-medium text-foreground",
                          a.completedAt && "line-through text-muted-foreground",
                        )}
                      >
                        {a.subject}
                      </p>
                      {a.priority !== "normal" && (
                        <Badge variant="outline" className={cn("h-4 text-[9px]", priorityMeta.tone)}>
                          {priorityMeta.label}
                        </Badge>
                      )}
                    </div>
                    {a.body && (
                      <p className="line-clamp-1 text-[11px] text-muted-foreground">
                        {a.body}
                      </p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                      <span className={cn("inline-flex items-center gap-1", isOverdue && "text-destructive")}>
                        <Clock className="h-3 w-3" />
                        {a.completedAt ? formatDateTime(a.completedAt) : relativeTime(a.dueAt)}
                      </span>
                      {contact && (
                        <Link href={`/dashboard/contacts/${contact.id}`} className="hover:text-foreground hover:underline">
                          @ {contact.fullName}
                        </Link>
                      )}
                      {company && (
                        <Link href={`/dashboard/companies/${company.id}`} className="hover:text-foreground hover:underline">
                          · {company.name}
                        </Link>
                      )}
                      {deal && (
                        <Link href={`/dashboard/deals/${deal.id}`} className="hover:text-foreground hover:underline">
                          · {deal.name.split(" — ").pop()}
                        </Link>
                      )}
                    </div>
                  </div>
                  <PersonChip name={owner?.name ?? ""} email={owner?.email} size="xs" />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

void MessageSquare;
