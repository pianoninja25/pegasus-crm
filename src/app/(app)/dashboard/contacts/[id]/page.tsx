"use client";

import { use } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarClock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Star,
  StickyNote,
  Tag,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { compactNumber, formatDateTime, initials } from "@/lib/format";
import { TimeStamp } from "@/components/common/TimeStamp";
import { ACTIVITY_META, DEAL_STAGE_META } from "@/features/common/types";
import { useContact, useToggleStarContact } from "@/features/contacts/hooks";
import { useContactActivities } from "@/features/activities/hooks";
import { companyMap, dealMap, memberMap } from "@/features/common/seed";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ContactDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: contact, isLoading } = useContact(id);
  const { data: activities = [] } = useContactActivities(id);
  const toggleStar = useToggleStarContact();

  if (isLoading) {
    return <div className="text-xs text-muted-foreground">Loading…</div>;
  }
  if (!contact) return notFound();

  const company = contact.companyId ? companyMap[contact.companyId] : null;
  const owner = memberMap[contact.ownerId];
  const relatedDeals = Object.values(dealMap).filter((d) =>
    d.contactIds.includes(contact.id),
  );
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.dueAt).getTime() - new Date(a.dueAt).getTime(),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="-ml-2 h-8 gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_2.4fr]">
        {/* Identity card */}
        <Card className="overflow-hidden">
          <div
            className="h-20 w-full"
            style={{ background: "var(--gradient-primary)" }}
          />
          <CardContent className="-mt-10 space-y-4 p-5">
            <div className="flex items-start gap-3">
              <Avatar className="h-16 w-16 ring-4 ring-card">
                <AvatarFallback className="bg-primary text-base font-semibold text-primary-foreground">
                  {initials(contact.fullName, contact.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="truncate font-display text-xl font-semibold tracking-tight">
                    {contact.fullName}
                  </h1>
                  <button
                    type="button"
                    onClick={() => toggleStar.mutate(contact.id)}
                    aria-label={contact.starred ? "Unstar" : "Star"}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-foreground/5"
                  >
                    <Star
                      className={cn(
                        "h-3.5 w-3.5",
                        contact.starred
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground",
                      )}
                    />
                  </button>
                </div>
                <p className="truncate text-xs text-muted-foreground">{contact.title}</p>
                {company && (
                  <Link
                    href={`/dashboard/companies/${company.id}`}
                    className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-primary hover:underline"
                  >
                    <Building2 className="h-3 w-3" />
                    {company.name}
                  </Link>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2 text-xs">
              <Row icon={Mail} label="Email" value={contact.email} href={`mailto:${contact.email}`} />
              <Row icon={Phone} label="Phone" value={contact.phone} href={`tel:${contact.phone}`} />
              <Row icon={MapPin} label="Location" value={`${contact.city}, ${contact.country}`} />
              <Row icon={Briefcase} label="Department" value={contact.department} />
              <Row icon={Tag} label="Source" value={contact.source} />
              <Row icon={CalendarClock} label="Last touch" value={formatDateTime(contact.lastTouchedAt)} />
              <Row icon={CalendarClock} label="Added" value={formatDateTime(contact.createdAt)} />
            </div>

            {contact.tags.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-1">
                  {contact.tags.map((t) => (
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
                Owner
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-muted text-[10px]">
                    {initials(owner?.name, owner?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs">
                  <p className="font-medium">{owner?.name ?? "Unassigned"}</p>
                  <p className="text-[10px] text-muted-foreground">{owner?.title}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity + deals */}
        <div className="space-y-5">
          {contact.notes && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-3">
                <StickyNote className="h-3.5 w-3.5 text-amber-400" />
                <CardTitle className="text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-foreground/90">
                {contact.notes}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Deals ({relatedDeals.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {relatedDeals.length === 0 ? (
                <p className="text-xs text-muted-foreground">No deals linked.</p>
              ) : (
                relatedDeals.map((d) => {
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
                          {meta.label} · ${compactNumber(d.value)}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm">
                Activity ({sortedActivities.length})
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs">
                <MessageCircle className="h-3 w-3" />
                Log activity
              </Button>
            </CardHeader>
            <CardContent>
              {sortedActivities.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No activity logged yet.
                </p>
              ) : (
                <ol className="relative space-y-3 border-l border-border/60 pl-5">
                  {sortedActivities.slice(0, 12).map((a) => {
                    const meta = ACTIVITY_META[a.kind];
                    return (
                      <li key={a.id} className="relative">
                        <span
                          className={cn(
                            "absolute -left-[26px] flex h-4 w-4 items-center justify-center rounded-full ring-2 ring-background",
                            meta.tone,
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        </span>
                        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium text-foreground">
                              {meta.label} · {a.subject}
                            </p>
                            <TimeStamp
                              iso={a.dueAt}
                              className="text-[10px] text-muted-foreground"
                            />
                          </div>
                          {a.body && (
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {a.body}
                            </p>
                          )}
                          {a.completedAt && (
                            <Badge variant="success" className="mt-2 h-4 text-[9px]">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {href ? (
          <a href={href} className="block truncate text-xs text-foreground hover:underline">
            {value}
          </a>
        ) : (
          <p className="truncate text-xs text-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}
