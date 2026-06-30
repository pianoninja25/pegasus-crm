"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Plus,
  Receipt,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import {
  DataTableColumnHeader,
  type SortDir,
} from "@/components/common/DataTableColumnHeader";
import { InsightCard } from "@/components/common/InsightCard";
import {
  Pagination,
  paginate,
  PAGE_SIZES,
  type PageSize,
} from "@/components/common/Pagination";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useSearchSuggestions } from "@/components/common/useSearchSuggestions";
import { useTableUrlState } from "@/components/common/useTableUrlState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useT } from "@/features/locale/hooks";
import { useInvoices } from "@/features/service/hooks";
import { customerMap } from "@/features/service/seed";
import {
  INVOICE_STATUS_META,
  type IncomeSource,
  type Invoice,
  type InvoiceStatus,
  type PaymentMethod,
} from "@/features/service/types";
import { formatCurrency, formatDate, initials, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/* ─────────────────────────── Column model ─────────────────────────────── */

type ColKey =
  | "invoice"
  | "customer"
  | "source"
  | "issued"
  | "due"
  | "status"
  | "method"
  | "amount";

const SORT_KEYS: readonly ColKey[] = [
  "invoice",
  "customer",
  "source",
  "issued",
  "due",
  "status",
  "method",
  "amount",
];

interface Filters {
  text: string;
  customer: string;
  sources: IncomeSource[];
  statuses: InvoiceStatus[];
  methods: PaymentMethod[];
  /** ISO date (YYYY-MM-DD). Inclusive lower bound on `issuedAt`. */
  dateFrom: string;
  /** ISO date (YYYY-MM-DD). Exclusive upper bound on `issuedAt`. */
  dateTo: string;
}

const EMPTY_FILTERS: Filters = {
  text: "",
  customer: "",
  sources: [],
  statuses: [],
  methods: [],
  dateFrom: "",
  dateTo: "",
};

const STATUS_ORDER: InvoiceStatus[] = [
  "draft",
  "sent",
  "partially_paid",
  "paid",
  "overdue",
  "cancelled",
];

const SOURCE_ORDER: IncomeSource[] = [
  "service_job",
  "service_contract",
  "spare_part_sale",
  "product_sale",
];

const METHOD_ORDER: PaymentMethod[] = [
  "cash",
  "bank_transfer",
  "credit_card",
  "ewallet",
  "check",
];

const STATUS_DOT: Record<InvoiceStatus, string> = {
  draft: "bg-slate-400",
  sent: "bg-sky-500",
  partially_paid: "bg-amber-500",
  paid: "bg-emerald-500",
  overdue: "bg-rose-500",
  cancelled: "bg-slate-400",
};

/* ──────────────────────────── Page component ──────────────────────────── */

export default function InvoicesPage() {
  const t = useT();
  const router = useRouter();
  const invoicesQ = useInvoices();
  const list = useMemo(() => invoicesQ.data ?? [], [invoicesQ.data]);

  /* ── URL-backed filters / sort / pagination / search ──────────── */
  const { state, setSort, setPage, setPageSize, setGlobalSearch, setFilters } =
    useTableUrlState<ColKey, Filters>({
      defaults: {
        sort: null,
        page: 1,
        pageSize: PAGE_SIZES[0],
        globalSearch: "",
        filters: EMPTY_FILTERS,
      },
      validSortKeys: SORT_KEYS,
      validPageSizes: PAGE_SIZES,
    });
  const { sort, filters, page, pageSize: pageSizeRaw, globalSearch } = state;
  const pageSize = pageSizeRaw as PageSize;

  /* ── Row model ──────────────────────────────────────────────────── */
  const rows = useMemo(
    () =>
      list.map((inv) => ({
        invoice: inv,
        customer: customerMap[inv.customerId],
      })),
    [list],
  );

  /* ── Customer option list (driven from current data) ──────────── */
  const customerOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      const k = r.customer?.name ?? "—";
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ value: name, label: name, count }));
  }, [rows]);

  /* ── Apply filters ──────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const inv = r.invoice;
      if (filters.text.trim()) {
        const needle = filters.text.trim().toLowerCase();
        if (
          !inv.number.toLowerCase().includes(needle) &&
          !(r.customer?.name ?? "").toLowerCase().includes(needle)
        ) {
          return false;
        }
      }
      if (filters.customer && r.customer?.name !== filters.customer) {
        return false;
      }
      if (filters.sources.length > 0 && !filters.sources.includes(inv.source)) {
        return false;
      }
      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(inv.status)
      ) {
        return false;
      }
      if (
        filters.methods.length > 0 &&
        (!inv.method || !filters.methods.includes(inv.method))
      ) {
        return false;
      }
      if (filters.dateFrom) {
        if (new Date(inv.issuedAt).getTime() < new Date(filters.dateFrom).getTime()) {
          return false;
        }
      }
      if (filters.dateTo) {
        if (new Date(inv.issuedAt).getTime() >= new Date(filters.dateTo).getTime()) {
          return false;
        }
      }
      if (globalSearch.trim()) {
        const needle = globalSearch.trim().toLowerCase();
        const haystack = [
          inv.number,
          r.customer?.name ?? "",
          t(`invoices.source.${inv.source}` as const),
          t(`invoices.status.${inv.status}` as const),
          inv.notes ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [rows, filters, globalSearch, t]);

  /* ── Sort ──────────────────────────────────────────────────────── */
  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort.key) {
        case "invoice":
          return a.invoice.number.localeCompare(b.invoice.number) * dir;
        case "customer":
          return (
            (a.customer?.name ?? "").localeCompare(b.customer?.name ?? "") *
            dir
          );
        case "source":
          return a.invoice.source.localeCompare(b.invoice.source) * dir;
        case "issued":
          return (
            (new Date(a.invoice.issuedAt).getTime() -
              new Date(b.invoice.issuedAt).getTime()) *
            dir
          );
        case "due":
          return (
            (new Date(a.invoice.dueAt).getTime() -
              new Date(b.invoice.dueAt).getTime()) *
            dir
          );
        case "status":
          return (
            (STATUS_ORDER.indexOf(a.invoice.status) -
              STATUS_ORDER.indexOf(b.invoice.status)) *
            dir
          );
        case "method":
          return (
            (a.invoice.method ?? "").localeCompare(b.invoice.method ?? "") * dir
          );
        case "amount":
          return (a.invoice.amount - b.invoice.amount) * dir;
      }
    });
  }, [filtered, sort]);

  /* ── Paginate ──────────────────────────────────────────────────── */
  const { visible, totalPages, safePage, rangeStart, rangeEnd } = paginate(
    sorted,
    page,
    pageSize,
  );

  /* ── Live search suggestions ──────────────────────────────────── */
  const trimmedSearch = globalSearch.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (trimmedSearch.length < 2) return [] as typeof rows;
    return rows
      .filter((r) => {
        const inv = r.invoice;
        const haystack = [
          inv.number,
          r.customer?.name ?? "",
          t(`invoices.source.${inv.source}` as const),
          t(`invoices.status.${inv.status}` as const),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(trimmedSearch);
      })
      .slice(0, 8);
  }, [rows, trimmedSearch, t]);

  const {
    open: searchOpen,
    setOpen: setSearchOpen,
    activeIndex: activeSuggestion,
    setActiveIndex: setActiveSuggestion,
    boxRef: searchBoxRef,
    onKeyDown: onSearchKeyDown,
  } = useSearchSuggestions({
    suggestions,
    onPick: (row) =>
      router.push(`/dashboard/customers/${row.invoice.customerId}`),
    resetKey: trimmedSearch,
  });

  /* ── KPI strip (across the entire ledger, not the filtered slice) ─ */
  const kpis = useMemo(() => {
    let total = 0;
    let paid = 0;
    let outstanding = 0;
    let overdueAmt = 0;
    let overdueCount = 0;
    for (const inv of list) {
      total += inv.amount;
      switch (inv.status) {
        case "paid":
          paid += inv.amount;
          break;
        case "partially_paid":
          paid += inv.amount * 0.5;
          outstanding += inv.amount * 0.5;
          break;
        case "sent":
          outstanding += inv.amount;
          break;
        case "overdue":
          outstanding += inv.amount;
          overdueAmt += inv.amount;
          overdueCount += 1;
          break;
        default:
          break;
      }
    }
    return { total, paid, outstanding, overdueAmt, overdueCount };
  }, [list]);

  /* ── Helpers ───────────────────────────────────────────────────── */
  const onSortChange = (key: ColKey) => (dir: SortDir | null) =>
    setSort(dir === null ? null : { key, dir });
  const sortFor = (key: ColKey) => ({
    active: sort?.key === key ? sort.dir : null,
    onChange: onSortChange(key),
  });

  const filtersActive =
    filters.text.trim().length > 0 ||
    filters.customer.length > 0 ||
    filters.sources.length > 0 ||
    filters.statuses.length > 0 ||
    filters.methods.length > 0 ||
    filters.dateFrom.length > 0 ||
    filters.dateTo.length > 0 ||
    globalSearch.trim().length > 0;

  const clearAllFilters = () => {
    setFilters(EMPTY_FILTERS);
    setGlobalSearch("");
  };

  const methodLabel = (m: PaymentMethod | undefined) =>
    m ? t(`invoices.method.${m}` as const) : t("invoices.method.unpaid");

  /* ─────────────────────── Render ──────────────────────── */

  return (
    <div className="space-y-4">
      {/* ── Title row ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">
            {t("invoices.title")}
          </h1>
          <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">
            {t("invoices.description")}
          </p>
        </div>
      </div>

      {/* ── KPI strip ─────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          icon={Receipt}
          tone="primary"
          label={t("invoices.insight.totalBilled")}
          value={formatCurrency(kpis.total)}
          caption={t("invoices.insight.totalBilledCaption")}
        />
        <InsightCard
          icon={CheckCircle2}
          tone="success"
          label={t("invoices.insight.collected")}
          value={formatCurrency(kpis.paid)}
          caption={t("invoices.insight.collectedCaption")}
        />
        <InsightCard
          icon={Receipt}
          tone={kpis.outstanding > 0 ? "warn" : "muted"}
          label={t("invoices.insight.outstanding")}
          value={formatCurrency(kpis.outstanding)}
          caption={t("invoices.insight.outstandingCaption")}
        />
        <InsightCard
          icon={CircleAlert}
          tone={kpis.overdueCount > 0 ? "destructive" : "muted"}
          label={t("invoices.insight.overdue")}
          value={formatCurrency(kpis.overdueAmt)}
          caption={`${kpis.overdueCount} · ${t(
            "invoices.insight.overdueCaption",
          )}`}
        />
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <div ref={searchBoxRef} className="relative">
            <Search
              strokeWidth={2.25}
              className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-foreground/70"
            />
            <Input
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={onSearchKeyDown}
              placeholder={t("invoices.searchPlaceholder")}
              className="h-8 w-72 pl-9 text-xs"
            />
            {searchOpen && trimmedSearch.length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-lg border border-border/60 bg-popover/95 shadow-xl backdrop-blur">
                {trimmedSearch.length < 2 ? (
                  <p className="px-3 py-2 text-[11px] text-muted-foreground">
                    {t("customers.search.minChars")}
                  </p>
                ) : suggestions.length === 0 ? (
                  <p className="px-3 py-2 text-[11px] text-muted-foreground">
                    {t("customers.search.noResults")}
                  </p>
                ) : (
                  <ul className="max-h-72 overflow-y-auto">
                    {suggestions.map((r, idx) => {
                      const inv = r.invoice;
                      const sMeta = INVOICE_STATUS_META[inv.status];
                      const active = idx === activeSuggestion;
                      return (
                        <li key={inv.id}>
                          <Link
                            href={`/dashboard/customers/${inv.customerId}`}
                            onMouseEnter={() => setActiveSuggestion(idx)}
                            className={cn(
                              "flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors",
                              active
                                ? "bg-primary/15 text-foreground"
                                : "hover:bg-foreground/5",
                            )}
                          >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
                              <Receipt className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-foreground">
                                {inv.number}
                              </p>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {r.customer?.name} ·{" "}
                                {t(
                                  `invoices.source.${inv.source}` as const,
                                )}
                              </p>
                            </div>
                            <StatusBadge
                              label={t(
                                `invoices.status.${inv.status}` as const,
                              )}
                              tone={sMeta.tone}
                              color={sMeta.color}
                            />
                            <span className="text-[10px] tabular-nums text-muted-foreground">
                              {formatCurrency(inv.amount)}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="tabular-nums">
              <span className="text-foreground">{sorted.length}</span>{" "}
              {t("common.of")} {rows.length}{" "}
              {t("invoices.title").toLowerCase()}
            </span>
            {(filters.dateFrom || filters.dateTo) && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                <CalendarDays className="h-3 w-3" />
                {filters.dateFrom
                  ? formatDate(filters.dateFrom)
                  : t("finance.allTime")}{" "}
                {t("invoices.dateRange.toLabel")}{" "}
                {filters.dateTo
                  ? formatDate(filters.dateTo)
                  : t("finance.allTime")}
                <button
                  type="button"
                  onClick={() =>
                    setFilters((f) => ({ ...f, dateFrom: "", dateTo: "" }))
                  }
                  className="ml-0.5 rounded p-0.5 transition-colors hover:bg-primary/20"
                  aria-label={t("invoices.dateRange.clear")}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            )}
            {filtersActive && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[11px] font-medium text-primary hover:underline"
              >
                {t("common.clearFilters")}
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" className="h-8 gap-1.5" asChild>
            <Link href="/dashboard/finance/invoices/new">
              <Plus className="h-3.5 w-3.5" />
              {t("invoices.new")}
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-background/30">
                <tr>
                  <DataTableColumnHeader
                    label={t("finance.column.invoice")}
                    sort={sortFor("invoice")}
                    filter={{
                      kind: "text",
                      value: filters.text,
                      onChange: (v) =>
                        setFilters((f) => ({ ...f, text: v })),
                      placeholder: t("invoices.filter.numberOrCustomer"),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("finance.column.customer")}
                    className="hidden md:table-cell"
                    sort={sortFor("customer")}
                    filter={{
                      kind: "enum",
                      value: filters.customer ? [filters.customer] : [],
                      onChange: (v) =>
                        setFilters((f) => ({
                          ...f,
                          customer: v[0] ?? "",
                        })),
                      options: customerOptions,
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("finance.column.source")}
                    className="hidden lg:table-cell"
                    sort={sortFor("source")}
                    filter={{
                      kind: "enum",
                      value: filters.sources,
                      onChange: (v) =>
                        setFilters((f) => ({
                          ...f,
                          sources: v as IncomeSource[],
                        })),
                      options: SOURCE_ORDER.map((s) => ({
                        value: s,
                        label: t(`invoices.source.${s}` as const),
                        count: rows.filter((r) => r.invoice.source === s).length,
                      })),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("finance.column.issued")}
                    align="center"
                    className="hidden md:table-cell"
                    sort={sortFor("issued")}
                  />
                  <DataTableColumnHeader
                    label={t("finance.column.due")}
                    align="center"
                    className="hidden lg:table-cell"
                    sort={sortFor("due")}
                  />
                  <DataTableColumnHeader
                    label={t("finance.column.status")}
                    sort={sortFor("status")}
                    filter={{
                      kind: "enum",
                      value: filters.statuses,
                      onChange: (v) =>
                        setFilters((f) => ({
                          ...f,
                          statuses: v as InvoiceStatus[],
                        })),
                      options: STATUS_ORDER.map((s) => ({
                        value: s,
                        label: t(`invoices.status.${s}` as const),
                        dotClass: STATUS_DOT[s],
                        count: rows.filter((r) => r.invoice.status === s).length,
                      })),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("finance.column.method")}
                    className="hidden xl:table-cell"
                    sort={sortFor("method")}
                    filter={{
                      kind: "enum",
                      value: filters.methods,
                      onChange: (v) =>
                        setFilters((f) => ({
                          ...f,
                          methods: v as PaymentMethod[],
                        })),
                      options: METHOD_ORDER.map((m) => ({
                        value: m,
                        label: t(`invoices.method.${m}` as const),
                        count: rows.filter((r) => r.invoice.method === m).length,
                      })),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("finance.column.amount")}
                    align="right"
                    sort={sortFor("amount")}
                  />
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const inv: Invoice = r.invoice;
                  const sMeta = INVOICE_STATUS_META[inv.status];
                  const isOverdue = inv.status === "overdue";
                  return (
                    <tr
                      key={inv.id}
                      className="group border-b border-border/40 transition-colors hover:bg-foreground/5"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={
                            r.customer
                              ? `/dashboard/customers/${r.customer.id}`
                              : "#"
                          }
                          className="block min-w-0"
                        >
                          <p className="truncate font-medium text-foreground group-hover:text-primary">
                            {inv.number}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {relativeTime(inv.issuedAt)}
                          </p>
                        </Link>
                      </td>
                      <td className="hidden px-2 py-2.5 md:table-cell">
                        {r.customer ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                                {initials(r.customer.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium">
                                {r.customer.name}
                              </p>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {r.customer.city}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="hidden px-2 py-2.5 text-[11px] text-muted-foreground lg:table-cell">
                        {t(`invoices.source.${inv.source}` as const)}
                      </td>
                      <td className="hidden px-2 py-2.5 text-center text-[11px] tabular-nums text-muted-foreground md:table-cell">
                        {formatDate(inv.issuedAt)}
                      </td>
                      <td className="hidden px-2 py-2.5 text-center text-[11px] tabular-nums lg:table-cell">
                        <span
                          className={cn(
                            isOverdue
                              ? "text-rose-600 dark:text-rose-300"
                              : "text-foreground/80",
                          )}
                        >
                          {formatDate(inv.dueAt)}
                        </span>
                      </td>
                      <td className="px-2 py-2.5">
                        <StatusBadge
                          label={t(
                            `invoices.status.${inv.status}` as const,
                          )}
                          tone={sMeta.tone}
                          color={sMeta.color}
                        />
                      </td>
                      <td className="hidden px-2 py-2.5 text-[11px] text-muted-foreground xl:table-cell">
                        {methodLabel(inv.method)}
                      </td>
                      <td className="px-2 py-2.5 text-right text-xs font-semibold tabular-nums">
                        {formatCurrency(inv.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {sorted.length === 0 && (
            <div className="px-4 py-12 text-center text-xs text-muted-foreground">
              <Sparkles className="mx-auto mb-2 h-4 w-4" />
              {t("invoices.empty")}
            </div>
          )}
        </CardContent>
      </Card>

      <Pagination
        page={safePage}
        pageSize={pageSize}
        total={sorted.length}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
