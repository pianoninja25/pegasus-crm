"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Star,
  Tag,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { initials, relativeTime } from "@/lib/format";
import { companyMap, memberMap } from "@/features/common/seed";
import {
  contactKeys,
  useContactList,
  useToggleStarContact,
} from "@/features/contacts/hooks";

const TAG_QUICK_FILTERS = ["Champion", "Hot", "Replied", "Decision-maker"];

export default function ContactsPage() {
  const { data: contacts = [], isLoading } = useContactList();
  const toggleStar = useToggleStarContact();
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [starredOnly, setStarredOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (starredOnly && !c.starred) return false;
      if (tag && !c.tags.includes(tag)) return false;
      if (!q) return true;
      const company = companyMap[c.companyId ?? ""]?.name?.toLowerCase() ?? "";
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        company.includes(q)
      );
    });
  }, [contacts, query, tag, starredOnly]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Contacts
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {contacts.length.toLocaleString()} people
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real humans, not lead-gen filler. Every one merged across email,
            calls and replies.
          </p>
        </div>
        <Button size="sm" className="h-9 gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New contact
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, title, account…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <Button
              variant={starredOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setStarredOnly((v) => !v)}
              className="h-8 gap-1.5"
            >
              <Star className={cn("h-3.5 w-3.5", starredOnly && "fill-current")} />
              Starred
            </Button>
            {TAG_QUICK_FILTERS.map((t) => (
              <Button
                key={t}
                variant={tag === t ? "default" : "outline"}
                size="sm"
                onClick={() => setTag((cur) => (cur === t ? null : t))}
                className="h-8 gap-1.5 text-[11px]"
              >
                <Tag className="h-3 w-3" />
                {t}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No contacts match.
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {filtered.map((c) => {
              const company = c.companyId ? companyMap[c.companyId] : null;
              const owner = memberMap[c.ownerId];
              return (
                <div
                  key={c.id}
                  className="group grid grid-cols-1 items-center gap-3 px-4 py-3 transition-colors hover:bg-foreground/5 lg:grid-cols-[2fr_2fr_1.4fr_1.4fr_auto]"
                >
                  <Link
                    href={`/dashboard/contacts/${c.id}`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <Avatar className="h-8 w-8 ring-1 ring-border/60">
                      <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                        {initials(c.fullName, c.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {c.fullName}
                        </p>
                        {c.starred && (
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        )}
                      </div>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {c.title}
                      </p>
                    </div>
                  </Link>

                  <div className="hidden min-w-0 lg:block">
                    <a
                      href={`mailto:${c.email}`}
                      className="flex items-center gap-1.5 truncate text-xs text-foreground/80 hover:text-foreground"
                    >
                      <Mail className="h-3 w-3 shrink-0 text-muted-foreground" />
                      {c.email}
                    </a>
                    <p className="flex items-center gap-1.5 truncate text-[10px] text-muted-foreground">
                      <Phone className="h-3 w-3 shrink-0" />
                      {c.phone}
                    </p>
                  </div>

                  <div className="hidden min-w-0 items-center gap-1.5 text-xs lg:flex">
                    <Building2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                    {company ? (
                      <Link
                        href={`/dashboard/companies/${company.id}`}
                        className="truncate text-foreground/90 hover:text-foreground hover:underline"
                      >
                        {company.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Unaffiliated</span>
                    )}
                  </div>

                  <div className="hidden min-w-0 items-center gap-1.5 text-[10px] text-muted-foreground lg:flex">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {c.city}, {c.country}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 lg:justify-end">
                    <div className="flex flex-wrap items-center gap-1">
                      {c.tags.slice(0, 2).map((t) => (
                        <Badge key={t} variant="outline" className="h-4 text-[9px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="h-5 w-5 ring-1 ring-border/60">
                          <AvatarFallback className="bg-muted text-[9px] font-medium">
                            {initials(owner?.name, owner?.email)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        Owner: {owner?.name ?? "Unassigned"}
                      </TooltipContent>
                    </Tooltip>
                    <span className="hidden text-[10px] text-muted-foreground sm:inline">
                      {relativeTime(c.lastTouchedAt)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 transition group-hover:opacity-100"
                      onClick={() => toggleStar.mutate(c.id)}
                      aria-label={c.starred ? "Unstar" : "Star"}
                    >
                      <Star
                        className={cn(
                          "h-3.5 w-3.5",
                          c.starred ? "fill-amber-400 text-amber-400" : "text-muted-foreground",
                        )}
                      />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

void contactKeys;
