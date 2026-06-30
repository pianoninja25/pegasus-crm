"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  FileText,
  Plus,
  Search,
  Send,
  TrendingUp,
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
import { useSearchSuggestions } from "@/components/common/useSearchSuggestions";
import { useTableUrlState } from "@/components/common/useTableUrlState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { NewQuotationDialog } from "@/components/quotations/NewQuotationDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useT } from "@/features/locale/hooks";
import { useQuotations } from "@/features/service/hooks";
import {
  customerMap,
  quotationTotal,
  userMap,
} from "@/features/service/seed";
import {
  QUOTATION_CATEGORY_META,
  QUOTATION_STATUS_META,
  type QuotationCategory,
  type QuotationStatus,
} from "@/features/service/types";
import {
  formatCurrency,
  formatDate,
  initials,
  relativeTime,
} from "@/lib/format";
import { cn } from "@/lib/utils";

/* ─────────────────────────── Column model ─────────────────────────────── */

type ColKey =
  | "quotation"
  | "customer"
  | "category"
  | "total"
  | "status"
  | "validUntil"
  | "owner";

const SORT_KEYS: readonly ColKey[] = [
  "quotation",
  "customer",
  "category",
  "total",
  "status",
  "validUntil",
  "owner",
];

interface Filters {
  text: string;
  categories: QuotationCategory[];
  statuses: QuotationStatus[];
  customer: string;
  owner: string;
}

const EMPTY_FILTERS: Filters = {
  text: "",
  categories: [],
  statuses: [],
  customer: "",
  owner: "",
};

const STATUS_ORDER: QuotationStatus[] = [
  "draft",
  "sent",
  "approved",
  "rejected",
  "expired",
];
const CATEGORY_ORDER: QuotationCategory[] = [
  "service",
  "product",
  "spare_parts",
  "service_contract",
];

/** Tailwind class for the coloured dot in the status filter dropdown. */
const STATUS_DOT: Record<QuotationStatus, string> = {
  draft: "bg-slate-400",
  sent: "bg-sky-500",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
  expired: "bg-amber-500",
};

/* ──────────────────────────── Page component ──────────────────────────── */

export default function QuotationsPage() {
  const t = useT();
  const quotationsQ = useQuotations();
  const list = useMemo(() => quotationsQ.data ?? [], [quotationsQ.data]);

  /* ── URL-backed filters / sort / pagination / search state ─────── */
  const { state, setSort, setPage, setPageSize, setGlobalSearch, setFilters } =
    useTableUrlState<ColKey, Filters>({
      defaults: {
        // Fresh pages load unsorted — sort only applies on explicit column click.
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

  const [createOpen, setCreateOpen] = useState(false);

  /* ── Row model — quotation + computed total + customer/owner refs ── */
  const rows = useMemo(
    () =>
      list.map((q) => ({
        quotation: q,
        customer: customerMap[q.customerId],
        owner: userMap[q.ownerId],
        total: quotationTotal(q),
      })),
    [list],
  );

  /* ── Customer / owner filter option lists ───────────────────────── */
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

  const ownerOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      const k = r.owner?.name ?? "—";
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ value: name, label: name, count }));
  }, [rows]);

  /* ── Apply filters ──────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const q = r.quotation;
      if (filters.text.trim()) {
        const needle = filters.text.trim().toLowerCase();
        if (
          !q.title.toLowerCase().includes(needle) &&
          !q.number.toLowerCase().includes(needle)
        ) {
          return false;
        }
      }
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(q.category)
      ) {
        return false;
      }
      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(q.status)
      ) {
        return false;
      }
      if (filters.customer && r.customer?.name !== filters.customer) {
        return false;
      }
      if (filters.owner && r.owner?.name !== filters.owner) {
        return false;
      }
      if (globalSearch.trim()) {
        const needle = globalSearch.trim().toLowerCase();
        const haystack = [
          q.number,
          q.title,
          r.customer?.name ?? "",
          r.owner?.name ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });
  }, [rows, filters, globalSearch]);

  /* ── Apply sort ─────────────────────────────────────────────────── */
  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort.key) {
        case "quotation":
          return a.quotation.number.localeCompare(b.quotation.number) * dir;
        case "customer":
          return (a.customer?.name ?? "").localeCompare(
            b.customer?.name ?? "",
          ) * dir;
        case "category":
          return a.quotation.category.localeCompare(b.quotation.category) * dir;
        case "status":
          return (
            STATUS_ORDER.indexOf(a.quotation.status) -
            STATUS_ORDER.indexOf(b.quotation.status)
          ) * dir;
        case "total":
          return (a.total - b.total) * dir;
        case "validUntil":
          return (
            new Date(a.quotation.validUntil).getTime() -
            new Date(b.quotation.validUntil).getTime()
          ) * dir;
        case "owner":
          return (a.owner?.name ?? "").localeCompare(b.owner?.name ?? "") * dir;
      }
    });
  }, [filtered, sort]);

  /* ── Paginate ───────────────────────────────────────────────────── */
  const { visible, totalPages, safePage, rangeStart, rangeEnd } = paginate(
    sorted,
    page,
    pageSize,
  );

  /* ── Live search suggestions ────────────────────────────────────── */
  const trimmedSearch = globalSearch.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (trimmedSearch.length < 2) return [] as typeof rows;
    return rows
      .filter((r) => {
        const q = r.quotation;
        const haystack = [
          q.number,
          q.title,
          r.customer?.name ?? "",
          r.owner?.name ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(trimmedSearch);
      })
      .slice(0, 8);
  }, [rows, trimmedSearch]);

  /* ── Top-line KPIs (full list, not the filtered set) ────────────── */
  const kpis = useMemo(() => {
    const open = rows.filter(
      (r) => r.quotation.status === "draft" || r.quotation.status === "sent",
    );
    const sent = rows.filter((r) => r.quotation.status === "sent");
    const decided = rows.filter(
      (r) =>
        r.quotation.status === "approved" ||
        r.quotation.status === "rejected" ||
        r.quotation.status === "expired",
    );
    const approved = rows.filter((r) => r.quotation.status === "approved");

    const now = Date.now();
    const inSevenDays = now + 7 * 86_400_000;
    const expiringSoon = sent.filter((r) => {
      const v = new Date(r.quotation.validUntil).getTime();
      return v >= now && v <= inSevenDays;
    });

    return {
      openCount: open.length,
      openValue: open.reduce((s, r) => s + r.total, 0),
      pipelineValue: sent.reduce((s, r) => s + r.total, 0),
      winRate: decided.length
        ? Math.round((approved.length / decided.length) * 100)
        : 0,
      decidedCount: decided.length,
      approvedCount: approved.length,
      expiringSoonCount: expiringSoon.length,
      expiringSoonValue: expiringSoon.reduce((s, r) => s + r.total, 0),
    };
  }, [rows]);

  /* ── Helpers ───────────────────────────────────────────────────── */
  const onSortChange = (key: ColKey) => (dir: SortDir | null) =>
    setSort(dir === null ? null : { key, dir });
  const sortFor = (key: ColKey) => ({
    active: sort?.key === key ? sort.dir : null,
    onChange: onSortChange(key),
  });

  const filtersActive =
    filters.text.trim().length > 0 ||
    filters.categories.length > 0 ||
    filters.statuses.length > 0 ||
    filters.customer.length > 0 ||
    filters.owner.length > 0 ||
    globalSearch.trim().length > 0;

  const clearAllFilters = () => {
    setFilters(EMPTY_FILTERS);
    setGlobalSearch("");
  };

  const router = useRouter();
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
      router.push(`/dashboard/quotations/${row.quotation.id}`),
    resetKey: trimmedSearch,
  });

  return (
    <div className="space-y-4">
      {/* ── Top KPI strip ─────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          icon={FileText}
          tone="primary"
          label={t("quotations.insight.openCount")}
          value={String(kpis.openCount)}
          caption={t("quotations.insight.openCountCaption")}
        />
        <InsightCard
          icon={Send}
          tone="accent"
          label={t("quotations.insight.pipeline")}
          value={formatCurrency(kpis.pipelineValue)}
          caption={t("quotations.insight.pipelineCaption")}
        />
        <InsightCard
          icon={TrendingUp}
          tone="success"
          label={t("quotations.insight.winRate")}
          value={kpis.decidedCount ? `${kpis.winRate}%` : "—"}
          caption={`${kpis.approvedCount}/${kpis.decidedCount} ${t("quotations.insight.winRateCaption")}`}
        />
        <InsightCard
          icon={CalendarClock}
          tone={kpis.expiringSoonCount > 0 ? "warn" : "muted"}
          label={t("quotations.insight.expiringSoon")}
          value={String(kpis.expiringSoonCount)}
          caption={t("quotations.insight.expiringSoonCaption")}
        />
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────────── */}
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
              placeholder={t("quotations.searchPlaceholder")}
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
                      const q = r.quotation;
                      const sMeta = QUOTATION_STATUS_META[q.status];
                      const active = idx === activeSuggestion;
                      return (
                        <li key={q.id}>
                          <Link
                            href={`/dashboard/quotations/${q.id}`}
                            onMouseEnter={() => setActiveSuggestion(idx)}
                            className={cn(
                              "flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors",
                              active
                                ? "bg-primary/15 text-foreground"
                                : "hover:bg-foreground/5",
                            )}
                          >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
                              <FileText className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-foreground">
                                {q.title}
                              </p>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {q.number} · {r.customer?.name}
                              </p>
                            </div>
                            <StatusBadge
                              label={sMeta.label}
                              tone={sMeta.tone}
                              color={sMeta.color}
                            />
                            <span className="text-[10px] tabular-nums text-muted-foreground">
                              {formatCurrency(r.total)}
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
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="tabular-nums">
              <span className="text-foreground">{sorted.length}</span>{" "}
              {t("common.of")} {rows.length}{" "}
              {t("quotations.title").toLowerCase()}
            </span>
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
          <Button
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            {t("quotations.new")}
          </Button>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-background/30">
                <tr>
                  <DataTableColumnHeader
                    label={t("quotations.column.quotation")}
                    sort={sortFor("quotation")}
                    filter={{
                      kind: "text",
                      value: filters.text,
                      onChange: (v) => setFilters((f) => ({ ...f, text: v })),
                      placeholder: t("quotations.filter.titleOrNumber"),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("quotations.column.customer")}
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
                    label={t("quotations.column.category")}
                    sort={sortFor("category")}
                    filter={{
                      kind: "enum",
                      value: filters.categories,
                      onChange: (v) =>
                        setFilters((f) => ({
                          ...f,
                          categories: v as QuotationCategory[],
                        })),
                      options: CATEGORY_ORDER.map((c) => ({
                        value: c,
                        label: t(`quotations.category.${c}` as const),
                        count: rows.filter((r) => r.quotation.category === c)
                          .length,
                      })),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("quotations.column.status")}
                    sort={sortFor("status")}
                    filter={{
                      kind: "enum",
                      value: filters.statuses,
                      onChange: (v) =>
                        setFilters((f) => ({
                          ...f,
                          statuses: v as QuotationStatus[],
                        })),
                      options: STATUS_ORDER.map((s) => ({
                        value: s,
                        label: t(`quotations.status.${s}` as const),
                        dotClass: STATUS_DOT[s],
                        count: rows.filter((r) => r.quotation.status === s)
                          .length,
                      })),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("quotations.column.total")}
                    align="right"
                    sort={sortFor("total")}
                  />
                  <DataTableColumnHeader
                    label={t("quotations.column.validUntil")}
                    align="center"
                    className="hidden lg:table-cell"
                    sort={sortFor("validUntil")}
                  />
                  <DataTableColumnHeader
                    label={t("quotations.column.owner")}
                    className="hidden xl:table-cell"
                    sort={sortFor("owner")}
                    filter={{
                      kind: "enum",
                      value: filters.owner ? [filters.owner] : [],
                      onChange: (v) =>
                        setFilters((f) => ({
                          ...f,
                          owner: v[0] ?? "",
                        })),
                      options: ownerOptions,
                    }}
                  />
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const q = r.quotation;
                  const sMeta = QUOTATION_STATUS_META[q.status];
                  const cMeta = QUOTATION_CATEGORY_META[q.category];
                  const validUntilTs = new Date(q.validUntil).getTime();
                  const isExpiringSoon =
                    q.status === "sent" &&
                    validUntilTs >= Date.now() &&
                    validUntilTs <= Date.now() + 7 * 86_400_000;
                  return (
                    <tr
                      key={q.id}
                      className="group border-b border-border/40 transition-colors hover:bg-foreground/5"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/dashboard/quotations/${q.id}`}
                          className="block min-w-0"
                        >
                          <p className="truncate font-medium text-foreground group-hover:text-primary">
                            {q.title}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {q.number} · {relativeTime(q.createdAt)}
                          </p>
                        </Link>
                      </td>
                      <td className="hidden px-2 py-2.5 md:table-cell">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                              {initials(r.customer?.name ?? "?")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium">
                              {r.customer?.name}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {r.customer?.city}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2.5">
                        <StatusBadge label={cMeta.label} tone={cMeta.tone} />
                      </td>
                      <td className="px-2 py-2.5">
                        <StatusBadge
                          label={sMeta.label}
                          tone={sMeta.tone}
                          color={sMeta.color}
                        />
                      </td>
                      <td className="px-2 py-2.5 text-right text-xs font-semibold tabular-nums">
                        {formatCurrency(r.total)}
                      </td>
                      <td className="hidden px-2 py-2.5 text-center text-[11px] tabular-nums lg:table-cell">
                        <span
                          className={cn(
                            isExpiringSoon
                              ? "text-amber-600 dark:text-amber-300"
                              : "text-muted-foreground",
                          )}
                        >
                          {formatDate(q.validUntil)}
                        </span>
                      </td>
                      <td className="hidden px-2 py-2.5 text-[11px] text-muted-foreground xl:table-cell">
                        {r.owner?.name}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {sorted.length === 0 && (
            <div className="px-4 py-12 text-center text-xs text-muted-foreground">
              {t("quotations.empty")}
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

      <NewQuotationDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
