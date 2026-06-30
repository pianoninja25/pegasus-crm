"use client";

import Link from "next/link";
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

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimeStamp } from "@/components/common/TimeStamp";
import { cn } from "@/lib/utils";
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from "@/features/service/hooks";
import type { NotificationKind } from "@/features/service/types";

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

export function NotificationsMenu() {
  const list = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const items = list.data ?? [];
  const unread = items.filter((n) => n.unread);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread.length > 0 && (
            <span className="absolute right-1.5 top-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-accent shadow-glow" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Bell className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold text-foreground">
              Notifications
            </p>
            {unread.length > 0 && (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                {unread.length} new
              </span>
            )}
          </div>
          {unread.length > 0 && (
            <button
              type="button"
              className="text-[10px] font-medium text-primary hover:underline"
              onClick={() => markAll.mutate()}
            >
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="max-h-[440px]">
          {items.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-border/60">
              {items.slice(0, 14).map((n) => {
                const Icon = kindIcon[n.kind] ?? Bell;
                const inner = (
                  <div className="flex items-start gap-2.5 rounded-md text-left">
                    <span
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        n.unread
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p
                          className={cn(
                            "truncate text-xs",
                            n.unread
                              ? "text-foreground font-medium"
                              : "text-muted-foreground",
                          )}
                        >
                          {n.title}
                        </p>
                        {n.unread && (
                          <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-glow" />
                        )}
                      </div>
                      <p className="line-clamp-2 text-[10px] text-muted-foreground">
                        {n.body}
                      </p>
                      <TimeStamp
                        iso={n.createdAt}
                        className="mt-0.5 text-[10px] text-muted-foreground"
                      />
                    </div>
                  </div>
                );
                return (
                  <li key={n.id} className="px-3 py-2.5">
                    {n.href ? (
                      <Link href={n.href}>{inner}</Link>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
        <div className="border-t border-border/60 px-3 py-2 text-center">
          <Link
            href="/dashboard/notifications"
            className="inline-flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
          >
            <CheckCircle2 className="h-3 w-3" />
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      <Inbox className="h-6 w-6 text-muted-foreground" />
      <p className="text-xs font-medium text-foreground">All caught up</p>
      <p className="text-[10px] text-muted-foreground">
        Service reminders, overdue maintenance, and quotation alerts will show
        up here.
      </p>
    </div>
  );
}
