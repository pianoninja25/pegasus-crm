"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CornerUpLeft,
  Linkedin,
  Mail,
  MessageCircle,
  Phone,
  Reply,
  Search,
  Send,
  Star,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { initials, relativeTime } from "@/lib/format";
import {
  useInboxList,
  useMarkRead,
  useToggleStarConversation,
} from "@/features/inbox/hooks";
import { companyMap, contactMap, dealMap, memberMap } from "@/features/common/seed";
import type { SeedConversation } from "@/features/common/seed";

const CHANNEL_ICON: Record<SeedConversation["channel"], typeof Mail> = {
  email: Mail,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  phone: Phone,
};

export default function InboxPage() {
  return (
    <Suspense fallback={null}>
      <InboxView />
    </Suspense>
  );
}

function InboxView() {
  const { data: list = [] } = useInboxList();
  const markRead = useMarkRead();
  const toggleStar = useToggleStarConversation();
  const params = useSearchParams();
  const initialThread = params.get("thread");
  const [active, setActive] = useState<string | null>(initialThread);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "starred" | "reply">(
    "all",
  );
  const [draft, setDraft] = useState("");

  // Default to the first thread if nothing is selected
  useEffect(() => {
    if (!active && list[0]) setActive(list[0].id);
  }, [list, active]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((c) => {
      if (filter === "unread" && !c.unread) return false;
      if (filter === "starred" && !c.starred) return false;
      if (filter === "reply" && !c.needsReply) return false;
      if (!q) return true;
      return (
        c.subject.toLowerCase().includes(q) ||
        c.fromName.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q)
      );
    });
  }, [list, filter, query]);

  const selected = list.find((c) => c.id === active) ?? null;

  // Mark read when the user opens a thread (mock backend acks instantly)
  useEffect(() => {
    if (selected && selected.unread) {
      markRead.mutate(selected.id);
    }
  }, [selected, markRead]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Inbox
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Inbox
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Replies, intros and follow-ups — stitched back to the right deal.
          </p>
        </div>
      </div>

      <Card className="grid h-[calc(100vh-220px)] grid-cols-1 overflow-hidden lg:grid-cols-[360px_1fr]">
        {/* List */}
        <div
          className={cn(
            "flex flex-col border-r border-border/60 bg-card/40",
            active && "hidden lg:flex",
          )}
        >
          <div className="border-b border-border/60 p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search inbox…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
            <div className="mt-2 flex items-center gap-1">
              {(["all", "unread", "starred", "reply"] as const).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? "default" : "ghost"}
                  className="h-7 text-[11px] capitalize"
                  onClick={() => setFilter(f)}
                >
                  {f === "reply" ? "Needs reply" : f}
                </Button>
              ))}
            </div>
          </div>
          <ScrollArea className="flex-1">
            <ul className="divide-y divide-border/60">
              {filtered.length === 0 && (
                <li className="px-3 py-10 text-center text-xs text-muted-foreground">
                  Nothing here.
                </li>
              )}
              {filtered.map((c) => {
                const isActive = active === c.id;
                const ChannelIcon = CHANNEL_ICON[c.channel];
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setActive(c.id)}
                      className={cn(
                        "flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors",
                        isActive ? "bg-primary/10" : "hover:bg-foreground/5",
                      )}
                    >
                      <Avatar className="h-8 w-8 ring-1 ring-border/60">
                        <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                          {initials(c.fromName, c.fromEmail)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p
                            className={cn(
                              "truncate text-xs",
                              c.unread
                                ? "font-semibold text-foreground"
                                : "text-foreground/80",
                            )}
                          >
                            {c.fromName}
                          </p>
                          {c.starred && (
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          )}
                          <ChannelIcon className="ml-auto h-3 w-3 text-muted-foreground" />
                        </div>
                        <p
                          className={cn(
                            "truncate text-[11px]",
                            c.unread
                              ? "text-foreground/90 font-medium"
                              : "text-muted-foreground",
                          )}
                        >
                          {c.subject}
                        </p>
                        <p className="line-clamp-1 text-[10px] text-muted-foreground">
                          {c.preview}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground">
                            {relativeTime(c.receivedAt)}
                          </span>
                          {c.needsReply && (
                            <Badge
                              variant="outline"
                              className="h-3.5 px-1 text-[8px] text-accent border-accent/30 bg-accent/10"
                            >
                              <Reply className="mr-0.5 h-2 w-2" /> Reply
                            </Badge>
                          )}
                          {c.unread && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent shadow-glow" />
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </div>

        {/* Detail */}
        <div className={cn("flex flex-col", !active && "hidden lg:flex")}>
          {!selected ? (
            <div className="grid flex-1 place-items-center text-xs text-muted-foreground">
              Select a thread.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 lg:hidden"
                    onClick={() => setActive(null)}
                    aria-label="Back"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Avatar className="h-9 w-9 ring-1 ring-border/60">
                    <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                      {initials(selected.fromName, selected.fromEmail)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {selected.fromName}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {selected.fromEmail}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => toggleStar.mutate(selected.id)}
                    aria-label={selected.starred ? "Unstar" : "Star"}
                  >
                    <Star
                      className={cn(
                        "h-3.5 w-3.5",
                        selected.starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
                      )}
                    />
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="space-y-4 p-5">
                  <h2 className="font-display text-base font-semibold">
                    {selected.subject}
                  </h2>

                  <RelatedRow conversation={selected} />

                  <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
                    <div className="mb-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{selected.fromName}</span>
                      <span>{relativeTime(selected.receivedAt)}</span>
                    </div>
                    <p className="whitespace-pre-line text-sm text-foreground/90">
                      {selected.preview}
                    </p>
                    <p className="mt-3 whitespace-pre-line text-sm text-foreground/90">
                      Wanted to circle back on this. We&apos;ve got a couple of
                      questions from the team — happy to set up a 30-min walk-
                      through whenever it works on your side.
                    </p>
                    <p className="mt-3 whitespace-pre-line text-sm text-foreground/90">
                      Thanks!
                    </p>
                  </div>

                  <div className="rounded-2xl border border-dashed border-border/60 bg-background/40 p-3">
                    <p className="mb-2 flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <CornerUpLeft className="h-3 w-3" /> Quick reply
                    </p>
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Write a reply…"
                      className="min-h-[100px] text-sm"
                    />
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setDraft("")}>
                        Discard
                      </Button>
                      <Button size="sm" className="gap-1.5" onClick={() => setDraft("")}>
                        <Send className="h-3.5 w-3.5" /> Send
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

function RelatedRow({ conversation }: { conversation: SeedConversation }) {
  const contact = conversation.contactId ? contactMap[conversation.contactId] : null;
  const company = conversation.companyId ? companyMap[conversation.companyId] : null;
  const deal = conversation.dealId ? dealMap[conversation.dealId] : null;
  const owner = memberMap[conversation.ownerId];

  return (
    <div className="flex flex-wrap gap-2 text-[11px]">
      {contact && (
        <Link
          href={`/dashboard/contacts/${contact.id}`}
          className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-card/40 px-2 py-1 hover:border-primary/40"
        >
          <Avatar className="h-3.5 w-3.5">
            <AvatarFallback className="bg-primary/15 text-[8px]">
              {initials(contact.fullName, contact.email)}
            </AvatarFallback>
          </Avatar>
          {contact.fullName}
        </Link>
      )}
      {company && (
        <Link
          href={`/dashboard/companies/${company.id}`}
          className="rounded-md border border-border/60 bg-card/40 px-2 py-1 hover:border-primary/40"
        >
          {company.name}
        </Link>
      )}
      {deal && (
        <Link
          href={`/dashboard/deals/${deal.id}`}
          className="rounded-md border border-primary/40 bg-primary/10 px-2 py-1 text-primary hover:border-primary"
        >
          $ {deal.name.split(" — ").pop()}
        </Link>
      )}
      {owner && (
        <span className="ml-auto rounded-md border border-border/60 bg-card/40 px-2 py-1 text-muted-foreground">
          Owner · {owner.name}
        </span>
      )}
    </div>
  );
}
