"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  FileText,
  Inbox,
  Receipt,
  RotateCcw,
  Wrench,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatTile } from "@/components/common/StatTile";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from "@/features/service/hooks";
import {
  NOTIFICATION_KIND_META,
  type NotificationKind,
} from "@/features/service/types";
import { formatDate, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const kindIcon: Record<NotificationKind, typeof Bell> = {
  upcoming_service: CalendarClock,
  expiring_contract: CircleAlert,
  quotation_expiring: FileText,
  outstanding_payment: Receipt,
  engineer_assigned: Wrench,
  daily_schedule: CalendarClock,
  overdue_maintenance: CircleAlert,
  renewal_reminder: RotateCcw,
};

const FILTERS: { id: NotificationKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "upcoming_service", label: "Upcoming" },
  { id: "overdue_maintenance", label: "Overdue" },
  { id: "expiring_contract", label: "Contracts" },
  { id: "renewal_reminder", label: "Renewals" },
  { id: "quotation_expiring", label: "Quotations" },
  { id: "outstanding_payment", label: "Payments" },
];

export default function NotificationsPage() {
  const listQ = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const items = useMemo(() => listQ.data ?? [], [listQ.data]);
  const [filter, setFilter] = useState<NotificationKind | "all">("all");

  const counts = useMemo(() => {
    const total = items.length;
    const unread = items.filter((n) => n.unread).length;
    return { total, unread };
  }, [items]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((n) => n.kind === filter);
  }, [items, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Account"
        title="Notifications"
        description="Service reminders, overdue maintenance, expiring contracts, outstanding payments — all in one place."
        actions={
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => markAll.mutate()}
            disabled={counts.unread === 0}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark all read
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Bell}
          label="Unread"
          value={String(counts.unread)}
          tone={counts.unread > 0 ? "primary" : "muted"}
        />
        <StatTile
          icon={Inbox}
          label="Total"
          value={String(counts.total)}
          tone="muted"
        />
        <StatTile
          icon={CircleAlert}
          label="Overdue alerts"
          value={String(
            items.filter((n) => n.kind === "overdue_maintenance").length,
          )}
          tone="destructive"
        />
        <StatTile
          icon={Receipt}
          label="Payment alerts"
          value={String(
            items.filter((n) => n.kind === "outstanding_payment").length,
          )}
          tone="warn"
        />
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-1 p-3">
          {FILTERS.map((f) => (
            <Button
              key={f.id}
              size="sm"
              variant={filter === f.id ? "secondary" : "ghost"}
              className={cn(
                "h-8 px-3 text-xs",
                filter === f.id && "border border-primary/40 text-primary",
              )}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Activity</CardTitle>
          <CardDescription>
            {filtered.length} item{filtered.length === 1 ? "" : "s"} ·{" "}
            {filtered.filter((n) => n.unread).length} unread
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5 p-0">
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 p-8 text-center text-xs text-muted-foreground">
              Nothing here. Inbox zero.
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {filtered.map((n) => {
                const Icon = kindIcon[n.kind];
                const meta = NOTIFICATION_KIND_META[n.kind];
                const Wrapper = ({
                  children,
                }: {
                  children: React.ReactNode;
                }) =>
                  n.href ? (
                    <Link href={n.href} className="block">
                      {children}
                    </Link>
                  ) : (
                    <div>{children}</div>
                  );
                return (
                  <li key={n.id}>
                    <Wrapper>
                      <div
                        className={cn(
                          "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-foreground/5",
                          n.unread && "bg-primary/5",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                            n.unread
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p
                              className={cn(
                                "text-sm",
                                n.unread
                                  ? "font-semibold text-foreground"
                                  : "text-muted-foreground",
                              )}
                            >
                              {n.title}
                            </p>
                            <StatusBadge label={meta.label} tone={meta.tone} />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {n.body}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground/80">
                            {relativeTime(n.createdAt)} ·{" "}
                            {formatDate(n.createdAt, { withYear: true })}
                          </p>
                        </div>
                        {n.unread && (
                          <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-glow" />
                        )}
                      </div>
                    </Wrapper>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
