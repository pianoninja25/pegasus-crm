"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  Briefcase,
  Building2,
  CalendarClock,
  Plus,
  Search,
  User,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { compactNumber, formatDate, initials, relativeTime } from "@/lib/format";
import {
  DEAL_STAGES,
  DEAL_STAGE_META,
  type DealStage,
} from "@/features/common/types";
import { companyMap, memberMap } from "@/features/common/seed";
import { useDealList } from "@/features/deals/hooks";

type SortKey = "value" | "expectedCloseAt" | "name" | "updatedAt";

export default function DealsListPage() {
  const { data: deals = [] } = useDealList();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<DealStage | "all">("all");
  const [sort, setSort] = useState<SortKey>("value");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = deals.filter((d) => {
      if (stage !== "all" && d.stage !== stage) return false;
      if (!q) return true;
      const company = companyMap[d.companyId]?.name?.toLowerCase() ?? "";
      return d.name.toLowerCase().includes(q) || company.includes(q);
    });
    list.sort((a, b) => {
      const mul = direction === "asc" ? 1 : -1;
      if (sort === "value") return (a.value - b.value) * mul;
      if (sort === "name") return a.name.localeCompare(b.name) * mul;
      const at = new Date(sort === "expectedCloseAt" ? a.expectedCloseAt : a.updatedAt).getTime();
      const bt = new Date(sort === "expectedCloseAt" ? b.expectedCloseAt : b.updatedAt).getTime();
      return (at - bt) * mul;
    });
    return list;
  }, [deals, query, stage, sort, direction]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Deals
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {filtered.length} deals
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every deal in the workspace. Switch to the{" "}
            <Link href="/dashboard/pipeline" className="text-primary hover:underline">
              pipeline view
            </Link>{" "}
            for the kanban.
          </p>
        </div>
        <Button size="sm" className="h-9 gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New deal
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 p-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by deal or company…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
          <Select value={stage} onValueChange={(v) => setStage(v as DealStage | "all")}>
            <SelectTrigger className="h-9 w-40 text-xs">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stages</SelectItem>
              {DEAL_STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {DEAL_STAGE_META[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-9 w-44 text-xs">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value">Sort: Value</SelectItem>
              <SelectItem value="expectedCloseAt">Sort: Close date</SelectItem>
              <SelectItem value="updatedAt">Sort: Updated</SelectItem>
              <SelectItem value="name">Sort: Name</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => setDirection((d) => (d === "asc" ? "desc" : "asc"))}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            {direction === "asc" ? "Asc" : "Desc"}
          </Button>
        </div>

        <div className="hidden grid-cols-[2.4fr_1.6fr_1fr_1fr_1fr_0.8fr] gap-3 border-b border-border/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground lg:grid">
          <div>Deal</div>
          <div>Company</div>
          <div>Stage</div>
          <div>Value</div>
          <div>Close</div>
          <div>Owner</div>
        </div>
        <div className="divide-y divide-border/60">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-xs text-muted-foreground">
              No deals match.
            </div>
          ) : (
            filtered.map((d) => {
              const company = companyMap[d.companyId];
              const owner = memberMap[d.ownerId];
              const meta = DEAL_STAGE_META[d.stage];
              return (
                <Link
                  key={d.id}
                  href={`/dashboard/deals/${d.id}`}
                  className="grid grid-cols-1 gap-2 px-4 py-3 text-xs transition-colors hover:bg-foreground/5 lg:grid-cols-[2.4fr_1.6fr_1fr_1fr_1fr_0.8fr] lg:items-center"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
                      style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
                    >
                      <Briefcase className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{d.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {d.tags[0] ?? d.source}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-foreground/90">
                    <Building2 className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="truncate">{company?.name}</span>
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="h-5 text-[10px]"
                      style={{ borderColor: `${meta.color}66`, color: meta.color }}
                    >
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="font-semibold tabular-nums">
                    ${compactNumber(d.value)}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CalendarClock className="h-3 w-3" />
                    {d.closedAt
                      ? formatDate(d.closedAt)
                      : relativeTime(d.expectedCloseAt)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5 ring-1 ring-border/60">
                      <AvatarFallback className="bg-muted text-[9px] font-medium">
                        {initials(owner?.name, owner?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden truncate text-muted-foreground xl:inline">
                      {owner?.name?.split(" ")[0]}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}

void User;
