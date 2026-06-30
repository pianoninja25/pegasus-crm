"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  HandshakeIcon,
  LayoutList,
  Mail,
  MapIcon,
  MapPin,
  Phone,
  Plus,
  Search,
  Sparkles,
  Users,
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
import { useSearchSuggestions } from "@/components/common/useSearchSuggestions";
import { useTableUrlState } from "@/components/common/useTableUrlState";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  CustomersMap,
  TYPE_COLOR,
} from "@/components/customers/CustomersMap";
import { NewCustomerDialog } from "@/components/customers/NewCustomerDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import type { DictKey } from "@/features/locale/dictionary";
import { useT } from "@/features/locale/hooks";
import { useCustomers } from "@/features/service/hooks";
import {
  customerInsights,
  customerLifecycle,
  lifecycleByCustomer,
  unitsByCustomer,
} from "@/features/service/seed";
import {
  CUSTOMER_LIFECYCLE_META,
  CUSTOMER_TYPE_META,
  type Customer,
  type CustomerLifecycle,
  type CustomerType,
} from "@/features/service/types";
import { formatCurrency, formatNumber, initials, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

type ViewMode = "table" | "map";

/** Maps a customer-type enum value to the matching translation key. */
const TYPE_LABEL_KEY: Record<CustomerType, DictKey> = {
  residential: "customer.type.residential",
  commercial: "customer.type.commercial",
  industrial: "customer.type.industrial",
};

/** Maps a customer-lifecycle enum value to the matching translation key. */
const STAGE_LABEL_KEY: Record<CustomerLifecycle, DictKey> = {
  prospect: "customers.stage.prospect",
  active: "customers.stage.active",
  vip: "customers.stage.vip",
  dormant: "customers.stage.dormant",
};

const STAGE_ORDER: CustomerLifecycle[] = [
  "vip",
  "active",
  "prospect",
  "dormant",
];

/**
 * Returns the cached lifecycle stage for a known customer, or computes it
 * on the fly for a customer not in the seed index (e.g. one just created
 * via the dialog).
 */
function getCustomerStage(customer: Customer): CustomerLifecycle {
  return lifecycleByCustomer[customer.id] ?? customerLifecycle(customer);
}

/* ─────────────────────────── Column model ─────────────────────────────── */

type ColKey =
  | "customer"
  | "stage"
  | "type"
  | "contact"
  | "location"
  | "units"
  | "ltv"
  | "lastTouchedAt";

const SORT_KEYS: readonly ColKey[] = [
  "customer",
  "stage",
  "type",
  "contact",
  "location",
  "units",
  "ltv",
  "lastTouchedAt",
];

interface Filters {
  customer: string;
  contact: string;
  type: string[];
  stage: string[];
  location: string[];
}

const EMPTY_FILTERS: Filters = {
  customer: "",
  contact: "",
  type: [],
  stage: [],
  location: [],
};

/* ─────────────────────────── Page ─────────────────────────────────────── */

export default function CustomersPage() {
  const customersQ = useCustomers();
  const customers = useMemo(() => customersQ.data ?? [], [customersQ.data]);
  const t = useT();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Source-of-truth URL state — sort, filters, page, page size and the
   * global search query all live in `?…` params. A refresh, share, or
   * browser back/forward replays the same view.
   */
  const { state, setSort, setPage, setPageSize, setGlobalSearch, setFilters } =
    useTableUrlState<ColKey, Filters>({
      defaults: {
        // Fresh pages load unsorted — table reflects seed order. Sort only
        // applies after the user explicitly clicks a column header.
        sort: null,
        page: 1,
        pageSize: PAGE_SIZES[0],
        globalSearch: "",
        filters: EMPTY_FILTERS,
      },
      validSortKeys: SORT_KEYS,
      validPageSizes: PAGE_SIZES,
      preserveKeys: ["view"],
    });
  const { sort, filters, page, pageSize: pageSizeRaw, globalSearch } = state;
  /** Hook returns `number`; we know the URL has been validated against PAGE_SIZES. */
  const pageSize = pageSizeRaw as PageSize;

  /** Read the persisted view from the URL (?view=map) on first render. */
  const [view, setView] = useState<ViewMode>(
    searchParams.get("view") === "map" ? "map" : "table",
  );
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  /**
   * Keep the URL in sync with the active view so a refresh / share / browser
   * back-button preserves the choice. We only write when the URL is out of
   * sync to avoid `router.replace` loops.
   */
  useEffect(() => {
    const want = view === "map" ? "map" : null;
    const have = searchParams.get("view");
    if (want === have) return;
    const params = new URLSearchParams(searchParams.toString());
    if (want) params.set("view", want);
    else params.delete("view");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [view, pathname, router, searchParams]);

  /** Reverse sync — when the URL changes (e.g. browser back), follow it. */
  useEffect(() => {
    const param = searchParams.get("view");
    const next: ViewMode = param === "map" ? "map" : "table";
    setView((current) => (current === next ? current : next));
  }, [searchParams]);

  /* ── derive filter dropdown options from the raw dataset ── */
  const typeOptions = useMemo(() => {
    const counts: Record<CustomerType, number> = {
      residential: 0,
      commercial: 0,
      industrial: 0,
    };
    for (const c of customers) counts[c.type] += 1;
    return (Object.keys(counts) as CustomerType[]).map((k) => ({
      value: k,
      label: t(TYPE_LABEL_KEY[k]),
      count: counts[k],
      dotClass:
        k === "residential"
          ? "bg-sky-500"
          : k === "commercial"
            ? "bg-violet-500"
            : "bg-amber-500",
    }));
  }, [customers, t]);

  const cityOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of customers) {
      counts.set(c.city, (counts.get(c.city) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([city, count]) => ({ value: city, label: city, count }));
  }, [customers]);

  /* ── Per-customer stage map (computed once, falls back for new rows) ── */
  const stageByCustomer = useMemo(() => {
    const map: Record<string, CustomerLifecycle> = {};
    for (const c of customers) map[c.id] = getCustomerStage(c);
    return map;
  }, [customers]);

  const stageOptions = useMemo(() => {
    const counts: Record<CustomerLifecycle, number> = {
      prospect: 0,
      active: 0,
      vip: 0,
      dormant: 0,
    };
    for (const c of customers) counts[stageByCustomer[c.id]] += 1;
    return STAGE_ORDER.map((s) => ({
      value: s,
      label: t(STAGE_LABEL_KEY[s]),
      count: counts[s],
      dotClass: CUSTOMER_LIFECYCLE_META[s].dotClass,
    }));
  }, [customers, stageByCustomer, t]);

  /* ── apply filters ── */
  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (filters.type.length > 0 && !filters.type.includes(c.type)) {
        return false;
      }
      if (
        filters.stage.length > 0 &&
        !filters.stage.includes(stageByCustomer[c.id])
      ) {
        return false;
      }
      if (filters.location.length > 0 && !filters.location.includes(c.city)) {
        return false;
      }
      if (filters.customer.trim()) {
        const q = filters.customer.trim().toLowerCase();
        if (
          !c.name.toLowerCase().includes(q) &&
          !c.contactPerson.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (filters.contact.trim()) {
        const q = filters.contact.trim().toLowerCase();
        if (
          !c.phone.toLowerCase().includes(q) &&
          !c.email.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (globalSearch.trim()) {
        const q = globalSearch.trim().toLowerCase();
        const haystack = [
          c.name,
          c.contactPerson,
          c.phone,
          c.email,
          c.city,
          c.address,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [customers, filters, globalSearch, stageByCustomer]);

  /* ── apply sort ── */
  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort.key) {
        case "customer":
          return a.name.localeCompare(b.name) * dir;
        case "stage":
          return (
            (STAGE_ORDER.indexOf(stageByCustomer[a.id]) -
              STAGE_ORDER.indexOf(stageByCustomer[b.id])) *
            dir
          );
        case "type":
          return a.type.localeCompare(b.type) * dir;
        case "contact":
          return a.email.localeCompare(b.email) * dir;
        case "location":
          return a.city.localeCompare(b.city) * dir;
        case "units": {
          const av = unitsByCustomer[a.id]?.length ?? 0;
          const bv = unitsByCustomer[b.id]?.length ?? 0;
          return (av - bv) * dir;
        }
        case "ltv":
          return (a.lifetimeValue - b.lifetimeValue) * dir;
        case "lastTouchedAt":
          return (
            (new Date(a.lastTouchedAt).getTime() -
              new Date(b.lastTouchedAt).getTime()) *
            dir
          );
      }
    });
  }, [filtered, sort, stageByCustomer]);

  /* ── paginate ── */
  const { visible, totalPages, safePage, rangeStart, rangeEnd } = paginate(
    sorted,
    page,
    pageSize,
  );

  /* ── live search suggestions ── */
  const trimmedSearch = globalSearch.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (trimmedSearch.length < 2) return [] as Customer[];
    return customers
      .filter((c) => {
        const haystack = [
          c.name,
          c.contactPerson,
          c.phone,
          c.email,
          c.city,
          c.address,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(trimmedSearch);
      })
      .slice(0, 8);
  }, [customers, trimmedSearch]);

  const handlePickSuggestion = (c: Customer) => {
    setGlobalSearch(c.name);
    if (view === "map") {
      setSelectedMapId(c.id);
    } else {
      router.push(`/dashboard/customers/${c.id}`);
    }
  };

  const {
    open: searchOpen,
    setOpen: setSearchOpen,
    activeIndex: activeSuggestion,
    setActiveIndex: setActiveSuggestion,
    boxRef: searchBoxRef,
    onKeyDown: onSearchKeyDown,
  } = useSearchSuggestions({
    suggestions,
    onPick: handlePickSuggestion,
    resetKey: trimmedSearch,
  });

  /* ── enterprise summary metrics (computed from raw, not filtered) ── */
  const insights = useMemo(() => customerInsights(), []);
  const contractAttachPct =
    insights.total === 0 ? 0 : (insights.onContract / insights.total) * 100;
  const newDelta =
    insights.newLast30 - insights.newPrev30;
  const acquisitionPct =
    insights.newPrev30 === 0
      ? insights.newLast30 > 0
        ? 100
        : 0
      : (newDelta / insights.newPrev30) * 100;

  /* ── sort handler that toggles dir / clears when the same key is set ── */
  const onSortChange = (key: ColKey) => (dir: SortDir | null) => {
    setSort(dir === null ? null : { key, dir });
  };
  const sortFor = (key: ColKey) => ({
    active: sort?.key === key ? sort.dir : null,
    onChange: onSortChange(key),
  });

  const filtersActive =
    filters.customer.trim().length > 0 ||
    filters.contact.trim().length > 0 ||
    filters.type.length > 0 ||
    filters.stage.length > 0 ||
    filters.location.length > 0 ||
    globalSearch.trim().length > 0;

  const clearAllFilters = () => {
    setFilters(EMPTY_FILTERS);
    setGlobalSearch("");
  };

  return (
    <div className="space-y-4">
      {/* ── Enterprise summary (one hero metric per card) ── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          icon={Users}
          tone="primary"
          label={t("customers.insight.activeAccounts")}
          value={formatNumber(insights.total, { compact: false })}
          caption={
            insights.newLast30 > 0
              ? `${insights.newLast30} ${t("customers.insight.newInLast30Suffix")}`
              : t("customers.insight.noNew")
          }
          delta={
            insights.newPrev30 === 0 && insights.newLast30 === 0
              ? undefined
              : {
                  value: acquisitionPct,
                  label: `${acquisitionPct >= 0 ? "+" : ""}${acquisitionPct.toFixed(0)}% MoM`,
                }
          }
        />

        <InsightCard
          icon={HandshakeIcon}
          tone="success"
          label={t("customers.insight.onRecurring")}
          value={`${contractAttachPct.toFixed(0)}%`}
          caption={`${insights.onContract} ${t("common.of")} ${insights.total} ${t("customers.insight.accountsLower")} · ${formatCurrency(insights.recurringRevenueUSD)} ARR`}
        />

        <InsightCard
          icon={Sparkles}
          tone="accent"
          label={t("customers.insight.totalRevenue")}
          value={formatCurrency(insights.totalLifetimeValueUSD)}
          caption={`${t("customers.insight.avg")} ${formatCurrency(insights.averageLifetimeValueUSD)} ${t("customers.insight.perAccount")}`}
        />

        <InsightCard
          icon={Wrench}
          tone="warn"
          label={t("customers.insight.unitsServiced")}
          value={formatNumber(insights.unitsUnderManagement, { compact: false })}
          caption={`${(
            insights.unitsUnderManagement / Math.max(insights.total, 1)
          ).toFixed(1)} ${t("customers.insight.avgPerAccount")}`}
        />
      </div>

      {/* ── Toolbar: search · count · view toggle · new customer ── */}
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
              placeholder={t("customers.searchPlaceholder")}
              className="h-8 w-64 pl-9 text-xs"
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
                    {suggestions.map((c, idx) => {
                      const active = idx === activeSuggestion;
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setActiveSuggestion(idx)}
                            onClick={() => handlePickSuggestion(c)}
                            className={cn(
                              "flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors",
                              active
                                ? "bg-primary/15 text-foreground"
                                : "hover:bg-foreground/5",
                            )}
                          >
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                                {initials(c.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-foreground">
                                {c.name}
                              </p>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {c.contactPerson} ·{" "}
                                <span
                                  style={{ color: TYPE_COLOR[c.type] }}
                                  className="font-medium"
                                >
                                  {t(TYPE_LABEL_KEY[c.type])}
                                </span>{" "}
                                · {c.city}
                              </p>
                            </div>
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {view === "map" ? (
                                <MapIcon className="h-3 w-3" />
                              ) : (
                                <LayoutList className="h-3 w-3" />
                              )}
                            </span>
                          </button>
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
              {t("common.of")} {customers.length}{" "}
              {t("common.customers").toLowerCase()}
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
          <div
            role="tablist"
            aria-label={t("common.viewAll")}
            className="inline-flex items-center rounded-md border border-border/60 bg-card/60 p-0.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === "table"}
              onClick={() => setView("table")}
              className={cn(
                "inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors",
                view === "table"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutList className="h-3.5 w-3.5" /> {t("common.table")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "map"}
              onClick={() => setView("map")}
              className={cn(
                "inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors",
                view === "map"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <MapIcon className="h-3.5 w-3.5" /> {t("common.map")}
            </button>
          </div>
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1.5"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            {t("customers.new")}
          </Button>
        </div>
      </div>

      <NewCustomerDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(c) => {
          setView("map");
          setSelectedMapId(c.id);
        }}
      />

      {/* ── Map view ── */}
      {view === "map" && (
        <CustomersMapView
          customers={sorted}
          selectedId={selectedMapId}
          onSelect={setSelectedMapId}
          t={t}
        />
      )}

      {/* ── Table ── */}
      {view === "table" && (
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-background/30">
                <tr>
                  <DataTableColumnHeader
                    label={t("common.customer")}
                    sort={sortFor("customer")}
                    filter={{
                      kind: "text",
                      value: filters.customer,
                      onChange: (v) =>
                        setFilters((f) => ({ ...f, customer: v })),
                      placeholder: t("customers.filter.nameOrContact"),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("customers.stage.column")}
                    sort={sortFor("stage")}
                    filter={{
                      kind: "enum",
                      value: filters.stage,
                      onChange: (v) =>
                        setFilters((f) => ({ ...f, stage: v })),
                      options: stageOptions,
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("customers.column.type")}
                    sort={sortFor("type")}
                    filter={{
                      kind: "enum",
                      value: filters.type,
                      onChange: (v) => setFilters((f) => ({ ...f, type: v })),
                      options: typeOptions,
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("customers.column.contact")}
                    className="hidden md:table-cell"
                    filter={{
                      kind: "text",
                      value: filters.contact,
                      onChange: (v) =>
                        setFilters((f) => ({ ...f, contact: v })),
                      placeholder: t("customers.filter.phoneOrEmail"),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("customers.column.location")}
                    className="hidden lg:table-cell"
                    sort={sortFor("location")}
                    filter={{
                      kind: "enum",
                      value: filters.location,
                      onChange: (v) =>
                        setFilters((f) => ({ ...f, location: v })),
                      options: cityOptions,
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("customers.column.units")}
                    align="center"
                    sort={sortFor("units")}
                  />
                  <DataTableColumnHeader
                    label={t("customers.column.revenue")}
                    align="center"
                    sort={sortFor("ltv")}
                  />
                  <DataTableColumnHeader
                    label={t("customers.column.lastContact")}
                    align="center"
                    className="hidden md:table-cell"
                    sort={sortFor("lastTouchedAt")}
                  />
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => {
                  const meta = CUSTOMER_TYPE_META[c.type];
                  const typeLabel = t(TYPE_LABEL_KEY[c.type]);
                  const stage = stageByCustomer[c.id];
                  const stageMeta = CUSTOMER_LIFECYCLE_META[stage];
                  const stageLabel = t(STAGE_LABEL_KEY[stage]);
                  const units = unitsByCustomer[c.id]?.length ?? 0;
                  return (
                    <tr
                      key={c.id}
                      className="group border-b border-border/40 transition-colors hover:bg-foreground/5"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/dashboard/customers/${c.id}`}
                          className="flex items-center gap-2.5"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                              {initials(c.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground group-hover:text-primary">
                              {c.name}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {c.contactPerson}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-2 py-2.5">
                        <StatusBadge
                          label={stageLabel}
                          tone={stageMeta.tone}
                          color={stageMeta.color}
                        />
                      </td>
                      <td className="px-2 py-2.5">
                        <StatusBadge label={typeLabel} tone={meta.tone} />
                      </td>
                      <td className="hidden px-2 py-2.5 text-[11px] text-muted-foreground md:table-cell">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {c.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {c.email}
                        </div>
                      </td>
                      <td className="hidden px-2 py-2.5 text-[11px] text-muted-foreground lg:table-cell">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {c.city}, {c.country}
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <Badge variant="outline" className="h-5 text-[10px]">
                          {units}
                        </Badge>
                      </td>
                      <td className="px-2 py-2.5 text-center text-xs font-semibold tabular-nums">
                        {formatCurrency(c.lifetimeValue)}
                      </td>
                      <td className="hidden px-2 py-2.5 text-center text-[10px] text-muted-foreground md:table-cell">
                        {relativeTime(c.lastTouchedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {sorted.length === 0 && (
            <div className="px-4 py-12 text-center text-xs text-muted-foreground">
              {t("customers.empty")}
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {/* ── Pagination (table view only) ── */}
      {view === "table" && (
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
      )}
    </div>
  );
}

/* ───────────────────────── Map view ──────────────────────────────────── */

function CustomersMapView({
  customers,
  selectedId,
  onSelect,
  t,
}: {
  customers: Customer[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  t: (key: DictKey) => string;
}) {
  const selected = customers.find((c) => c.id === selectedId) ?? null;
  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-3 p-3 md:grid-cols-[2fr_1fr]">
        <CustomersMap
          customers={customers}
          selectedId={selectedId}
          onSelect={onSelect}
          heightClassName="h-[520px]"
        />
        <div className="flex h-[520px] flex-col">
          {selected ? (
            <SelectedCustomerPanel selected={selected} t={t} />
          ) : (
            <MapSummary customers={customers} t={t} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SelectedCustomerPanel({
  selected,
  t,
}: {
  selected: Customer;
  t: (key: DictKey) => string;
}) {
  return (
    <div className="flex h-full flex-col gap-2.5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {t("customers.map.selectedPin")}
      </p>
      <div className="space-y-2 rounded-lg border border-border/60 bg-card/60 p-3">
        <Link
          href={`/dashboard/customers/${selected.id}`}
          className="flex items-start gap-3"
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
              {initials(selected.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold hover:text-primary">
              {selected.name}
            </p>
            <p className="truncate text-[11px] text-muted-foreground">
              {selected.contactPerson}
            </p>
            <Badge
              variant="outline"
              className="mt-1 h-5 text-[10px]"
              style={{
                borderColor: `${TYPE_COLOR[selected.type]}66`,
                color: TYPE_COLOR[selected.type],
              }}
            >
              {t(TYPE_LABEL_KEY[selected.type])}
            </Badge>
          </div>
        </Link>
        <Separator />
        <p className="text-xs">
          <MapPin className="mr-1 inline h-3 w-3 text-muted-foreground" />
          {selected.address}, {selected.city}
        </p>
        <p className="text-xs">
          <Phone className="mr-1 inline h-3 w-3 text-muted-foreground" />
          {selected.phone}
        </p>
        <p className="text-xs">
          <Mail className="mr-1 inline h-3 w-3 text-muted-foreground" />
          {selected.email}
        </p>
        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
          <div>
            <p className="text-muted-foreground">{t("customers.column.units")}</p>
            <p className="font-semibold tabular-nums">
              {unitsByCustomer[selected.id]?.length ?? 0}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">
              {t("customers.column.revenue")}
            </p>
            <p className="font-semibold tabular-nums">
              {formatCurrency(selected.lifetimeValue)}
            </p>
          </div>
        </div>
        <Button asChild size="sm" className="mt-1 w-full">
          <Link href={`/dashboard/customers/${selected.id}`}>
            {t("customers.map.openProfile")}
          </Link>
        </Button>
      </div>
      <p className="mt-auto text-[11px] text-muted-foreground">
        {t("customers.map.tapAnother")}
      </p>
    </div>
  );
}

/**
 * Enterprise-grade summary panel rendered when nothing is selected on the
 * map. Surfaces aggregate stats that respect the active table filters so
 * the user always sees something actionable.
 */
function MapSummary({
  customers,
  t,
}: {
  customers: Customer[];
  t: (key: DictKey) => string;
}) {
  const total = customers.length;

  const typeBreakdown = useMemo(() => {
    const counts: Record<CustomerType, number> = {
      residential: 0,
      commercial: 0,
      industrial: 0,
    };
    for (const c of customers) counts[c.type] += 1;
    return (Object.keys(counts) as CustomerType[]).map((k) => ({
      type: k,
      count: counts[k],
      pct: total === 0 ? 0 : (counts[k] / total) * 100,
      color: TYPE_COLOR[k],
      label: t(TYPE_LABEL_KEY[k]),
    }));
  }, [customers, total, t]);

  const topCities = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of customers) {
      counts.set(c.city, (counts.get(c.city) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));
  }, [customers]);

  const topCityMax = topCities[0]?.count ?? 1;

  const cityCount = useMemo(
    () => new Set(customers.map((c) => c.city)).size,
    [customers],
  );
  const countryCount = useMemo(
    () => new Set(customers.map((c) => c.country)).size,
    [customers],
  );
  const unitsCount = useMemo(
    () =>
      customers.reduce(
        (sum, c) => sum + (unitsByCustomer[c.id]?.length ?? 0),
        0,
      ),
    [customers],
  );

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto pr-0.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {t("customers.map.summary")}
        </p>
        <p className="text-[10px] text-muted-foreground tabular-nums">
          {total} {t("common.customers").toLowerCase()}
        </p>
      </div>

      {/* ── Coverage triplet ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <CoverageTile
          icon={MapPin}
          value={String(cityCount)}
          label={t("customers.map.cities")}
        />
        <CoverageTile
          icon={MapIcon}
          value={String(countryCount)}
          label={t("customers.map.countries")}
        />
        <CoverageTile
          icon={Wrench}
          value={String(unitsCount)}
          label={t("customers.map.unitsCovered")}
        />
      </div>

      {/* ── Mix by type ───────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {t("customers.map.mixByType")}
        </p>
        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
          {typeBreakdown.map((b) =>
            b.pct > 0 ? (
              <div
                key={b.type}
                style={{ width: `${b.pct}%`, backgroundColor: b.color }}
                title={`${b.label} · ${b.count}`}
              />
            ) : null,
          )}
        </div>
        <div className="space-y-1 pt-0.5">
          {typeBreakdown.map((b) => (
            <div
              key={b.type}
              className="flex items-center justify-between text-[11px]"
            >
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: b.color }}
                />
                {b.label}
              </span>
              <span className="tabular-nums text-foreground">
                {b.count}{" "}
                <span className="text-muted-foreground">
                  · {b.pct.toFixed(0)}%
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top cities ────────────────────────────────────────────── */}
      {topCities.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {t("customers.map.topCities")}
          </p>
          <ul className="space-y-1">
            {topCities.map((tc) => {
              const pct = (tc.count / topCityMax) * 100;
              return (
                <li
                  key={tc.city}
                  className="flex items-center gap-2 text-[11px]"
                >
                  <span className="w-20 truncate font-medium text-foreground">
                    {tc.city}
                  </span>
                  <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-primary/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right tabular-nums text-muted-foreground">
                    {tc.count}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="mt-auto text-[11px] text-muted-foreground">
        {t("customers.map.exploreHint")}
      </p>
    </div>
  );
}

function CoverageTile({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof MapPin;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-md border border-border/60 bg-card/40 p-2">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <p className="mt-1 text-sm font-semibold tabular-nums leading-none text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
