"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  Globe2,
  MapPin,
  Plus,
  Search,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { compactNumber, initials } from "@/lib/format";
import { useCompanyList } from "@/features/companies/hooks";
import { contacts as allContacts, deals as allDeals, memberMap } from "@/features/common/seed";

const INDUSTRY_QUICK = ["SaaS", "Fintech", "Healthcare", "Logistics", "AI / ML"];

export default function CompaniesPage() {
  const { data: companies = [] } = useCompanyList();
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((c) => {
      if (industry && c.industry !== industry) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    });
  }, [companies, query, industry]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Companies
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            {companies.length} accounts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every company in the book — sized, located and shaped by signals.
          </p>
        </div>
        <Button size="sm" className="h-9 gap-1.5">
          <Plus className="h-3.5 w-3.5" /> New company
        </Button>
      </div>

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, industry, city…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-8 text-xs"
            />
          </div>
          {INDUSTRY_QUICK.map((i) => (
            <Button
              key={i}
              variant={industry === i ? "default" : "outline"}
              size="sm"
              onClick={() => setIndustry((cur) => (cur === i ? null : i))}
              className="h-8 text-[11px]"
            >
              {i}
            </Button>
          ))}
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => {
          const contactCount = allContacts.filter((p) => p.companyId === c.id).length;
          const openDeals = allDeals.filter(
            (d) => d.companyId === c.id && d.stage !== "closed_won" && d.stage !== "closed_lost",
          );
          const openValue = openDeals.reduce((s, d) => s + d.value, 0);
          const owner = memberMap[c.ownerId];
          return (
            <Link
              key={c.id}
              href={`/dashboard/companies/${c.id}`}
              className="group rounded-2xl border border-border/60 bg-card/60 p-4 transition hover:border-primary/40 hover:shadow-glow-sm"
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-xl",
                    "bg-[image:var(--gradient-primary)] text-sm font-bold text-primary-foreground shadow-glow-sm",
                  )}
                >
                  {c.name
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-sm font-semibold tracking-tight">
                    {c.name}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {c.industry}
                  </p>
                  <a
                    href={`https://${c.domain}`}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-primary hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Globe2 className="h-3 w-3" />
                    {c.domain}
                  </a>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
                <Stat label="Employees" value={c.size.toLocaleString()} icon={Users} />
                <Stat label="Contacts" value={contactCount.toString()} icon={Building2} />
                <Stat label="Open" value={`$${compactNumber(openValue)}`} icon={Briefcase} />
              </div>

              <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {c.city}, {c.country}
                </span>
                <span className="flex items-center gap-1.5">
                  <Avatar className="h-4 w-4 ring-1 ring-border/60">
                    <AvatarFallback className="bg-muted text-[8px]">
                      {initials(owner?.name, owner?.email)}
                    </AvatarFallback>
                  </Avatar>
                  {owner?.name?.split(" ")[0]}
                </span>
              </div>
              {c.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {c.tags.slice(0, 3).map((t) => (
                    <Badge key={t} variant="outline" className="h-4 text-[9px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40 px-2 py-1.5">
      <div className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        <span className="uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-0.5 text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}
