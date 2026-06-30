"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  CalendarClock,
  Plus,
  Search,
  Star,
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
import { NewEngineerDialog } from "@/components/engineers/NewEngineerDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useT } from "@/features/locale/hooks";
import { useEngineers } from "@/features/service/hooks";
import { engineerStats } from "@/features/service/seed";
import { engineerAvatarStyle, formatCurrency, formatNumber, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

/* ─────────────────────────── Column model ─────────────────────────────── */

type ColKey =
  | "engineer"
  | "experience"
  | "completed"
  | "scheduled"
  | "hours"
  | "rating"
  | "revenue";

const SORT_KEYS: readonly ColKey[] = [
  "engineer",
  "experience",
  "completed",
  "scheduled",
  "hours",
  "rating",
  "revenue",
];

interface Filters {
  name: string;
  skills: string[];
}

const EMPTY_FILTERS: Filters = { name: "", skills: [] };

export default function EngineersPage() {
  const t = useT();
  const engineersQ = useEngineers();
  const engineers = useMemo(() => engineersQ.data ?? [], [engineersQ.data]);

  /** Window = current calendar month. */
  const monthWindow = useMemo(() => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    return { start, end };
  }, []);

  /** Engineer row = roster record joined with their MTD productivity stats. */
  const rows = useMemo(
    () =>
      engineers.map((e) => {
        const stats = engineerStats(e.id, monthWindow.start, monthWindow.end);
        return {
          engineer: e,
          completedJobs: stats.completedJobs,
          scheduledJobs: stats.scheduledJobs,
          serviceHours: stats.serviceHours,
          revenue: stats.revenue,
          rating: stats.rating,
        };
      }),
    [engineers, monthWindow],
  );

  const [createOpen, setCreateOpen] = useState(false);

  /**
   * URL-backed table state. Sort, filters, page, page size and global
   * search live in `?…` params so a refresh / share preserves the view.
   */
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


  /* ── derive filter dropdown options ─────────────────────────────────── */
  const skillOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      for (const skill of r.engineer.skills ?? []) {
        counts.set(skill, (counts.get(skill) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([skill, count]) => ({ value: skill, label: skill, count }));
  }, [rows]);

  /* ── apply filters ──────────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const eng = r.engineer;
      if (filters.name.trim()) {
        const q = filters.name.trim().toLowerCase();
        if (
          !eng.name.toLowerCase().includes(q) &&
          !eng.title.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (filters.skills.length > 0) {
        const skills = eng.skills ?? [];
        if (!filters.skills.every((s) => skills.includes(s))) return false;
      }
      if (globalSearch.trim()) {
        const q = globalSearch.trim().toLowerCase();
        const haystack = [
          eng.name,
          eng.title,
          eng.email,
          eng.phone,
          ...(eng.skills ?? []),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [rows, filters, globalSearch]);

  /* ── apply sort ─────────────────────────────────────────────────────── */
  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort.key) {
        case "engineer":
          return a.engineer.name.localeCompare(b.engineer.name) * dir;
        case "experience":
          return (
            ((a.engineer.experienceYears ?? 0) -
              (b.engineer.experienceYears ?? 0)) *
            dir
          );
        case "completed":
          return (a.completedJobs - b.completedJobs) * dir;
        case "scheduled":
          return (a.scheduledJobs - b.scheduledJobs) * dir;
        case "hours":
          return (a.serviceHours - b.serviceHours) * dir;
        case "rating":
          return (a.rating - b.rating) * dir;
        case "revenue":
          return (a.revenue - b.revenue) * dir;
      }
    });
  }, [filtered, sort]);

  /* ── paginate ───────────────────────────────────────────────────────── */
  const { visible, totalPages, safePage, rangeStart, rangeEnd } = paginate(
    sorted,
    page,
    pageSize,
  );

  /* ── live search suggestions ────────────────────────────────────────── */
  const trimmedSearch = globalSearch.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (trimmedSearch.length < 2) return [] as typeof rows;
    return rows
      .filter((r) => {
        const eng = r.engineer;
        const haystack = [
          eng.name,
          eng.title,
          eng.email,
          ...(eng.skills ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(trimmedSearch);
      })
      .slice(0, 8);
  }, [rows, trimmedSearch]);

  /* ── top-line MTD metrics (computed from the full roster) ──────────── */
  const totalEngineers = rows.length;
  const totalCompleted = rows.reduce((s, r) => s + r.completedJobs, 0);
  const totalHours = rows.reduce((s, r) => s + r.serviceHours, 0);
  const avgRating = useMemo(() => {
    const rated = rows.filter((r) => r.rating > 0);
    return rated.length === 0
      ? 0
      : rated.reduce((s, r) => s + r.rating, 0) / rated.length;
  }, [rows]);

  /* ── sort handler that toggles dir / clears when the same key is set ── */
  const onSortChange = (key: ColKey) => (dir: SortDir | null) => {
    setSort(dir === null ? null : { key, dir });
  };
  const sortFor = (key: ColKey) => ({
    active: sort?.key === key ? sort.dir : null,
    onChange: onSortChange(key),
  });

  const filtersActive =
    filters.name.trim().length > 0 ||
    filters.skills.length > 0 ||
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
    onPick: (row) => router.push(`/dashboard/engineers/${row.engineer.id}`),
    resetKey: trimmedSearch,
  });

  return (
    <div className="space-y-4">
      {/* ── Top KPI strip ─────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InsightCard
          icon={Users}
          tone="primary"
          label={t("engineers.insight.activeRoster")}
          value={formatNumber(totalEngineers, { compact: false })}
          caption={t("engineers.insight.activeRosterCaption")}
        />
        <InsightCard
          icon={Wrench}
          tone="success"
          label={t("engineers.insight.jobsCompleted")}
          value={formatNumber(totalCompleted, { compact: false })}
          caption={t("engineers.insight.jobsCompletedCaption")}
        />
        <InsightCard
          icon={CalendarClock}
          tone="accent"
          label={t("engineers.insight.serviceHours")}
          value={`${totalHours.toFixed(1)}h`}
          caption={t("engineers.insight.serviceHoursCaption")}
        />
        <InsightCard
          icon={Star}
          tone="warn"
          label={t("engineers.insight.avgRating")}
          value={avgRating > 0 ? `${avgRating.toFixed(1)}/5` : "—"}
          caption={t("engineers.insight.avgRatingCaption")}
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
              placeholder={t("engineers.searchPlaceholder")}
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
                    {suggestions.map((r, idx) => {
                      const eng = r.engineer;
                      const active = idx === activeSuggestion;
                      return (
                        <li key={eng.id}>
                          <Link
                            href={`/dashboard/engineers/${eng.id}`}
                            onMouseEnter={() => setActiveSuggestion(idx)}
                            className={cn(
                              "flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors",
                              active
                                ? "bg-primary/15 text-foreground"
                                : "hover:bg-foreground/5",
                            )}
                          >
                            <Avatar className="h-7 w-7">
                              <AvatarFallback
                                className="text-[10px] font-semibold"
                                style={engineerAvatarStyle(eng.hue)}
                              >
                                {initials(eng.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-foreground">
                                {eng.name}
                              </p>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {eng.title} · {r.completedJobs}{" "}
                                {t("engineers.column.completed").toLowerCase()}
                              </p>
                            </div>
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] tabular-nums text-muted-foreground">
                              {r.rating.toFixed(1)}
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
              {t("common.engineers").toLowerCase()}
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
            {t("engineers.new")}
          </Button>
        </div>
      </div>

      {/* ── Roster table ──────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-background/30">
                <tr>
                  <DataTableColumnHeader
                    label={t("engineers.column.engineer")}
                    sort={sortFor("engineer")}
                    filter={{
                      kind: "text",
                      value: filters.name,
                      onChange: (v) =>
                        setFilters((f) => ({ ...f, name: v })),
                      placeholder: t("engineers.filter.nameOrTitle"),
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("engineers.column.skills")}
                    className="hidden md:table-cell"
                    filter={{
                      kind: "enum",
                      value: filters.skills,
                      onChange: (v) =>
                        setFilters((f) => ({ ...f, skills: v })),
                      options: skillOptions,
                    }}
                  />
                  <DataTableColumnHeader
                    label={t("engineers.column.experience")}
                    align="center"
                    className="hidden lg:table-cell"
                    sort={sortFor("experience")}
                  />
                  <DataTableColumnHeader
                    label={t("engineers.column.completed")}
                    align="center"
                    sort={sortFor("completed")}
                  />
                  <DataTableColumnHeader
                    label={t("engineers.column.scheduled")}
                    align="center"
                    className="hidden md:table-cell"
                    sort={sortFor("scheduled")}
                  />
                  <DataTableColumnHeader
                    label={t("engineers.column.hours")}
                    align="center"
                    className="hidden sm:table-cell"
                    sort={sortFor("hours")}
                  />
                  <DataTableColumnHeader
                    label={t("engineers.column.rating")}
                    align="center"
                    sort={sortFor("rating")}
                  />
                  <DataTableColumnHeader
                    label={t("engineers.column.revenue")}
                    align="center"
                    sort={sortFor("revenue")}
                  />
                </tr>
              </thead>
              <tbody>
                {visible.map((r) => {
                  const eng = r.engineer;
                  const skills = eng.skills ?? [];
                  const visibleSkills = skills.slice(0, 3);
                  const moreSkills = skills.length - visibleSkills.length;
                  return (
                    <tr
                      key={eng.id}
                      className="group border-b border-border/40 transition-colors hover:bg-foreground/5"
                    >
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/dashboard/engineers/${eng.id}`}
                          className="flex items-center gap-2.5"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback
                              className="text-[10px] font-semibold"
                              style={engineerAvatarStyle(eng.hue)}
                            >
                              {initials(eng.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground group-hover:text-primary">
                              {eng.name}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {eng.title}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="hidden px-2 py-2.5 md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {visibleSkills.map((s) => (
                            <Badge
                              key={s}
                              variant="outline"
                              className="h-5 text-[10px]"
                            >
                              {s}
                            </Badge>
                          ))}
                          {moreSkills > 0 && (
                            <Badge
                              variant="outline"
                              className="h-5 text-[10px] text-muted-foreground"
                            >
                              +{moreSkills}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="hidden px-2 py-2.5 text-center text-xs tabular-nums lg:table-cell">
                        {eng.experienceYears ?? "—"}
                        <span className="ml-1 text-[10px] text-muted-foreground">
                          {t("engineers.experienceShort")}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-center text-xs font-semibold tabular-nums">
                        {r.completedJobs}
                      </td>
                      <td className="hidden px-2 py-2.5 text-center text-xs tabular-nums text-muted-foreground md:table-cell">
                        {r.scheduledJobs}
                      </td>
                      <td className="hidden px-2 py-2.5 text-center text-xs tabular-nums sm:table-cell">
                        {r.serviceHours}h
                      </td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-semibold tabular-nums">
                            {r.rating > 0 ? r.rating.toFixed(1) : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-center text-xs font-semibold tabular-nums">
                        {formatCurrency(r.revenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {sorted.length === 0 && (
            <div className="px-4 py-12 text-center text-xs text-muted-foreground">
              {t("engineers.empty")}
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

      <NewEngineerDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
