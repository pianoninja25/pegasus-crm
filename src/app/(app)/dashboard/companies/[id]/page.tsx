"use client";

import { use } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarClock,
  Globe2,
  MapPin,
  Plus,
  Tag,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { compactNumber, formatCurrency, formatDate, initials } from "@/lib/format";
import { DEAL_STAGE_META } from "@/features/common/types";
import {
  useCompany,
  useCompanyContacts,
  useCompanyDeals,
} from "@/features/companies/hooks";
import { memberMap } from "@/features/common/seed";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CompanyDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: company, isLoading } = useCompany(id);
  const { data: contacts = [] } = useCompanyContacts(id);
  const { data: deals = [] } = useCompanyDeals(id);

  if (isLoading) return <div className="text-xs text-muted-foreground">Loading…</div>;
  if (!company) return notFound();

  const owner = memberMap[company.ownerId];
  const openValue = deals
    .filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost")
    .reduce((s, d) => s + d.value, 0);
  const wonValue = deals
    .filter((d) => d.stage === "closed_won")
    .reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.back()}
        className="-ml-2 h-8 gap-1.5"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Button>

      <Card className="overflow-hidden">
        <div
          className="h-24 w-full"
          style={{ background: "var(--gradient-aurora)" }}
        />
        <CardContent className="-mt-12 p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <span className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-2xl font-bold text-primary-foreground shadow-glow ring-4 ring-card">
                {company.name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()}
              </span>
              <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight">
                  {company.name}
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {company.industry} · Founded {company.founded}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {company.tags.map((t) => (
                    <Badge key={t} variant="outline" className="h-5 text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Globe2 className="h-3.5 w-3.5" /> Visit website
              </Button>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> New deal
              </Button>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Employees" value={company.size.toLocaleString()} icon={Users} />
            <Stat label="Annual revenue" value={`$${compactNumber(company.annualRevenue)}`} icon={Briefcase} />
            <Stat label="Contacts" value={contacts.length.toString()} icon={Building2} />
            <Stat label="Open pipeline" value={formatCurrency(openValue)} icon={Briefcase} tone="primary" />
            <Stat label="Closed-won" value={formatCurrency(wonValue)} icon={Briefcase} tone="success" />
          </div>

          <Separator className="my-5" />

          <div className="grid gap-3 text-xs sm:grid-cols-2">
            <InfoRow icon={Globe2} label="Domain" value={company.domain} href={`https://${company.domain}`} />
            <InfoRow icon={MapPin} label="HQ" value={`${company.city}, ${company.country}`} />
            <InfoRow icon={Tag} label="Source" value={company.source} />
            <InfoRow icon={CalendarClock} label="Added" value={formatDate(company.createdAt, { withYear: true })} />
          </div>

          <Separator className="my-5" />

          <p className="text-sm text-muted-foreground">{company.description}</p>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm">People ({contacts.length})</CardTitle>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
              <Plus className="h-3 w-3" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {contacts.length === 0 ? (
              <p className="text-xs text-muted-foreground">No contacts at this account.</p>
            ) : (
              contacts.slice(0, 12).map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/contacts/${c.id}`}
                  className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 transition hover:border-primary/40"
                >
                  <Avatar className="h-7 w-7 ring-1 ring-border/60">
                    <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                      {initials(c.fullName, c.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{c.fullName}</p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {c.title}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm">Deals ({deals.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {deals.length === 0 ? (
              <p className="text-xs text-muted-foreground">No deals at this account.</p>
            ) : (
              deals.map((d) => {
                const meta = DEAL_STAGE_META[d.stage];
                return (
                  <Link
                    key={d.id}
                    href={`/dashboard/deals/${d.id}`}
                    className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 transition hover:border-primary/40"
                  >
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold"
                      style={{ backgroundColor: `${meta.color}22`, color: meta.color }}
                    >
                      $
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{d.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {meta.label}
                      </p>
                    </div>
                    <span className="text-xs font-semibold tabular-nums">
                      ${compactNumber(d.value)}
                    </span>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Owner footer */}
      <Card>
        <CardContent className="flex items-center justify-between p-4 text-xs">
          <span className="text-muted-foreground">Account owner</span>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-muted text-[10px]">
                {initials(owner?.name, owner?.email)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{owner?.name}</span>
            <span className="text-muted-foreground">· {owner?.title}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  tone?: "primary" | "success";
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p
        className={`mt-1 text-base font-semibold ${
          tone === "primary"
            ? "text-primary"
            : tone === "success"
              ? "text-emerald-400"
              : "text-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Globe2;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="block truncate text-xs text-foreground hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="truncate text-xs text-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}
