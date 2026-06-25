"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  Edit3,
  Plus,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { compactNumber, formatCurrency, formatDate, formatDateTime, initials, relativeTime } from "@/lib/format";
import { TimeStamp } from "@/components/common/TimeStamp";
import {
  ACTIVE_STAGES,
  ACTIVITY_META,
  DEAL_STAGES,
  DEAL_STAGE_META,
  type DealStage,
} from "@/features/common/types";
import { companyMap, contactMap, memberMap } from "@/features/common/seed";
import { useDeal, useMoveDealStage } from "@/features/deals/hooks";
import { useDealActivities } from "@/features/activities/hooks";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DealDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: deal, isLoading } = useDeal(id);
  const { data: activities = [] } = useDealActivities(id);
  const move = useMoveDealStage();

  const stageProgress = useMemo(() => {
    if (!deal) return 0;
    const idx = ACTIVE_STAGES.indexOf(deal.stage);
    if (deal.stage === "closed_won") return 100;
    if (deal.stage === "closed_lost") return 0;
    return Math.round(((idx + 1) / ACTIVE_STAGES.length) * 100);
  }, [deal]);

  if (isLoading) return <div className="text-xs text-muted-foreground">Loading…</div>;
  if (!deal) return notFound();

  const meta = DEAL_STAGE_META[deal.stage];
  const company = companyMap[deal.companyId];
  const owner = memberMap[deal.ownerId];
  const dealContacts = deal.contactIds
    .map((cid) => contactMap[cid])
    .filter((c): c is NonNullable<typeof c> => !!c);

  const forecasted = Math.round(deal.value * meta.probability);
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.dueAt).getTime() - new Date(a.dueAt).getTime(),
  );

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
          className="h-2 w-full"
          style={{ background: `linear-gradient(90deg, ${meta.color}, ${meta.color}66)` }}
        />
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Deal
              </p>
              <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                {deal.name}
              </h1>
              <Link
                href={`/dashboard/companies/${company?.id}`}
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Building2 className="h-3.5 w-3.5" />
                {company?.name}
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </Button>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Log activity
              </Button>
            </div>
          </div>

          {/* Stage tracker */}
          <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex items-center gap-2">
                <Select
                  value={deal.stage}
                  onValueChange={(v) => move.mutate({ id: deal.id, stage: v as DealStage })}
                >
                  <SelectTrigger className="h-9 w-44 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_STAGES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {DEAL_STAGE_META[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge
                  variant="outline"
                  style={{ borderColor: `${meta.color}66`, color: meta.color }}
                >
                  {Math.round(meta.probability * 100)}% probability
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Forecasted value
                </p>
                <p className="text-xl font-semibold tabular-nums">
                  {formatCurrency(forecasted)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    / {formatCurrency(deal.value)}
                  </span>
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-stretch gap-1.5">
              {ACTIVE_STAGES.map((s, i) => {
                const sMeta = DEAL_STAGE_META[s];
                const reached = ACTIVE_STAGES.indexOf(deal.stage) >= i ||
                  deal.stage === "closed_won";
                return (
                  <button
                    key={s}
                    onClick={() => move.mutate({ id: deal.id, stage: s })}
                    className={cn(
                      "group flex-1 rounded-md border px-2 py-1.5 text-left text-[10px] transition-all",
                      reached
                        ? "border-transparent shadow-glow-sm"
                        : "border-border/60 bg-background/40 text-muted-foreground hover:border-primary/40",
                    )}
                    style={
                      reached
                        ? {
                            backgroundImage: `linear-gradient(135deg, ${sMeta.color}33, ${sMeta.color}11)`,
                            color: sMeta.color,
                          }
                        : undefined
                    }
                  >
                    <p className="text-[9px] uppercase tracking-wider opacity-70">
                      Stage {i + 1}
                    </p>
                    <p className="text-[11px] font-semibold">{sMeta.label}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>{stageProgress}% through the funnel</span>
                <span>
                  Expected close · {formatDate(deal.expectedCloseAt, { withYear: true })}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${stageProgress}%`,
                    background: `linear-gradient(90deg, ${meta.color}, ${meta.color}99)`,
                  }}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <Cell icon={Briefcase} label="Value" value={formatCurrency(deal.value)} bold />
            <Cell icon={Sparkles} label="Forecasted" value={formatCurrency(forecasted)} />
            <Cell icon={CalendarClock} label="Expected close" value={relativeTime(deal.expectedCloseAt)} />
            <Cell icon={Tag} label="Source" value={deal.source} />
            <Cell icon={Users} label="Contacts" value={dealContacts.length.toString()} />
            <Cell icon={CalendarClock} label="Created" value={formatDate(deal.createdAt)} />
            <Cell icon={CalendarClock} label="Updated" value={relativeTime(deal.updatedAt)} />
            {deal.closedAt && (
              <Cell icon={CheckCircle2} label="Closed at" value={formatDate(deal.closedAt)} />
            )}
          </div>

          {deal.tags.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-1">
                {deal.tags.map((t) => (
                  <Badge key={t} variant="outline" className="h-5 text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
            </>
          )}

          <Separator />

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </p>
            <p className="mt-1.5 text-sm text-foreground/90">{deal.description}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm">
              Activity ({sortedActivities.length})
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
              <Plus className="h-3 w-3" /> Log
            </Button>
          </CardHeader>
          <CardContent>
            {sortedActivities.length === 0 ? (
              <p className="text-xs text-muted-foreground">No activity logged yet.</p>
            ) : (
              <ol className="relative space-y-3 border-l border-border/60 pl-5">
                {/* Stage history */}
                {[...deal.stageHistory].reverse().map((s, i) => {
                  const sMeta = DEAL_STAGE_META[s.stage];
                  const actor = memberMap[s.actorId];
                  return (
                    <li key={`${s.stage}-${i}`} className="relative">
                      <span
                        className="absolute -left-[26px] flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-background"
                        style={{ backgroundColor: `${sMeta.color}33`, color: sMeta.color }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                      </span>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-xs">
                        <p className="text-foreground">
                          Moved to <span className="font-medium" style={{ color: sMeta.color }}>{sMeta.label}</span>{" "}
                          by <span className="font-medium">{actor?.name ?? "Unknown"}</span>
                        </p>
                        <TimeStamp
                          iso={s.at}
                          className="mt-0.5 block text-[10px] text-muted-foreground"
                        />
                      </div>
                    </li>
                  );
                })}
                {/* Activities */}
                {sortedActivities.map((a) => {
                  const aMeta = ACTIVITY_META[a.kind];
                  return (
                    <li key={a.id} className="relative">
                      <span
                        className={cn(
                          "absolute -left-[26px] flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-background",
                          aMeta.tone,
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                      </span>
                      <div className="rounded-lg border border-border/60 bg-card/40 p-3 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-foreground">
                            {aMeta.label} · {a.subject}
                          </p>
                          <TimeStamp iso={a.dueAt} className="text-[10px] text-muted-foreground" />
                        </div>
                        {a.body && (
                          <p className="mt-1 text-muted-foreground">{a.body}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">People on this deal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {dealContacts.length === 0 ? (
                <p className="text-xs text-muted-foreground">No contacts linked.</p>
              ) : (
                dealContacts.map((c) => (
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
                      <p className="truncate text-[10px] text-muted-foreground">{c.title}</p>
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2.5">
                <Avatar className="h-9 w-9 ring-1 ring-primary/20">
                  <AvatarFallback className="bg-[image:var(--gradient-primary)] text-[11px] font-semibold text-primary-foreground">
                    {initials(owner?.name, owner?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{owner?.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{owner?.title}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{owner?.email}</p>
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-border/60 bg-card/40 p-3 text-[10px] text-muted-foreground">
                <p>
                  Last touch{" "}
                  <span className="text-foreground">
                    {formatDateTime(deal.updatedAt)}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Cell({
  icon: Icon,
  label,
  value,
  bold,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </p>
      <p className={cn("mt-0.5", bold ? "text-lg font-semibold" : "text-sm")}>
        {value}
      </p>
    </div>
  );
}

void compactNumber;
