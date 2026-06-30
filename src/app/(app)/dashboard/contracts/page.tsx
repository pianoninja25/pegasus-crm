"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CalendarRange,
  Plus,
  RotateCcw,
  ScrollText,
  Search,
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
import { NewContractDialog } from "@/components/contracts/NewContractDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useT } from "@/features/locale/hooks";
import { useContracts } from "@/features/service/hooks";
import {
  contractInsights,
  customerMap,
  userMap,
} from "@/features/service/seed";
import {
  CONTRACT_STATUS_META,
  CONTRACT_TYPE_META,
  FREQUENCY_META,
  type ContractStatus,
  type ContractType,
  type ServiceFrequency,
} from "@/features/service/types";
import { engineerAvatarStyle, formatCurrency, formatDate, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/* ─────────────────────────── Column model ─────────────────────────────── */

type ColKey =
  | "contract"
  | "customer"
  | "type"
  | "frequency"
  | "status"
  | "engineer"
  | "endDate"
  | "value";

const SORT_KEYS: readonly ColKey[] = [
  "contract",
  "customer",
  "type",
  "frequency",
  "status",
  "engineer",
  "endDate",
  "value",
];

interface Filters {
  text: string;
  types: ContractType[];
  statuses: ContractStatus[];
  frequencies: ServiceFrequency[];
  customer: string;
  engineer: string;
}

const EMPTY_FILTERS: Filters = {
  text: "",
  types: [],
  statuses: [],
  frequencies: [],
  customer: "",
  engineer: "",
};

const STATUS_ORDER: ContractStatus[] = [
  "draft",
  "active",
  "expiring_soon",
  "awaiting_renewal",
  "completed",
];
const TYPE_ORDER: ContractType[] = [
  "ac_cleaning",
  "preventive_maintenance",
  "spare_part_replacement",
  "ac_replacement",
  "custom",
];
const FREQUENCY_ORDER: ServiceFrequency[] = [
  "monthly",
  "quarterly",
  "biannual",
  "annual",
  "custom",
];

const STATUS_DOT: Record<ContractStatus, string> = {
  draft: "bg-slate-400",
  active: "bg-emerald-500",
  expiring_soon: "bg-amber-500",
  awaiting_renewal: "bg-sky-500",
  completed: "bg-violet-500",
};

/* ──────────────────────────── Page component ──────────────────────────── */

export default function ContractsPage() {
  const t = useT();
  const contractsQ = useContracts();
  const list = useMemo(() => contractsQ.data ?? [], [contractsQ.data]);

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

  const [createOpen, setCreateOpen] = useState(false);

  /* ── Row model ──────────────────────────────────────────────────── */
  const rows = useMemo(
    () =>
      list.map((c) => ({
        contract: c,
        customer: customerMap[c.customerId],
        engineer: userMap[c.engineerId],
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
      const c = r.contract;
      if (filters.text.trim()) {
        const needle = filters.text.trim().toLowerCase();
        if (
          !c.number.toLowerCase().includes(needle) &&
          !(r.customer?.name ?? "").toLowerCase().includes(needle)
        ) {
          return false;
        }
      }
      if (filters.types.length > 0 && !filters.types.includes(c.type)) {
        return false;
      }
      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(c.status)
      ) {
        return false;
      }
      if (
        filters.frequencies.length > 0 &&
        !filters.frequencies.includes(c.frequency)
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
          c.number,
          r.customer?.name ?? "",
          r.engineer?.name ?? "",
          CONTRACT_TYPE_META[c.type].label,
          c.notes,
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
        case "contract":
          return a.contract.number.localeCompare(b.contract.number) * dir;
        case "customer":
          return (
            (a.customer?.name ?? "").localeCompare(b.customer?.name ?? "") *
            dir
          );
        case "type":
          return a.contract.type.localeCompare(b.contract.type) * dir;
        case "frequency":
          return (
            (FREQUENCY_META[a.contract.frequency].intervalDays -
              FREQUENCY_META[b.contract.frequency].intervalDays) *
            dir
          );
        case "status":
          return (
            (STATUS_ORDER.indexOf(a.contract.status) -
              STATUS_ORDER.indexOf(b.contract.status)) *
            dir
          );
        case "engineer":
          return (
            (a.engineer?.name ?? "").localeCompare(b.engineer?.name ?? "") *
            dir
          );
        case "endDate":
          return (
            (new Date(a.contract.endDate).getTime() -
              new Date(b.contract.endDate).getTime()) *
            dir
          );
        case "value":
          return (a.contract.value - b.contract.value) * dir;
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
        const c = r.contract;
        const haystack = [
          c.number,
          r.customer?.name ?? "",
          r.engineer?.name ?? "",
          CONTRACT_TYPE_META[c.type].label,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(trimmedSearch);
      })
      .slice(0, 8);
  }, [rows, trimmedSearch]);

  /* ── Top-line KPIs (full roster, not the filtered slice) ────────── */
  const kpis = useMemo(() => contractInsights(), [list]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Helpers ───────────────────────────────────────────────────── */
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
    filters.frequencies.length > 0 ||
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
    onPick: (row) =>
      router.push(`/dashboard/contracts/${row.contract.id}`),
    resetKey: trimmedSearch,
  });

  return (
    <div className="space-y-4">
      {/* ── Top KPI strip ─────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          icon={ScrollText}
          tone="success"
          label={t("contracts.insight.active")}
          value={String(kpis.activeCount)}
          caption={t("contracts.insight.activeCaption")}
        />
        <InsightCard
          icon={TrendingUp}
          tone="primary"
          label={t("contracts.insight.recurringValue")}
          value={formatCurrency(kpis.recurringValue)}
          caption={t("contracts.insight.recurringValueCaption")}
        />
        <InsightCard
          icon={CalendarRange}
          tone={kpis.expiringSoonCount > 0 ? "warn" : "muted"}
          label={t("contracts.insight.expiringSoon")}
          value={String(kpis.expiringSoonCount)}
          caption={
            kpis.expiringSoonValue > 0
              ? `${formatCurrency(kpis.expiringSoonValue)} · ${t(
                  "contracts.insight.expiringSoonCaption",
                )}`
              : t("contracts.insight.expiringSoonCaption")
          }
        />
        <InsightCard
          icon={RotateCcw}
          tone={kpis.awaitingRenewalCount > 0 ? "accent" : "muted"}
          label={t("contracts.insight.awaitingRenewal")}
          value={String(kpis.awaitingRenewalCount)}
          caption={t("contracts.insight.awaitingRenewalCaption")}
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
              placeholder={t("contracts.searchPlaceholder")}
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
                      const c = r.contract;
                      const sMeta = CONTRACT_STATUS_META[c.status];
                      const active = idx === activeSuggestion;
                      return (
                        <li key={c.id}>
                          <Link
                            href={`/dashboard/contracts/${c.id}`}
                            onMouseEnter={() => setActiveSuggestion(idx)}
                            className={cn(
                              "flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors",
                              active
                                ? "bg-primary/15 text-foreground"
                                : "hover:bg-foreground/5",
                            )}
                          >
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
                              <ScrollText className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-foreground">
                                {c.number}
                              </p>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {r.customer?.name} ·{" "}
                                {CONTRACT_TYPE_META[c.type].label}
                              </p>
                            </div>
                            <StatusBadge
                              label={sMeta.label}
                              tone={sMeta.tone}
                              color={sMeta.color}
                            />
                            <span className="text-[10px] tabular-nums text-muted-foreground">
                              {formatCurrency(c.value)}
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
              {t("contracts.title").toLowerCase()}
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
            {t("contracts.new")}
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
                    label={t("contracts.column.contract")}
                    sort={sortFor("contract")}
                    filter={{
                      kind: "text",
                      value: filters.text,
                      onChange: (v) => setFilters((f) => ({ ...f, text: v })),
                      placeholder: t("contracts.filter.numberOrCustomer"),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("contracts.column.customer")}
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
                    label={t("contracts.column.type")}
                    className="hidden md:table-cell"
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
                        count: rows.filter((r) => r.contract.type === tp)
                          .length,
                      })),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("contracts.column.frequency")}
                    className="hidden lg:table-cell"
                    sort={sortFor("frequency")}
                    filter={{
                      kind: "enum",
                      value: filters.frequencies,
                      onChange: (v) =>
                        setFilters((f) => ({
                          ...f,
                          frequencies: v as ServiceFrequency[],
                        })),
                      options: FREQUENCY_ORDER.map((fq) => ({
                        value: fq,
                        label: t(`contracts.frequency.${fq}` as const),
                        count: rows.filter((r) => r.contract.frequency === fq)
                          .length,
                      })),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("contracts.column.status")}
                    sort={sortFor("status")}
                    filter={{
                      kind: "enum",
                      value: filters.statuses,
                      onChange: (v) =>
                        setFilters((f) => ({
                          ...f,
                          statuses: v as ContractStatus[],
                        })),
                      options: STATUS_ORDER.map((s) => ({
                        value: s,
                        label: t(`contracts.status.${s}` as const),
                        dotClass: STATUS_DOT[s],
                        count: rows.filter((r) => r.contract.status === s)
                          .length,
                      })),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("contracts.column.engineer")}
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
                    label={t("contracts.column.coverage")}
                    align="center"
                    className="hidden lg:table-cell"
                    sort={sortFor("endDate")}
                  />
                  <DataTableColumnHeader
                    label={t("contracts.column.value")}
                    align="right"
                    sort={sortFor("value")}
                  />
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const c = r.contract;
                  const sMeta = CONTRACT_STATUS_META[c.status];
                  const tMeta = CONTRACT_TYPE_META[c.type];
                  return (
                    <tr
                      key={c.id}
                      className="group border-b border-border/40 transition-colors hover:bg-foreground/5"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/dashboard/contracts/${c.id}`}
                          className="block min-w-0"
                        >
                          <p className="truncate font-medium text-foreground group-hover:text-primary">
                            {c.number}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {formatDate(c.startDate)} →{" "}
                            {formatDate(c.endDate, { withYear: true })}
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
                      <td className="hidden px-2 py-2.5 md:table-cell">
                        <StatusBadge label={tMeta.label} tone={tMeta.tone} />
                      </td>
                      <td className="hidden px-2 py-2.5 text-[11px] text-muted-foreground lg:table-cell">
                        {t(`contracts.frequency.${c.frequency}` as const)}
                      </td>
                      <td className="px-2 py-2.5">
                        <StatusBadge
                          label={sMeta.label}
                          tone={sMeta.tone}
                          color={sMeta.color}
                        />
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
                      <td className="hidden px-2 py-2.5 text-center text-[11px] tabular-nums lg:table-cell">
                        <span
                          className={cn(
                            c.status === "expiring_soon"
                              ? "text-amber-600 dark:text-amber-300"
                              : "text-muted-foreground",
                          )}
                        >
                          {formatDate(c.endDate, { withYear: true })}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-right text-xs font-semibold tabular-nums">
                        {formatCurrency(c.value)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {sorted.length === 0 && (
            <div className="px-4 py-12 text-center text-xs text-muted-foreground">
              {t("contracts.empty")}
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

      <NewContractDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
