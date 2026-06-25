"use client";

import Link from "next/link";
import {
  Bell,
  CheckCheck,
  CircleAlert,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TimeStamp } from "@/components/common/TimeStamp";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsList,
} from "@/features/notifications/hooks";
import type { SeedNotification } from "@/features/common/seed";

const KIND_ICON: Record<SeedNotification["kind"], typeof Bell> = {
  deal: Sparkles,
  activity: CheckCheck,
  mention: MessageCircle,
  system: CircleAlert,
};

export default function NotificationsPage() {
  const list = useNotificationsList();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const items = list.data ?? [];
  const unread = items.filter((n) => !n.read);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Notifications
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {unread.length} unread · {items.length} total
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every alert — deal updates, mentions, system events.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5"
          disabled={unread.length === 0}
          onClick={() => markAll.mutate()}
        >
          <CheckCheck className="h-3.5 w-3.5" /> Mark all read
        </Button>
      </div>

      <Card>
        {items.length === 0 ? (
          <CardContent className="py-12 text-center text-xs text-muted-foreground">
            All caught up.
          </CardContent>
        ) : (
          <ul className="divide-y divide-border/60">
            {items.map((n) => {
              const Icon = KIND_ICON[n.kind] ?? Bell;
              return (
                <li key={n.id} className="px-4 py-3">
                  <Link
                    href={n.link}
                    onClick={() => !n.read && markRead.mutate(n.id)}
                    className="flex items-start gap-3"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                        n.read
                          ? "bg-muted text-muted-foreground"
                          : "bg-primary/15 text-primary",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            "truncate text-sm",
                            n.read
                              ? "text-muted-foreground"
                              : "text-foreground font-medium",
                          )}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-glow" />
                        )}
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {n.body}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {n.actor && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Avatar className="h-3.5 w-3.5 ring-1 ring-border/60">
                              <AvatarFallback className="bg-muted text-[7px]">
                                {initials(n.actor.name)}
                              </AvatarFallback>
                            </Avatar>
                            {n.actor.name}
                          </span>
                        )}
                        <TimeStamp
                          iso={n.receivedAt}
                          className="text-[10px] text-muted-foreground"
                        />
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
