"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock,
  Plus,
  ScrollText,
  Search,
  Sparkles,
  Wrench,
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
import { useVisits } from "@/features/service/hooks";
import {
  customerMap,
  userMap,
  workOrderInsights,
} from "@/features/service/seed";
import {
  CONTRACT_TYPE_META,
  VISIT_STATUS_META,
  type ContractType,
  type VisitStatus,
} from "@/features/service/types";
import {
  engineerAvatarStyle,
  formatCurrency,
  formatDate,
  initials,
} from "@/lib/format";
import { cn } from "@/lib/utils";

/* ─────────────────────────── Column model ─────────────────────────────── */

type ColKey =
  | "workOrder"
  | "customer"
  | "type"
  | "engineer"
  | "status"
  | "scheduled"
  | "duration"
  | "revenue";

const SORT_KEYS: readonly ColKey[] = [
  "workOrder",
  "customer",
  "type",
  "engineer",
  "status",
  "scheduled",
  "duration",
  "revenue",
];

interface Filters {
  text: string;
  types: ContractType[];
  statuses: VisitStatus[];
  customer: string;
  engineer: string;
}

const EMPTY_FILTERS: Filters = {
  text: "",
  types: [],
  statuses: [],
  customer: "",
  engineer: "",
};

const STATUS_ORDER: VisitStatus[] = [
  "scheduled",
  "in_progress",
  "completed",
  "overdue",
  "cancelled",
];

const TYPE_ORDER: ContractType[] = [
  "ac_cleaning",
  "preventive_maintenance",
  "spare_part_replacement",
  "ac_replacement",
  "custom",
];

const STATUS_DOT: Record<VisitStatus, string> = {
  scheduled: "bg-sky-500",
  in_progress: "bg-amber-500",
  completed: "bg-emerald-500",
  overdue: "bg-rose-500",
  cancelled: "bg-slate-400",
};

/* ──────────────────────────── Page component ──────────────────────────── */

export default function WorkOrdersPage() {
  const t = useT();
  const visitsQ = useVisits();
  const list = useMemo(() => visitsQ.data ?? [], [visitsQ.data]);

  /* ── URL-backed filters / sort / pagination / search state ─────── */
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

  /* ── Seed the filter from `?status=…` once on first mount (used by
   *    the dashboard quick links). After that, URL state is the truth. ─ */
  const searchParams = useSearchParams();
  const seededFromQuery = useRef(false);
  useEffect(() => {
    if (seededFromQuery.current) return;
    const raw = searchParams.get("status");
    if (!raw) {
      seededFromQuery.current = true;
      return;
    }
    if (STATUS_ORDER.includes(raw as VisitStatus)) {
      setFilters((f) => ({ ...f, statuses: [raw as VisitStatus] }));
    }
    seededFromQuery.current = true;
  }, [searchParams, setFilters]);

  /* ── Row model ──────────────────────────────────────────────────── */
  const rows = useMemo(
    () =>
      list.map((v) => ({
        visit: v,
        customer: customerMap[v.customerId],
        engineer: userMap[v.engineerId],
      })),
    [list],
  );

  /* ── Filter option lists ─────────────────────────────────────────── */
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

  const engineerOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      const k = r.engineer?.name ?? "—";
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ value: name, label: name, count }));
  }, [rows]);

  /* ── Apply filters ──────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const v = r.visit;
      if (filters.text.trim()) {
        const needle = filters.text.trim().toLowerCase();
        if (
          !v.number.toLowerCase().includes(needle) &&
          !(r.customer?.name ?? "").toLowerCase().includes(needle)
        ) {
          return false;
        }
      }
      if (filters.types.length > 0 && !filters.types.includes(v.type)) {
        return false;
      }
      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(v.status)
      ) {
        return false;
      }
      if (filters.customer && r.customer?.name !== filters.customer) {
        return false;
      }
      if (filters.engineer && r.engineer?.name !== filters.engineer) {
        return false;
      }
      if (globalSearch.trim()) {
        const needle = globalSearch.trim().toLowerCase();
        const haystack = [
          v.number,
          r.customer?.name ?? "",
          r.engineer?.name ?? "",
          CONTRACT_TYPE_META[v.type].label,
          v.notes,
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
        case "workOrder":
          return a.visit.number.localeCompare(b.visit.number) * dir;
        case "customer":
          return (
            (a.customer?.name ?? "").localeCompare(b.customer?.name ?? "") *
            dir
          );
        case "type":
          return a.visit.type.localeCompare(b.visit.type) * dir;
        case "engineer":
          return (
            (a.engineer?.name ?? "").localeCompare(b.engineer?.name ?? "") *
            dir
          );
        case "status":
          return (
            (STATUS_ORDER.indexOf(a.visit.status) -
              STATUS_ORDER.indexOf(b.visit.status)) *
            dir
          );
        case "scheduled":
          return (
            (new Date(a.visit.scheduledAt).getTime() -
              new Date(b.visit.scheduledAt).getTime()) *
            dir
          );
        case "duration":
          return (
            ((a.visit.durationMinutes ?? -1) -
              (b.visit.durationMinutes ?? -1)) *
            dir
          );
        case "revenue":
          return (a.visit.revenue - b.visit.revenue) * dir;
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
        const v = r.visit;
        const haystack = [
          v.number,
          r.customer?.name ?? "",
          r.engineer?.name ?? "",
          CONTRACT_TYPE_META[v.type].label,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(trimmedSearch);
      })
      .slice(0, 8);
  }, [rows, trimmedSearch]);

  /* ── Top-line KPIs (full roster, not filtered slice) ────────────── */
  const kpis = useMemo(() => workOrderInsights(), [list]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Helpers ─────────────────────────────────────────────────────── */
  const onSortChange = (key: ColKey) => (dir: SortDir | null) =>
    setSort(dir === null ? null : { key, dir });
  const sortFor = (key: ColKey) => ({
    active: sort?.key === key ? sort.dir : null,
    onChange: onSortChange(key),
  });

  const filtersActive =
    filters.text.trim().length > 0 ||
    filters.types.length > 0 ||
    filters.statuses.length > 0 ||
    filters.customer.length > 0 ||
    filters.engineer.length > 0 ||
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
    onPick: (row) => router.push(`/dashboard/work-orders/${row.visit.id}`),
    resetKey: trimmedSearch,
  });

  return (
    <div className="space-y-4">
      {/* ── Top KPI strip ─────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          icon={CalendarClock}
          tone="primary"
          label={t("workOrders.insight.scheduled")}
          value={String(kpis.scheduledCount)}
          caption={t("workOrders.insight.scheduledCaption")}
        />
        <InsightCard
          icon={Wrench}
          tone={kpis.inProgressCount > 0 ? "warn" : "muted"}
          label={t("workOrders.insight.inProgress")}
          value={String(kpis.inProgressCount)}
          caption={t("workOrders.insight.inProgressCaption")}
        />
        <InsightCard
          icon={CheckCircle2}
          tone="success"
          label={t("workOrders.insight.completed")}
          value={String(kpis.completedCount)}
          caption={`${formatCurrency(kpis.completedRevenue)} · ${t(
            "workOrders.insight.completedCaption",
          )}`}
        />
        <InsightCard
          icon={CircleAlert}
          tone={kpis.overdueCount > 0 ? "destructive" : "muted"}
          label={t("workOrders.insight.overdue")}
          value={String(kpis.overdueCount)}
          caption={t("workOrders.insight.overdueCaption")}
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
              placeholder={t("workOrders.searchPlaceholder")}
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
                      const v = r.visit;
                      const sMeta = VISIT_STATUS_META[v.status];
                      const active = idx === activeSuggestion;
                      return (
                        <li key={v.id}>
                          <Link
                            href={`/dashboard/work-orders/${v.id}`}
                            onMouseEnter={() => setActiveSuggestion(idx)}
                            className={cn(
                              "flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors",
                              active
                                ? "bg-primary/15 text-foreground"
                                : "hover:bg-foreground/5",
                            )}
                          >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
                              <Wrench className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-foreground">
                                {v.number}
                              </p>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {r.customer?.name} ·{" "}
                                {CONTRACT_TYPE_META[v.type].label}
                              </p>
                            </div>
                            <StatusBadge
                              label={sMeta.label}
                              tone={sMeta.tone}
                              color={sMeta.color}
                            />
                            <span className="text-[10px] tabular-nums text-muted-foreground">
                              {formatDate(v.scheduledAt)}
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
              {t("workOrders.title").toLowerCase()}
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
          <Button size="sm" className="h-8 gap-1.5" asChild>
            <Link href="/dashboard/work-orders/new">
              <Plus className="h-3.5 w-3.5" />
              {t("workOrders.new")}
            </Link>
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
                    label={t("workOrders.column.workOrder")}
                    sort={sortFor("workOrder")}
                    filter={{
                      kind: "text",
                      value: filters.text,
                      onChange: (v) =>
                        setFilters((f) => ({ ...f, text: v })),
                      placeholder: t("workOrders.filter.numberOrCustomer"),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("workOrders.column.customer")}
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
                    label={t("workOrders.column.type")}
                    className="hidden lg:table-cell"
                    sort={sortFor("type")}
                    filter={{
                      kind: "enum",
                      value: filters.types,
                      onChange: (v) =>
                        setFilters((f) => ({
                          ...f,
                          types: v as ContractType[],
                        })),
                      options: TYPE_ORDER.map((tp) => ({
                        value: tp,
                        label: t(`contracts.type.${tp}` as const),
                        count: rows.filter((r) => r.visit.type === tp).length,
                      })),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("workOrders.column.engineer")}
                    className="hidden xl:table-cell"
                    sort={sortFor("engineer")}
                    filter={{
                      kind: "enum",
                      value: filters.engineer ? [filters.engineer] : [],
                      onChange: (v) =>
                        setFilters((f) => ({
                          ...f,
                          engineer: v[0] ?? "",
                        })),
                      options: engineerOptions,
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("workOrders.column.status")}
                    sort={sortFor("status")}
                    filter={{
                      kind: "enum",
                      value: filters.statuses,
                      onChange: (v) =>
                        setFilters((f) => ({
                          ...f,
                          statuses: v as VisitStatus[],
                        })),
                      options: STATUS_ORDER.map((s) => ({
                        value: s,
                        label: t(`workOrders.status.${s}` as const),
                        dotClass: STATUS_DOT[s],
                        count: rows.filter((r) => r.visit.status === s).length,
                      })),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("workOrders.column.scheduled")}
                    align="center"
                    className="hidden md:table-cell"
                    sort={sortFor("scheduled")}
                  />
                  <DataTableColumnHeader
                    label={t("workOrders.column.duration")}
                    align="center"
                    className="hidden lg:table-cell"
                    sort={sortFor("duration")}
                  />
                  <DataTableColumnHeader
                    label={t("workOrders.column.revenue")}
                    align="right"
                    sort={sortFor("revenue")}
                  />
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const v = r.visit;
                  const sMeta = VISIT_STATUS_META[v.status];
                  const tMeta = CONTRACT_TYPE_META[v.type];
                  const sourceLabel = v.contractId
                    ? t("workOrders.source.contract")
                    : v.quotationId
                      ? t("workOrders.source.quotation")
                      : t("workOrders.source.adhoc");
                  return (
                    <tr
                      key={v.id}
                      className="group border-b border-border/40 transition-colors hover:bg-foreground/5"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/dashboard/work-orders/${v.id}`}
                          className="block min-w-0"
                        >
                          <p className="truncate font-medium text-foreground group-hover:text-primary">
                            {v.number}
                          </p>
                          <p className="flex items-center gap-1 truncate text-[10px] text-muted-foreground">
                            <ScrollText className="h-3 w-3" />
                            <span>{sourceLabel}</span>
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
                      <td className="hidden px-2 py-2.5 lg:table-cell">
                        <StatusBadge label={tMeta.label} tone={tMeta.tone} />
                      </td>
                      <td className="hidden px-2 py-2.5 xl:table-cell">
                        {r.engineer ? (
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback
                                className="text-[9px] font-semibold"
                                style={engineerAvatarStyle(r.engineer.hue)}
                              >
                                {initials(r.engineer.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-[11px]">
                              {r.engineer.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2.5">
                        <StatusBadge
                          label={sMeta.label}
                          tone={sMeta.tone}
                          color={sMeta.color}
                        />
                      </td>
                      <td className="hidden px-2 py-2.5 text-center text-[11px] tabular-nums lg:table-cell md:table-cell">
                        <div className="flex flex-col leading-tight">
                          <span
                            className={cn(
                              v.status === "overdue"
                                ? "text-rose-600 dark:text-rose-300"
                                : "text-foreground/80",
                            )}
                          >
                            {formatDate(v.scheduledAt)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(v.scheduledAt).toLocaleTimeString(
                              undefined,
                              { hour: "numeric", minute: "2-digit" },
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-2 py-2.5 text-center text-[11px] tabular-nums lg:table-cell">
                        {v.durationMinutes ? (
                          <span className="inline-flex items-center gap-1 text-foreground/80">
                            <Clock className="h-3 w-3" />
                            {Math.floor(v.durationMinutes / 60)}h{" "}
                            {v.durationMinutes % 60}m
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {t("workOrders.duration.notLogged")}
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2.5 text-right text-xs font-semibold tabular-nums">
                        {v.revenue > 0 ? (
                          formatCurrency(v.revenue)
                        ) : (
                          <span className="font-normal text-muted-foreground">
                            —
                          </span>
                        )}
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
              {t("workOrders.empty")}
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
