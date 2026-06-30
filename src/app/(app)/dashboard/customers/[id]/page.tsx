"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  Clock,
  FileText,
  Mail,
  MapPin,
  Phone,
  Plus,
  Receipt,
  ScrollText,
  Snowflake,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";

import { InsightCard } from "@/components/common/InsightCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useCustomer } from "@/features/service/hooks";
import {
  contractsByCustomer,
  customerLifecycle,
  invoices,
  lifecycleByCustomer,
  quotations,
  quotationTotal,
  unitsByCustomer,
  userMap,
  visitsByCustomer,
} from "@/features/service/seed";
import {
  CONTRACT_STATUS_META,
  CONTRACT_TYPE_META,
  CUSTOMER_LIFECYCLE_META,
  CUSTOMER_TYPE_META,
  FREQUENCY_META,
  INVOICE_STATUS_META,
  QUOTATION_CATEGORY_META,
  QUOTATION_STATUS_META,
  UNIT_CONDITION_META,
  UNIT_TYPE_META,
  VISIT_STATUS_META,
} from "@/features/service/types";
import {
  engineerAvatarStyle,
  formatCurrency,
  formatDate,
  initials,
  relativeTime,
} from "@/lib/format";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const customerQ = useCustomer(params.id);
  const customer = customerQ.data ?? null;

  const units = useMemo(
    () => (customer ? unitsByCustomer[customer.id] ?? [] : []),
    [customer],
  );
  const contracts = useMemo(
    () => (customer ? contractsByCustomer[customer.id] ?? [] : []),
    [customer],
  );
  const visits = useMemo(
    () => (customer ? visitsByCustomer[customer.id] ?? [] : []),
    [customer],
  );
  const cQuotations = useMemo(
    () =>
      customer ? quotations.filter((q) => q.customerId === customer.id) : [],
    [customer],
  );
  const cInvoices = useMemo(
    () =>
      customer ? invoices.filter((i) => i.customerId === customer.id) : [],
    [customer],
  );

  /* ── Derived insights ─────────────────────────────────────────────── */
  const outstanding = useMemo(
    () =>
      cInvoices
        .filter(
          (i) =>
            i.status === "sent" || i.status === "overdue" || i.status === "partially_paid",
        )
        .reduce(
          (sum, i) =>
            sum + i.amount * (i.status === "partially_paid" ? 0.5 : 1),
          0,
        ),
    [cInvoices],
  );

  const now = Date.now();
  const sortedVisits = useMemo(
    () =>
      [...visits].sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      ),
    [visits],
  );
  const lastCompletedVisit = useMemo(
    () =>
      [...sortedVisits]
        .reverse()
        .find((v) => v.status === "completed" && new Date(v.scheduledAt).getTime() <= now),
    [sortedVisits, now],
  );
  const nextScheduledVisit = useMemo(
    () =>
      sortedVisits.find(
        (v) =>
          v.status !== "completed" &&
          v.status !== "cancelled" &&
          new Date(v.scheduledAt).getTime() >= now,
      ),
    [sortedVisits, now],
  );
  const activeContract = useMemo(
    () =>
      [...contracts]
        .filter((c) => c.status === "active")
        .sort(
          (a, b) =>
            new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
        )[0] ?? null,
    [contracts],
  );
  const openQuotations = cQuotations.filter(
    (q) => q.status === "draft" || q.status === "sent",
  );
  const approvedQuotations = cQuotations.filter((q) => q.status === "approved");

  if (!customerQ.isLoading && !customer) {
    return (
      <div className="space-y-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/customers">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to customers
          </Link>
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Customer not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  const owner = userMap[customer.ownerId];
  const cTypeMeta = CUSTOMER_TYPE_META[customer.type];
  const stage =
    lifecycleByCustomer[customer.id] ?? customerLifecycle(customer);
  const stageMeta = CUSTOMER_LIFECYCLE_META[stage];

  /* ── Timeline ──────────────────────────────────────────────────────── */
  type TimelineItem = {
    id: string;
    when: string;
    icon: typeof Wrench;
    title: string;
    body: string;
    href?: string;
  };
  const timeline: TimelineItem[] = [
    ...visits.map(
      (v): TimelineItem => ({
        id: v.id,
        when: v.scheduledAt,
        icon: Wrench,
        title: `${VISIT_STATUS_META[v.status].label} — ${
          CONTRACT_TYPE_META[v.type].label
        }`,
        body: `${v.number} · ${userMap[v.engineerId]?.name ?? "Unassigned"}`,
        href: `/dashboard/work-orders/${v.id}`,
      }),
    ),
    ...cQuotations.map(
      (q): TimelineItem => ({
        id: q.id,
        when: q.createdAt,
        icon: FileText,
        title: `Quotation ${q.number} — ${QUOTATION_STATUS_META[q.status].label}`,
        body: `${q.title} · ${formatCurrency(quotationTotal(q))}`,
        href: `/dashboard/quotations/${q.id}`,
      }),
    ),
    ...contracts.map(
      (c): TimelineItem => ({
        id: c.id,
        when: c.startDate,
        icon: ScrollText,
        title: `Contract ${c.number} started`,
        body: `${CONTRACT_TYPE_META[c.type].label} · ${formatCurrency(c.value)}`,
        href: `/dashboard/contracts/${c.id}`,
      }),
    ),
    ...cInvoices.map(
      (i): TimelineItem => ({
        id: i.id,
        when: i.issuedAt,
        icon: Receipt,
        title: `Invoice ${i.number} — ${INVOICE_STATUS_META[i.status].label}`,
        body: `${formatCurrency(i.amount)}${
          i.paidAt ? ` · paid ${formatDate(i.paidAt)}` : ""
        }`,
      }),
    ),
  ].sort((a, b) => new Date(b.when).getTime() - new Date(a.when).getTime());

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2 h-7 gap-1.5">
        <Link href="/dashboard/customers">
          <ArrowLeft className="h-3.5 w-3.5" /> Customers
        </Link>
      </Button>

      {/* ── Hero card: avatar + name + chips + actions on one strip ── */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
              {initials(customer.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-semibold">
                {customer.name}
              </h1>
              <StatusBadge
                label={stageMeta.label}
                tone={stageMeta.tone}
                color={stageMeta.color}
              />
              <StatusBadge label={cTypeMeta.label} tone={cTypeMeta.tone} />
              {activeContract && (
                <Badge
                  variant="outline"
                  className="h-5 gap-1 border-emerald-500/40 text-[10px] text-emerald-700 dark:text-emerald-300"
                >
                  <ScrollText className="h-3 w-3" /> On contract
                </Badge>
              )}
              {outstanding > 0 && (
                <Badge
                  variant="outline"
                  className="h-5 gap-1 border-amber-500/40 text-[10px] text-amber-700 dark:text-amber-300"
                >
                  <Receipt className="h-3 w-3" />
                  {formatCurrency(outstanding)} outstanding
                </Badge>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" /> {customer.phone}
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" /> {customer.email}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {customer.address},{" "}
                {customer.city}, {customer.country}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
              <Link href={`/dashboard/quotations/new?customer=${customer.id}`}>
                <FileText className="h-3.5 w-3.5" /> New quotation
              </Link>
            </Button>
            <Button asChild size="sm" className="h-8 gap-1.5">
              <Link href={`/dashboard/work-orders/new?customer=${customer.id}`}>
                <Plus className="h-3.5 w-3.5" /> New work order
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Insight strip ─────────────────────────────────────────────── */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <InsightCard
          variant="compact"
          icon={Snowflake}
          tone="primary"
          label="AC units"
          value={String(units.length)}
          caption={
            units.length > 0
              ? `${units.filter((u) => u.condition === "good").length} in good condition`
              : "No units recorded"
          }
        />
        <InsightCard
          variant="compact"
          icon={ScrollText}
          tone="success"
          label="Active contracts"
          value={String(contracts.filter((c) => c.status === "active").length)}
          caption={
            activeContract
              ? `Ends ${formatDate(activeContract.endDate, { withYear: true })}`
              : `${contracts.length} total on file`
          }
        />
        <InsightCard
          variant="compact"
          icon={Clock}
          tone="muted"
          label="Last work order"
          value={lastCompletedVisit ? relativeTime(lastCompletedVisit.scheduledAt) : "—"}
          caption={
            lastCompletedVisit
              ? CONTRACT_TYPE_META[lastCompletedVisit.type].label
              : "No completed work orders yet"
          }
        />
        <InsightCard
          variant="compact"
          icon={CalendarClock}
          tone={nextScheduledVisit ? "warn" : "muted"}
          label="Next work order"
          value={
            nextScheduledVisit
              ? relativeTime(nextScheduledVisit.scheduledAt)
              : "—"
          }
          caption={
            nextScheduledVisit
              ? `${userMap[nextScheduledVisit.engineerId]?.name ?? "Unassigned"} · ${formatDate(nextScheduledVisit.scheduledAt)}`
              : "Nothing scheduled"
          }
        />
        <InsightCard
          variant="compact"
          icon={FileText}
          tone="accent"
          label="Open quotations"
          value={String(openQuotations.length)}
          caption={`${approvedQuotations.length} approved overall`}
        />
        <InsightCard
          variant="compact"
          icon={TrendingUp}
          tone="primary"
          label="Lifetime value"
          value={formatCurrency(customer.lifetimeValue)}
          caption={
            cInvoices.length > 0
              ? `${cInvoices.length} invoices`
              : "No invoices yet"
          }
        />
      </div>

      {/* ── Main grid: profile rail + activity tabs ──────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Profile rail (compact) */}
        <Card className="h-fit">
          <CardContent className="space-y-3 p-3 text-xs">
            {/* Account manager */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className="text-[10px] font-semibold"
                  style={engineerAvatarStyle(owner?.hue)}
                >
                  {initials(owner?.name ?? "?")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Account manager
                </p>
                <p className="truncate font-medium text-foreground">
                  {owner?.name ?? "Unassigned"}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {owner?.title}
                </p>
              </div>
            </div>

            {/* Tags */}
            {customer.tags.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Tags
                </p>
                <div className="flex flex-wrap gap-1">
                  {customer.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="h-5 text-[10px]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {customer.notes.trim() && (
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Notes
                </p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {customer.notes}
                </p>
              </div>
            )}

            {/* Key dates */}
            <div className="grid grid-cols-2 gap-2 border-t border-border/40 pt-2">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Created
                </p>
                <p className="font-medium text-foreground">
                  {formatDate(customer.createdAt, { withYear: true })}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Last contact
                </p>
                <p className="font-medium text-foreground">
                  {relativeTime(customer.lastTouchedAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity tabs */}
        <Tabs defaultValue="units" className="space-y-3">
          <TabsList className="h-9">
            <TabsTrigger value="units" className="text-xs">
              <Snowflake className="mr-1 h-3 w-3" /> Units · {units.length}
            </TabsTrigger>
            <TabsTrigger value="contracts" className="text-xs">
              <ScrollText className="mr-1 h-3 w-3" /> Contracts ·{" "}
              {contracts.length}
            </TabsTrigger>
            <TabsTrigger value="quotations" className="text-xs">
              <FileText className="mr-1 h-3 w-3" /> Quotations ·{" "}
              {cQuotations.length}
            </TabsTrigger>
            <TabsTrigger value="invoices" className="text-xs">
              <Receipt className="mr-1 h-3 w-3" /> Invoices ·{" "}
              {cInvoices.length}
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-xs">
              <ClipboardList className="mr-1 h-3 w-3" /> Timeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="units" className="m-0 space-y-1.5">
            {units.length === 0 ? (
              <EmptyRow text="No AC units recorded yet." />
            ) : (
              units.map((u) => {
                const meta = UNIT_CONDITION_META[u.condition];
                return (
                  <Card key={u.id}>
                    <CardContent className="flex flex-wrap items-center gap-3 p-2.5">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                        <Snowflake className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold">
                          {u.brand} {u.model}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {UNIT_TYPE_META[u.type].label} ·{" "}
                          {u.btu.toLocaleString()} BTU · {u.location}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <StatusBadge label={meta.label} tone={meta.tone} />
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(u.installedAt, { withYear: true })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="contracts" className="m-0 space-y-1.5">
            {contracts.length === 0 ? (
              <EmptyRow text="No service contracts on file." />
            ) : (
              contracts.map((c) => {
                const meta = CONTRACT_STATUS_META[c.status];
                return (
                  <Link key={c.id} href={`/dashboard/contracts/${c.id}`}>
                    <Card className="transition hover:border-primary/40">
                      <CardContent className="flex flex-wrap items-center gap-3 p-2.5">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-400">
                          <ScrollText className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold">
                            {CONTRACT_TYPE_META[c.type].label} · {c.number}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {FREQUENCY_META[c.frequency].label} ·{" "}
                            {formatDate(c.startDate)} →{" "}
                            {formatDate(c.endDate, { withYear: true })}
                          </p>
                        </div>
                        <span className="text-xs font-semibold tabular-nums">
                          {formatCurrency(c.value)}
                        </span>
                        <StatusBadge
                          label={meta.label}
                          tone={meta.tone}
                          color={meta.color}
                        />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="quotations" className="m-0 space-y-1.5">
            {cQuotations.length === 0 ? (
              <EmptyRow text="No quotations yet." />
            ) : (
              cQuotations.map((q) => {
                const sMeta = QUOTATION_STATUS_META[q.status];
                const cMeta = QUOTATION_CATEGORY_META[q.category];
                return (
                  <Link key={q.id} href={`/dashboard/quotations/${q.id}`}>
                    <Card className="transition hover:border-primary/40">
                      <CardContent className="flex flex-wrap items-center gap-3 p-2.5">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-violet-500/15 text-violet-300">
                          <FileText className="h-3.5 w-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold">
                            {q.title}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {q.number} · {cMeta.label} ·{" "}
                            {formatDate(q.createdAt)}
                          </p>
                        </div>
                        <span className="text-xs font-semibold tabular-nums">
                          {formatCurrency(quotationTotal(q))}
                        </span>
                        <StatusBadge
                          label={sMeta.label}
                          tone={sMeta.tone}
                          color={sMeta.color}
                        />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="invoices" className="m-0 space-y-1.5">
            {cInvoices.length === 0 ? (
              <EmptyRow text="No invoices on record." />
            ) : (
              cInvoices.map((i) => {
                const meta = INVOICE_STATUS_META[i.status];
                return (
                  <Card key={i.id}>
                    <CardContent className="flex flex-wrap items-center gap-3 p-2.5">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/15 text-amber-300">
                        <Receipt className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-semibold">
                          {i.number}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          Issued {formatDate(i.issuedAt)} · Due{" "}
                          {formatDate(i.dueAt)}
                        </p>
                      </div>
                      <span className="text-xs font-semibold tabular-nums">
                        {formatCurrency(i.amount)}
                      </span>
                      <StatusBadge
                        label={meta.label}
                        tone={meta.tone}
                        color={meta.color}
                      />
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="timeline" className="m-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Customer timeline</CardTitle>
                <CardDescription className="text-xs">
                  Every interaction we&rsquo;ve had with this customer.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-1">
                {timeline.length === 0 ? (
                  <EmptyRow text="No activity yet." />
                ) : (
                  <ol className="relative space-y-2.5 border-l border-border/60 pl-5">
                    {timeline.slice(0, 30).map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.id} className="relative">
                          <span className="absolute -left-[28px] top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary ring-4 ring-background">
                            <Icon className="h-3 w-3" />
                          </span>
                          {item.href ? (
                            <Link href={item.href} className="block">
                              <TimelineRow item={item} />
                            </Link>
                          ) : (
                            <TimelineRow item={item} />
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ───────────────────────── Sub-components ─────────────────────────────── */

function TimelineRow({
  item,
}: {
  item: { when: string; title: string; body: string };
}) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground">{item.title}</p>
      <p className="text-[11px] text-muted-foreground">{item.body}</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground/80">
        {relativeTime(item.when)} · {formatDate(item.when, { withYear: true })}
      </p>
    </div>
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
