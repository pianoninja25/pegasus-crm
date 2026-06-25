"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Building2,
  ChevronDown,
  Filter,
  GripVertical,
  Plus,
  Search,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  compactNumber,
  formatCurrency,
  initials,
  relativeTime,
} from "@/lib/format";
import {
  companyMap,
  memberMap,
  teamMembers,
} from "@/features/common/seed";
import { useDealList, useMoveDealStage } from "@/features/deals/hooks";
import { DEAL_STAGES, DEAL_STAGE_META, type DealStage } from "@/features/common/types";

const KANBAN_STAGES: DealStage[] = [
  "lead",
  "qualified",
  "proposal",
  "negotiation",
  "closed_won",
];

export default function PipelinePage() {
  const { data: deals = [] } = useDealList();
  const move = useMoveDealStage();
  const [query, setQuery] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<Set<string>>(new Set());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverStage, setHoverStage] = useState<DealStage | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deals.filter((d) => {
      if (ownerFilter.size > 0 && !ownerFilter.has(d.ownerId)) return false;
      if (!q) return true;
      const company = companyMap[d.companyId]?.name?.toLowerCase() ?? "";
      return d.name.toLowerCase().includes(q) || company.includes(q);
    });
  }, [deals, query, ownerFilter]);

  const byStage = useMemo(() => {
    const map = new Map<DealStage, typeof deals>();
    for (const s of KANBAN_STAGES) map.set(s, []);
    for (const d of filtered) {
      if (!KANBAN_STAGES.includes(d.stage)) continue;
      map.get(d.stage)!.push(d);
    }
    for (const [, arr] of map) arr.sort((a, b) => b.value - a.value);
    return map;
  }, [filtered]);

  const handleDrop = (stage: DealStage) => {
    if (!draggingId) return;
    const deal = deals.find((d) => d.id === draggingId);
    if (deal && deal.stage !== stage) move.mutate({ id: draggingId, stage });
    setDraggingId(null);
    setHoverStage(null);
  };

  const totalOpen = filtered
    .filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost")
    .reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Pipeline
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Pipeline · {formatCurrency(totalOpen)} open
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag a card to move stages. Win-rate and forecasted revenue update instantly.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search deals or accounts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-64 pl-8 text-xs"
            />
          </div>
          <OwnerFilter selected={ownerFilter} onChange={setOwnerFilter} />
          <Button size="sm" className="h-9 gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New deal
          </Button>
        </div>
      </div>

      <ScrollArea className="-mx-2 pb-4">
        <div className="flex gap-4 px-2">
          {KANBAN_STAGES.map((stage) => {
            const meta = DEAL_STAGE_META[stage];
            const arr = byStage.get(stage) ?? [];
            const total = arr.reduce((s, d) => s + d.value, 0);
            const isHover = hoverStage === stage;
            return (
              <div
                key={stage}
                className={cn(
                  "flex w-72 shrink-0 flex-col rounded-2xl border border-border/60 bg-card/40 transition-colors",
                  isHover && "ring-2 ring-primary/40 border-primary/40",
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (hoverStage !== stage) setHoverStage(stage);
                }}
                onDragLeave={() => setHoverStage((c) => (c === stage ? null : c))}
                onDrop={() => handleDrop(stage)}
              >
                <div
                  className="flex items-center gap-2 rounded-t-2xl px-3 py-2.5"
                  style={{
                    backgroundImage: `linear-gradient(180deg, ${meta.color}26 0%, transparent 100%)`,
                  }}
                >
                  <span
                    className="inline-flex h-2 w-2 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {meta.label}
                  </span>
                  <Badge variant="outline" className="ml-auto h-5 text-[10px]">
                    {arr.length}
                  </Badge>
                </div>
                <div className="border-b border-border/60 px-3 pb-2 text-[10px] text-muted-foreground">
                  {formatCurrency(total)} · {Math.round(meta.probability * 100)}% probability
                </div>
                <div className="flex flex-col gap-2 px-2 py-2.5">
                  {arr.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 px-3 py-6 text-center">
                      <p className="text-[11px] text-muted-foreground">
                        Drop deals here.
                      </p>
                    </div>
                  ) : (
                    arr.map((d) => {
                      const owner = memberMap[d.ownerId];
                      const company = companyMap[d.companyId];
                      const isDragging = draggingId === d.id;
                      return (
                        <motion.div
                          key={d.id}
                          layout
                          draggable
                          onDragStart={() => setDraggingId(d.id)}
                          onDragEnd={() => {
                            setDraggingId(null);
                            setHoverStage(null);
                          }}
                          className={cn(
                            "group cursor-grab rounded-xl border border-border/60 bg-card/80 p-3 backdrop-blur transition-shadow hover:shadow-glow-sm active:cursor-grabbing",
                            isDragging && "opacity-50",
                          )}
                        >
                          <div className="mb-2 flex items-start gap-2">
                            <GripVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/dashboard/deals/${d.id}`}
                                className="block truncate text-xs font-semibold text-foreground hover:underline"
                              >
                                {d.name}
                              </Link>
                              <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Building2 className="h-3 w-3" />
                                <span className="truncate">{company?.name}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold tabular-nums text-foreground">
                              ${compactNumber(d.value)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {relativeTime(d.expectedCloseAt)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Avatar className="h-5 w-5 ring-1 ring-border/60">
                                  <AvatarFallback className="bg-primary/15 text-[9px] font-semibold text-primary">
                                    {initials(owner?.name, owner?.email)}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                {owner?.name ?? "Unassigned"}
                              </TooltipContent>
                            </Tooltip>
                            {d.tags[0] && (
                              <Badge variant="outline" className="h-4 text-[9px]">
                                {d.tags[0]}
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function OwnerFilter({
  selected,
  onChange,
}: {
  selected: Set<string>;
  onChange: (s: Set<string>) => void;
}) {
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          Owner
          {selected.size > 0 && (
            <Badge variant="accent" className="h-4 px-1.5 text-[9px]">
              {selected.size}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Owners
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {teamMembers.map((m) => (
          <DropdownMenuCheckboxItem
            key={m.id}
            checked={selected.has(m.id)}
            onCheckedChange={() => toggle(m.id)}
            className="text-xs"
          >
            <User className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> {m.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

void DEAL_STAGES;
