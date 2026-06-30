"use client";

import { useMemo } from "react";
import {
  CalendarDays,
  Layers,
  ListChecks,
  Plus,
  Search,
  Sparkles,
  Store,
  Wallet,
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
import { useTableUrlState } from "@/components/common/useTableUrlState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useT } from "@/features/locale/hooks";
import { useExpenses } from "@/features/service/hooks";
import { userMap } from "@/features/service/seed";
import {
  EXPENSE_CATEGORY_META,
  type ExpenseCategory,
} from "@/features/service/types";
import { formatCurrency, formatDate, relativeTime } from "@/lib/format";

/* ─────────────────────────── Column model ─────────────────────────────── */

type ColKey =
  | "description"
  | "category"
  | "vendor"
  | "recordedBy"
  | "date"
  | "amount";

const SORT_KEYS: readonly ColKey[] = [
  "description",
  "category",
  "vendor",
  "recordedBy",
  "date",
  "amount",
];

interface Filters {
  text: string;
  categories: ExpenseCategory[];
  vendors: string[];
  recordedBy: string[];
  /** ISO date (YYYY-MM-DD), inclusive lower bound on `spentAt`. */
  dateFrom: string;
  /** ISO date (YYYY-MM-DD), exclusive upper bound on `spentAt`. */
  dateTo: string;
}

const EMPTY_FILTERS: Filters = {
  text: "",
  categories: [],
  vendors: [],
  recordedBy: [],
  dateFrom: "",
  dateTo: "",
};

const CATEGORY_ORDER: ExpenseCategory[] = [
  "fuel",
  "transport",
  "spare_parts",
  "tools",
  "salaries",
  "rent",
  "utilities",
  "marketing",
  "misc",
];

/* ──────────────────────────── Page component ──────────────────────────── */

export default function ExpensesPage() {
  const t = useT();
  const expensesQ = useExpenses();
  const list = useMemo(() => expensesQ.data ?? [], [expensesQ.data]);

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
      list.map((expense) => ({
        expense,
        owner: userMap[expense.recordedById],
      })),
    [list],
  );

  /* ── Filter option lists ─────────────────────────────────────────── */
  const vendorOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      const k = r.expense.vendor?.trim() || "—";
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ value: name, label: name, count }));
  }, [rows]);

  const recordedByOptions = useMemo(() => {
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
      const e = r.expense;
      if (filters.text.trim()) {
        const needle = filters.text.trim().toLowerCase();
        if (
          !e.description.toLowerCase().includes(needle) &&
          !(e.vendor ?? "").toLowerCase().includes(needle)
        ) {
          return false;
        }
      }
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(e.category)
      ) {
        return false;
      }
      if (filters.vendors.length > 0) {
        const k = e.vendor?.trim() || "—";
        if (!filters.vendors.includes(k)) return false;
      }
      if (filters.recordedBy.length > 0) {
        const k = r.owner?.name ?? "—";
        if (!filters.recordedBy.includes(k)) return false;
      }
      if (filters.dateFrom) {
        if (new Date(e.spentAt).getTime() < new Date(filters.dateFrom).getTime()) {
          return false;
        }
      }
      if (filters.dateTo) {
        if (new Date(e.spentAt).getTime() >= new Date(filters.dateTo).getTime()) {
          return false;
        }
      }
      if (globalSearch.trim()) {
        const needle = globalSearch.trim().toLowerCase();
        const haystack = [
          e.description,
          e.vendor ?? "",
          t(`expenses.category.${e.category}` as const),
          r.owner?.name ?? "",
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
        case "description":
          return a.expense.description.localeCompare(b.expense.description) * dir;
        case "category":
          return a.expense.category.localeCompare(b.expense.category) * dir;
        case "vendor":
          return (
            (a.expense.vendor ?? "").localeCompare(b.expense.vendor ?? "") * dir
          );
        case "recordedBy":
          return (
            (a.owner?.name ?? "").localeCompare(b.owner?.name ?? "") * dir
          );
        case "date":
          return (
            (new Date(a.expense.spentAt).getTime() -
              new Date(b.expense.spentAt).getTime()) *
            dir
          );
        case "amount":
          return (a.expense.amount - b.expense.amount) * dir;
      }
    });
  }, [filtered, sort]);

  /* ── Paginate ──────────────────────────────────────────────────── */
  const { visible, totalPages, safePage, rangeStart, rangeEnd } = paginate(
    sorted,
    page,
    pageSize,
  );

  /* ── KPI strip (across the entire ledger) ──────────────────────── */
  const kpis = useMemo(() => {
    const byCategory = new Map<ExpenseCategory, number>();
    const byVendor = new Map<string, number>();
    let total = 0;
    for (const e of list) {
      total += e.amount;
      byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
      const v = e.vendor?.trim() || "—";
      byVendor.set(v, (byVendor.get(v) ?? 0) + e.amount);
    }
    const sortByAmount = <K,>(map: Map<K, number>) =>
      Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    const topCategory = sortByAmount(byCategory)[0];
    const topVendor = sortByAmount(byVendor)[0];
    return {
      total,
      entries: list.length,
      topCategory: topCategory
        ? { key: topCategory[0], amount: topCategory[1] }
        : null,
      topVendor: topVendor
        ? { key: topVendor[0], amount: topVendor[1] }
        : null,
    };
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
    filters.categories.length > 0 ||
    filters.vendors.length > 0 ||
    filters.recordedBy.length > 0 ||
    filters.dateFrom.length > 0 ||
    filters.dateTo.length > 0 ||
    globalSearch.trim().length > 0;

  const clearAllFilters = () => {
    setFilters(EMPTY_FILTERS);
    setGlobalSearch("");
  };

  /* ─────────────────────── Render ──────────────────────── */

  return (
    <div className="space-y-4">
      {/* ── Title row ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">
            {t("expenses.title")}
          </h1>
          <p className="mt-0.5 max-w-2xl text-xs text-muted-foreground">
            {t("expenses.description")}
          </p>
        </div>
      </div>

      {/* ── KPI strip ─────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          icon={Wallet}
          tone="destructive"
          label={t("expenses.insight.totalSpend")}
          value={formatCurrency(kpis.total)}
          caption={t("expenses.insight.totalSpendCaption")}
        />
        <InsightCard
          icon={Layers}
          tone="warn"
          label={t("expenses.insight.biggestCategory")}
          value={
            kpis.topCategory
              ? t(`expenses.category.${kpis.topCategory.key}` as const)
              : "—"
          }
          caption={
            kpis.topCategory
              ? `${formatCurrency(kpis.topCategory.amount)} · ${t(
                  "expenses.insight.biggestCategoryCaption",
                )}`
              : t("expenses.insight.biggestCategoryCaption")
          }
        />
        <InsightCard
          icon={ListChecks}
          tone="primary"
          label={t("expenses.insight.entries")}
          value={String(kpis.entries)}
          caption={t("expenses.insight.entriesCaption")}
        />
        <InsightCard
          icon={Store}
          tone="accent"
          label={t("expenses.insight.biggestVendor")}
          value={kpis.topVendor ? kpis.topVendor.key : "—"}
          caption={
            kpis.topVendor
              ? `${formatCurrency(kpis.topVendor.amount)} · ${t(
                  "expenses.insight.biggestVendorCaption",
                )}`
              : t("expenses.insight.biggestVendorCaption")
          }
        />
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              strokeWidth={2.25}
              className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-foreground/70"
            />
            <Input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder={t("expenses.searchPlaceholder")}
              className="h-8 w-72 pl-9 text-xs"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="tabular-nums">
              <span className="text-foreground">{sorted.length}</span>{" "}
              {t("common.of")} {rows.length}{" "}
              {t("expenses.title").toLowerCase()}
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
          <Button size="sm" className="h-8 gap-1.5" disabled>
            <Plus className="h-3.5 w-3.5" />
            {t("expenses.recordEntry")}
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
                    label={t("expenses.column.description")}
                    sort={sortFor("description")}
                    filter={{
                      kind: "text",
                      value: filters.text,
                      onChange: (v) =>
                        setFilters((f) => ({ ...f, text: v })),
                      placeholder: t("expenses.filter.descriptionOrVendor"),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("expenses.column.category")}
                    sort={sortFor("category")}
                    filter={{
                      kind: "enum",
                      value: filters.categories,
                      onChange: (v) =>
                        setFilters((f) => ({
                          ...f,
                          categories: v as ExpenseCategory[],
                        })),
                      options: CATEGORY_ORDER.map((c) => ({
                        value: c,
                        label: t(`expenses.category.${c}` as const),
                        count: rows.filter((r) => r.expense.category === c).length,
                      })),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("expenses.column.vendor")}
                    className="hidden md:table-cell"
                    sort={sortFor("vendor")}
                    filter={{
                      kind: "enum",
                      value: filters.vendors,
                      onChange: (v) =>
                        setFilters((f) => ({ ...f, vendors: v })),
                      options: vendorOptions,
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("expenses.column.recordedBy")}
                    className="hidden lg:table-cell"
                    sort={sortFor("recordedBy")}
                    filter={{
                      kind: "enum",
                      value: filters.recordedBy,
                      onChange: (v) =>
                        setFilters((f) => ({ ...f, recordedBy: v })),
                      options: recordedByOptions,
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("expenses.column.date")}
                    align="center"
                    className="hidden md:table-cell"
                    sort={sortFor("date")}
                  />
                  <DataTableColumnHeader
                    label={t("expenses.column.amount")}
                    align="right"
                    sort={sortFor("amount")}
                  />
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const e = r.expense;
                  const meta = EXPENSE_CATEGORY_META[e.category];
                  return (
                    <tr
                      key={e.id}
                      className="group border-b border-border/40 transition-colors hover:bg-foreground/5"
                    >
                      <td className="px-4 py-2.5">
                        <p className="truncate font-medium text-foreground">
                          {e.description}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {relativeTime(e.spentAt)}
                        </p>
                      </td>
                      <td className="px-2 py-2.5">
                        <StatusBadge
                          label={t(
                            `expenses.category.${e.category}` as const,
                          )}
                          tone={meta.tone}
                        />
                      </td>
                      <td className="hidden px-2 py-2.5 text-[11px] text-muted-foreground md:table-cell">
                        {e.vendor ?? "—"}
                      </td>
                      <td className="hidden px-2 py-2.5 text-[11px] text-muted-foreground lg:table-cell">
                        {r.owner?.name ?? "—"}
                      </td>
                      <td className="hidden px-2 py-2.5 text-center text-[11px] tabular-nums text-muted-foreground md:table-cell">
                        {formatDate(e.spentAt)}
                      </td>
                      <td className="px-2 py-2.5 text-right text-xs font-semibold tabular-nums text-rose-600 dark:text-rose-300">
                        -{formatCurrency(e.amount)}
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
              {t("expenses.empty")}
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
