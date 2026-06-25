"use client";

import { useMemo, useState } from "react";
import {
  Flame,
  MapPin,
  Plus,
  Search,
  Target,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { initials, relativeTime } from "@/lib/format";
import { LEAD_STATUS_META, type LeadStatus } from "@/features/common/types";
import { memberMap } from "@/features/common/seed";
import { useLeadList } from "@/features/leads/hooks";

const STATUSES: (LeadStatus | "all")[] = [
  "all",
  "new",
  "working",
  "nurture",
  "converted",
  "disqualified",
];

export default function LeadsPage() {
  const { data: leads = [] } = useLeadList();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads
      .filter((l) => {
        if (status !== "all" && l.status !== status) return false;
        if (!q) return true;
        return (
          l.fullName.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.score - a.score);
  }, [leads, query, status]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Leads
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {leads.length} leads
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Inbound and outbound, scored by fit and engagement. Convert the hot
            ones, nurture the rest.
          </p>
        </div>
        <Button size="sm" className="h-9 gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New lead
        </Button>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, company…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-1">
            {STATUSES.map((s) => (
              <Button
                key={s}
                variant={status === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus(s)}
                className="h-8 capitalize"
              >
                {s === "all" ? "All" : LEAD_STATUS_META[s as LeadStatus].label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((l) => {
          const meta = LEAD_STATUS_META[l.status];
          const owner = memberMap[l.ownerId];
          return (
            <Card
              key={l.id}
              className="group overflow-hidden border-border/60 bg-card/60 p-4 transition hover:border-primary/40 hover:shadow-glow-sm"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 ring-1 ring-border/60">
                  <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                    {initials(l.fullName, l.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-sm">{l.fullName}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {l.title} · {l.company}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {l.email}
                  </p>
                </div>
                <ScoreBadge score={l.score} />
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                <Badge variant="outline" className={cn("h-5 text-[10px]", meta.tone)}>
                  <Target className="mr-1 h-3 w-3" />
                  {meta.label}
                </Badge>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {l.city}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Source · {l.source}</span>
                <span>Last touch · {relativeTime(l.lastContactedAt)}</span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Avatar className="h-4 w-4 ring-1 ring-border/60">
                    <AvatarFallback className="bg-muted text-[8px]">
                      {initials(owner?.name, owner?.email)}
                    </AvatarFallback>
                  </Avatar>
                  {owner?.name}
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[11px]">
                  Convert →
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "text-rose-300 border-rose-500/40 bg-rose-500/15"
      : score >= 60
        ? "text-amber-300 border-amber-500/40 bg-amber-500/15"
        : score >= 40
          ? "text-sky-300 border-sky-500/40 bg-sky-500/15"
          : "text-slate-300 border-slate-500/40 bg-slate-500/15";
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-md border px-2 py-1 text-center",
        tone,
      )}
      title="Predictive score (0–100)"
    >
      <span className="text-xs font-bold leading-none">{score}</span>
      <span className="mt-0.5 flex items-center gap-0.5 text-[8px] uppercase tracking-wider opacity-80">
        <Flame className="h-2.5 w-2.5" /> Score
      </span>
    </div>
  );
}
