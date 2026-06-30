"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  Activity,
  ArrowLeft,
  Camera,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  DollarSign,
  FileText,
  Image as ImageIcon,
  MapPin,
  Phone,
  PlayCircle,
  ScrollText,
  Signature,
  Snowflake,
  Sparkles,
  Star,
  User,
  Wrench,
} from "lucide-react";

import { InsightCard } from "@/components/common/InsightCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useT } from "@/features/locale/hooks";
import {
  useSetVisitStatus,
  useToggleChecklistItem,
  useVisit,
} from "@/features/service/hooks";
import {
  customerMap,
  unitMap,
  userMap,
} from "@/features/service/seed";
import {
  CONTRACT_TYPE_META,
  UNIT_TYPE_META,
  VISIT_STATUS_META,
  type VisitStatus,
} from "@/features/service/types";
import {
  engineerAvatarStyle,
  formatCurrency,
  formatDate,
  formatDateTime,
  initials,
  relativeTime,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StatTone } from "@/components/common/StatTile";

/* ─────────────────────────── Constants ────────────────────────────────── */

/** Maps each visit status to the tone driving the hero icon + status insight. */
const STATUS_TONE: Record<VisitStatus, StatTone> = {
  scheduled: "primary",
  in_progress: "warn",
  completed: "success",
  overdue: "destructive",
  cancelled: "muted",
};

/* ───────────────────────────── Page ───────────────────────────────────── */

export default function WorkOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useT();
  const visitQ = useVisit(params.id);
  const toggle = useToggleChecklistItem();
  const setStatus = useSetVisitStatus();
  const visit = visitQ.data ?? null;

  /* ── Derived insights (must be declared before any early returns) ── */
  const checkedCount = useMemo(
    () => visit?.checklist.filter((c) => c.checked).length ?? 0,
    [visit],
  );
  const checklistTotal = visit?.checklist.length ?? 0;
  const progressPct =
    checklistTotal > 0 ? Math.round((checkedCount / checklistTotal) * 100) : 0;

  /* ── Empty / loading states ──────────────────────────────────────── */
  if (!visitQ.isLoading && !visit) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm" className="-ml-2 h-7 gap-1.5">
          <Link href="/dashboard/work-orders">
            <ArrowLeft className="h-3.5 w-3.5" /> {t("workOrders.title")}
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            {t("workOrders.detail.notFound")}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="text-sm text-muted-foreground">
        {t("workOrders.detail.loading")}
      </div>
    );
  }

  const customer = customerMap[visit.customerId];
  const engineer = userMap[visit.engineerId];
  const statusMeta = VISIT_STATUS_META[visit.status];
  const typeMeta = CONTRACT_TYPE_META[visit.type];
  const statusTone = STATUS_TONE[visit.status];

  const canStart = visit.status === "scheduled" || visit.status === "overdue";
  const canComplete =
    visit.status === "in_progress" && checkedCount === checklistTotal;
  const canSign =
    visit.status === "in_progress" || visit.status === "completed";

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2 h-7 gap-1.5">
        <Link href="/dashboard/work-orders">
          <ArrowLeft className="h-3.5 w-3.5" /> {t("workOrders.title")}
        </Link>
      </Button>

      {/* ── Hero card: status icon + number + chips + actions on one strip ── */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <span
            className={cn(
              "inline-flex h-12 w-12 items-center justify-center rounded-md ring-1",
              statusTone === "primary" &&
                "bg-primary/15 text-primary ring-primary/30",
              statusTone === "warn" &&
                "bg-amber-500/15 text-amber-600 ring-amber-500/30 dark:text-amber-300",
              statusTone === "success" &&
                "bg-emerald-500/15 text-emerald-600 ring-emerald-500/30 dark:text-emerald-300",
              statusTone === "destructive" &&
                "bg-rose-500/15 text-rose-600 ring-rose-500/30 dark:text-rose-300",
              statusTone === "muted" &&
                "bg-muted text-muted-foreground ring-border/60",
            )}
          >
            <Wrench className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold">{visit.number}</h1>
              <StatusBadge
                label={statusMeta.label}
                tone={statusMeta.tone}
                color={statusMeta.color}
              />
              <StatusBadge label={typeMeta.label} tone={typeMeta.tone} />
              {visit.contractId && (
                <Badge
                  variant="outline"
                  className="h-5 gap-1 border-emerald-500/40 text-[10px] text-emerald-700 dark:text-emerald-300"
                >
                  <ScrollText className="h-3 w-3" />
                  {t("workOrders.source.contract")}
                </Badge>
              )}
              {visit.quotationId && (
                <Badge
                  variant="outline"
                  className="h-5 gap-1 border-violet-500/40 text-[10px] text-violet-700 dark:text-violet-300"
                >
                  <FileText className="h-3 w-3" />
                  {t("workOrders.source.quotation")}
                </Badge>
              )}
              {visit.customerSigned && (
                <Badge
                  variant="outline"
                  className="h-5 gap-1 border-sky-500/40 text-[10px] text-sky-700 dark:text-sky-300"
                >
                  <Signature className="h-3 w-3" />
                  {t("workOrders.detail.signedBadge")}
                </Badge>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {customer?.name}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="h-3 w-3" />
                {formatDateTime(visit.scheduledAt, { withYear: true })}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {customer?.address}, {customer?.city}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canStart && (
              <Button
                size="sm"
                className="h-8 gap-1.5"
                onClick={() =>
                  setStatus.mutate({ id: visit.id, status: "in_progress" })
                }
              >
                <PlayCircle className="h-3.5 w-3.5" />
                {t("workOrders.detail.start")}
              </Button>
            )}
            {canComplete && (
              <Button
                size="sm"
                className="h-8 gap-1.5"
                onClick={() =>
                  setStatus.mutate({ id: visit.id, status: "completed" })
                }
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("workOrders.detail.markComplete")}
              </Button>
            )}
            {visit.status === "in_progress" && !canComplete && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5"
                disabled
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("workOrders.detail.completeChecklistFirst")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Insight strip ─────────────────────────────────────────────── */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <InsightCard
          variant="compact"
          icon={Activity}
          tone={statusTone}
          label={t("workOrders.column.status")}
          value={statusMeta.label}
          caption={typeMeta.label}
        />
        <InsightCard
          variant="compact"
          icon={CheckCircle2}
          tone={progressPct === 100 ? "success" : "accent"}
          label={t("workOrders.detail.tab.checklist")}
          value={`${checkedCount}/${checklistTotal}`}
          caption={
            progressPct === 100
              ? t("workOrders.detail.checklistAllDone")
              : `${checklistTotal - checkedCount} ${t(
                  "workOrders.detail.checklistRemaining",
                )}`
          }
        />
        <InsightCard
          variant="compact"
          icon={Clock}
          tone="muted"
          label={t("workOrders.column.duration")}
          value={
            visit.durationMinutes
              ? `${Math.floor(visit.durationMinutes / 60)}h ${
                  visit.durationMinutes % 60
                }m`
              : "—"
          }
          caption={
            visit.durationMinutes
              ? formatDate(visit.completedAt ?? visit.scheduledAt)
              : t("workOrders.duration.notLogged")
          }
        />
        <InsightCard
          variant="compact"
          icon={Star}
          tone={visit.rating ? "warn" : "muted"}
          label={t("engineers.column.rating")}
          value={visit.rating ? `${visit.rating.toFixed(1)}/5` : "—"}
          caption={
            visit.rating
              ? t("workOrders.detail.ratingReviewed")
              : t("workOrders.detail.ratingNone")
          }
        />
        <InsightCard
          variant="compact"
          icon={CalendarClock}
          tone={statusTone === "destructive" ? "destructive" : "primary"}
          label={t("workOrders.column.scheduled")}
          value={formatDate(visit.scheduledAt)}
          caption={relativeTime(visit.scheduledAt)}
        />
        <InsightCard
          variant="compact"
          icon={DollarSign}
          tone={visit.revenue > 0 ? "primary" : "muted"}
          label={t("workOrders.column.revenue")}
          value={visit.revenue > 0 ? formatCurrency(visit.revenue) : "—"}
          caption={
            visit.revenue > 0
              ? t("workOrders.detail.revenueLogged")
              : t("workOrders.detail.revenueUnbilled")
          }
        />
      </div>

      {/* ── Main grid: profile rail + activity tabs ──────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Profile rail (compact) */}
        <Card className="h-fit">
          <CardContent className="space-y-3 p-3 text-xs">
            {/* Customer */}
            {customer && (
              <Link
                href={`/dashboard/customers/${customer.id}`}
                className="flex items-center gap-2 transition hover:text-primary"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                    {initials(customer.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {t("workOrders.detail.rail.customer")}
                  </p>
                  <p className="truncate font-medium text-foreground">
                    {customer.name}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {customer.contactPerson}
                  </p>
                </div>
              </Link>
            )}

            {/* Engineer */}
            <div className="flex items-center gap-2 border-t border-border/40 pt-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className="text-[10px] font-semibold"
                  style={engineerAvatarStyle(engineer?.hue)}
                >
                  {initials(engineer?.name ?? "?")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("workOrders.detail.rail.engineer")}
                </p>
                <p className="truncate font-medium text-foreground">
                  {engineer?.name}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {engineer?.title}
                </p>
              </div>
            </div>

            {/* Contact + Location */}
            {customer && (
              <div className="space-y-1 border-t border-border/40 pt-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("workOrders.detail.rail.contact")}
                </p>
                <p className="flex items-center gap-1.5 text-[11px] text-foreground/80">
                  <Phone className="h-3 w-3 text-muted-foreground" />
                  {customer.phone}
                </p>
                <p className="flex items-start gap-1.5 text-[11px] text-foreground/80">
                  <MapPin className="mt-0.5 h-3 w-3 text-muted-foreground" />
                  <span>
                    {customer.address}, {customer.city}, {customer.country}
                  </span>
                </p>
              </div>
            )}

            {/* Notes */}
            {visit.notes.trim() && (
              <div className="space-y-1 border-t border-border/40 pt-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("workOrders.detail.rail.notes")}
                </p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {visit.notes}
                </p>
              </div>
            )}

            {/* Linked sources */}
            {(visit.contractId || visit.quotationId) && (
              <div className="space-y-1 border-t border-border/40 pt-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("workOrders.detail.rail.linked")}
                </p>
                {visit.contractId && (
                  <Link
                    href={`/dashboard/contracts/${visit.contractId}`}
                    className="flex items-center gap-1.5 text-[11px] text-foreground/80 transition hover:text-primary"
                  >
                    <ScrollText className="h-3 w-3 text-emerald-500" />
                    {t("workOrders.detail.rail.linkedContract")}
                  </Link>
                )}
                {visit.quotationId && (
                  <Link
                    href={`/dashboard/quotations/${visit.quotationId}`}
                    className="flex items-center gap-1.5 text-[11px] text-foreground/80 transition hover:text-primary"
                  >
                    <FileText className="h-3 w-3 text-violet-500" />
                    {t("workOrders.detail.rail.linkedQuotation")}
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity tabs */}
        <Tabs defaultValue="checklist" className="space-y-3">
          <TabsList className="h-9">
            <TabsTrigger value="checklist" className="text-xs">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {t("workOrders.detail.tab.checklist")} · {checkedCount}/
              {checklistTotal}
            </TabsTrigger>
            <TabsTrigger value="units" className="text-xs">
              <Snowflake className="mr-1 h-3 w-3" />
              {t("workOrders.detail.tab.units")} · {visit.unitIds.length}
            </TabsTrigger>
            <TabsTrigger value="documentation" className="text-xs">
              <Camera className="mr-1 h-3 w-3" />
              {t("workOrders.detail.tab.documentation")}
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">
              <ClipboardList className="mr-1 h-3 w-3" />
              {t("workOrders.detail.tab.timeline")}
            </TabsTrigger>
          </TabsList>

          {/* ── Checklist ─────────────────────────────────────────── */}
          <TabsContent value="checklist" className="m-0">
            <Card>
              <CardContent className="space-y-2 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    {t("workOrders.detail.checklist.hint")}
                  </p>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      progressPct === 100
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
                        : "bg-primary/15 text-primary",
                    )}
                  >
                    {progressPct}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      progressPct === 100
                        ? "bg-emerald-500"
                        : "bg-[image:var(--gradient-primary)]",
                    )}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {visit.checklist.length === 0 ? (
                  <EmptyRow text={t("workOrders.detail.checklist.empty")} />
                ) : (
                  <ul className="space-y-1">
                    {visit.checklist.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-card/40 p-2.5"
                      >
                        <Checkbox
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={() =>
                            toggle.mutate({
                              visitId: visit.id,
                              itemId: item.id,
                            })
                          }
                          disabled={visit.status === "completed"}
                        />
                        <label
                          htmlFor={item.id}
                          className={cn(
                            "flex-1 cursor-pointer text-xs",
                            item.checked &&
                              "text-muted-foreground line-through",
                          )}
                        >
                          {item.label}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Units serviced ────────────────────────────────────── */}
          <TabsContent value="units" className="m-0 space-y-1.5">
            {visit.unitIds.length === 0 ? (
              <EmptyRow text={t("workOrders.detail.units.empty")} />
            ) : (
              visit.unitIds.map((id) => {
                const u = unitMap[id];
                if (!u) return null;
                return (
                  <Card key={id}>
                    <CardContent className="flex flex-wrap items-center gap-3 p-2.5">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                        <Snowflake className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold">
                          {u.brand} {u.model}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {UNIT_TYPE_META[u.type].label} · {u.location} ·{" "}
                          {u.btu.toLocaleString()} BTU
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* ── Documentation ─────────────────────────────────────── */}
          <TabsContent value="documentation" className="m-0">
            <Card>
              <CardContent className="space-y-3 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground">
                    {t("workOrders.detail.docs.hint")}
                  </p>
                  <Button variant="outline" size="sm" className="h-7 gap-1.5">
                    <Camera className="h-3 w-3" />
                    {t("workOrders.detail.docs.uploadPhoto")}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => {
                    const has = i < visit.photos.length;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "aspect-square overflow-hidden rounded-lg border border-border/60",
                          has
                            ? "bg-gradient-to-br from-primary/20 via-accent/20 to-emerald-500/20"
                            : "bg-card/40",
                        )}
                      >
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon
                            className={cn(
                              "h-5 w-5",
                              has
                                ? "text-foreground/70"
                                : "text-muted-foreground/60",
                            )}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between border-t border-border/40 pt-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Signature className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {t("workOrders.detail.docs.signatureLabel")}:{" "}
                      {visit.customerSigned ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-300">
                          {t("workOrders.detail.docs.signatureCaptured")}{" "}
                          {customer?.contactPerson}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {t("workOrders.detail.docs.signatureMissing")}
                        </span>
                      )}
                    </span>
                  </div>
                  {canSign && !visit.customerSigned && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1.5"
                    >
                      <Signature className="h-3 w-3" />
                      {t("workOrders.detail.docs.captureSignature")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Timeline ──────────────────────────────────────────── */}
          <TabsContent value="timeline" className="m-0">
            <Card>
              <CardContent className="p-3">
                <ol className="relative space-y-2.5 border-l border-border/60 pl-5">
                  <TimelineLi
                    color={statusMeta.color}
                    title={t("workOrders.detail.timeline.scheduled")}
                    when={visit.scheduledAt}
                  />
                  {visit.startedAt && (
                    <TimelineLi
                      color="#fbbf24"
                      title={`${t("workOrders.detail.timeline.started")} · ${engineer?.name}`}
                      when={visit.startedAt}
                    />
                  )}
                  {visit.completedAt && (
                    <TimelineLi
                      color="#34d399"
                      title={t("workOrders.detail.timeline.completed")}
                      when={visit.completedAt}
                    />
                  )}
                  <TimelineLi
                    color="#94a3b8"
                    title={`${t("workOrders.detail.timeline.now")} · ${statusMeta.label}`}
                    when={new Date().toISOString()}
                  />
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ───────────────────────── Sub-components ─────────────────────────────── */

function TimelineLi({
  color,
  title,
  when,
}: {
  color: string;
  title: string;
  when: string;
}) {
  return (
    <li className="relative">
      <span
        className="absolute -left-[28px] top-1 inline-flex h-2.5 w-2.5 rounded-full ring-4 ring-background"
        style={{ backgroundColor: color }}
      />
      <p className="text-xs font-medium text-foreground">{title}</p>
      <p className="text-[10px] text-muted-foreground">
        {relativeTime(when)} · {formatDate(when, { withYear: true })}
      </p>
    </li>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
        <Sparkles className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">{text}</p>
      </CardContent>
    </Card>
  );
}
