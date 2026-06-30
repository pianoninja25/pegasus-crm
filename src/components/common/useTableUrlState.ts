"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

import type { SortState } from "@/components/common/DataTableColumnHeader";

/**
 * Filter values supported on the URL.
 *
 *  - `string`     – serialised as `?f_<key>=<value>`
 *  - `string[]`   – serialised as `?f_<key>=<v1>,<v2>` (comma-separated)
 *
 * The hook accepts any shape `F` whose values are `string | string[]`; we
 * don't impose a `Record<…>` index-signature constraint because that
 * rejects explicit `interface` declarations — which are how each page
 * models its filter set.
 */
export type FilterValue = string | string[];

export interface TableUrlState<K extends string, F> {
  sort: SortState<K> | null;
  page: number;
  pageSize: number;
  globalSearch: string;
  filters: F;
}

export interface UseTableUrlStateConfig<K extends string, F> {
  /** Initial state that applies when no URL params are present. */
  defaults: TableUrlState<K, F>;
  /**
   * URL keys we don't manage but must preserve through updates (so they
   * survive a `router.replace`). Used for e.g. customers' `?view=map`.
   */
  preserveKeys?: readonly string[];
  /**
   * Whitelist of sort keys. Invalid `?sort=...` values fall back to the
   * default — guards against URL-tampering causing runtime errors.
   */
  validSortKeys: readonly K[];
  /**
   * Optional whitelist of acceptable page sizes (e.g. `[10, 20, 50, 100]`).
   * URL values outside this set fall back to the default. Without this,
   * any positive integer is accepted.
   */
  validPageSizes?: readonly number[];
}

/* -------------------------------------------------------------------------- */
/* Parsing / serialisation helpers                                            */
/* -------------------------------------------------------------------------- */

const SORT_DIRS = ["asc", "desc"] as const;
type SortDirLiteral = (typeof SORT_DIRS)[number];

function isValidDir(value: string | null): value is SortDirLiteral {
  return SORT_DIRS.includes(value as SortDirLiteral);
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * URL-backed table state hook.
 *
 * Reads sort, pagination, global search, and per-page filters from the
 * current `?…` query string and exposes a single `setState({ … })`
 * setter that writes them back. The URL is the source of truth — a
 * refresh, share, or browser back/forward replays the exact view.
 *
 * Wire-up per page:
 *
 * ```tsx
 * const { state, setState } = useTableUrlState({
 *   defaults: {
 *     sort: { key: "lastTouchedAt", dir: "desc" },
 *     page: 1,
 *     pageSize: PAGE_SIZES[0],
 *     globalSearch: "",
 *     filters: { customer: "", type: [], stage: [], location: [], contact: "" },
 *   },
 *   validSortKeys: ["customer", "stage", "type", "contact", ...],
 *   preserveKeys: ["view"], // anything the page manages itself
 * });
 * ```
 *
 * Page auto-reset: any change to filters / sort / pageSize / globalSearch
 * resets `page` back to 1 — matches the previous `useEffect(...)` reset
 * pattern callers had hand-rolled.
 *
 * URL keys:
 *   - `?sort=<key>&dir=asc|desc`         (omitted when matching default)
 *   - `?page=<n>`                         (omitted when `1`)
 *   - `?size=<n>`                         (omitted when matching default)
 *   - `?q=<query>`                        (omitted when empty)
 *   - `?f_<filterKey>=<value>`            (omitted when empty / `[]`)
 */
export function useTableUrlState<K extends string, F>(
  cfg: UseTableUrlStateConfig<K, F>,
) {
  const { defaults, preserveKeys = [], validSortKeys, validPageSizes } = cfg;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* ── Parse current URL → typed state ──────────────────────────────── */
  const state = useMemo<TableUrlState<K, F>>(() => {
    /*
     * Three-state sort decoding:
     *   - `?sort=<valid-key>`   → use that sort
     *   - `?sort=` (empty val)  → user *explicitly* cleared the sort → null
     *   - param absent          → fall back to `defaults.sort`
     *
     * `URLSearchParams.has("sort")` is the only reliable way to tell the
     * empty-value case apart from "param not present", because `.get()`
     * returns `""` for both `?sort=` AND for `?sort=&dir=desc` collision.
     */
    const sortKeyPresent = searchParams.has("sort");
    const rawSortKey = searchParams.get("sort");
    const rawDir = searchParams.get("dir");
    let sort: SortState<K> | null;
    if (!sortKeyPresent) {
      sort = defaults.sort;
    } else if (
      rawSortKey &&
      (validSortKeys as readonly string[]).includes(rawSortKey)
    ) {
      sort = {
        key: rawSortKey as K,
        dir: isValidDir(rawDir) ? rawDir : "desc",
      };
    } else {
      // Param present but empty/invalid — user cleared the sort.
      sort = null;
    }

    const pageNum = Number(searchParams.get("page"));
    const page =
      Number.isFinite(pageNum) && pageNum > 0 ? Math.floor(pageNum) : 1;

    const sizeNum = Number(searchParams.get("size"));
    const candidateSize =
      Number.isFinite(sizeNum) && sizeNum > 0
        ? Math.floor(sizeNum)
        : defaults.pageSize;
    const pageSize =
      validPageSizes && !validPageSizes.includes(candidateSize)
        ? defaults.pageSize
        : candidateSize;

    const globalSearch = searchParams.get("q") ?? "";

    const filters: Record<string, FilterValue> = {};
    for (const [key, defaultValue] of Object.entries(
      defaults.filters as Record<string, FilterValue>,
    )) {
      const raw = searchParams.get(`f_${key}`);
      if (Array.isArray(defaultValue)) {
        filters[key] = raw ? raw.split(",").filter(Boolean) : [];
      } else {
        filters[key] = raw ?? "";
      }
    }

    return {
      sort,
      page,
      pageSize,
      globalSearch,
      filters: filters as F,
    };
  }, [searchParams, defaults, validSortKeys, validPageSizes]);

  /* ── Writer ──────────────────────────────────────────────────────── */

  /**
   * `state` is captured in a ref so the `setState` callback doesn't have
   * to depend on it — that would re-create the callback on every render
   * and defeat any memoisation downstream (e.g. column-header sort
   * handlers).
   */
  const stateRef = useRef(state);
  stateRef.current = state;

  const setState = useCallback(
    (patch: Partial<TableUrlState<K, F>>) => {
      const current = stateRef.current;
      const next: TableUrlState<K, F> = {
        sort: patch.sort !== undefined ? patch.sort : current.sort,
        page: patch.page !== undefined ? patch.page : current.page,
        pageSize:
          patch.pageSize !== undefined ? patch.pageSize : current.pageSize,
        globalSearch:
          patch.globalSearch !== undefined
            ? patch.globalSearch
            : current.globalSearch,
        filters: patch.filters !== undefined ? patch.filters : current.filters,
      };

      // ── Page auto-reset on any state change *other* than page itself ──
      const filterCountChanged = patch.filters !== undefined;
      const sortChanged = patch.sort !== undefined;
      const sizeChanged = patch.pageSize !== undefined;
      const searchChanged = patch.globalSearch !== undefined;
      if (
        patch.page === undefined &&
        (filterCountChanged || sortChanged || sizeChanged || searchChanged)
      ) {
        next.page = 1;
      }

      // ── Build new search params ──
      const params = new URLSearchParams();

      // 1. Preserve unrelated keys (e.g. ?view=map)
      for (const key of preserveKeys) {
        const v = searchParams.get(key);
        if (v !== null) params.set(key, v);
      }

      // 2. Sort (omit when matching default to keep URLs minimal)
      if (
        next.sort &&
        (next.sort.key !== defaults.sort?.key ||
          next.sort.dir !== defaults.sort?.dir)
      ) {
        params.set("sort", next.sort.key);
        params.set("dir", next.sort.dir);
      } else if (next.sort === null && defaults.sort !== null) {
        // Active "no sort" override of a default-sorted table
        params.set("sort", "");
      }

      // 3. Page
      if (next.page > 1) params.set("page", String(next.page));

      // 4. Page size
      if (next.pageSize !== defaults.pageSize) {
        params.set("size", String(next.pageSize));
      }

      // 5. Global search
      if (next.globalSearch.trim()) params.set("q", next.globalSearch);

      // 6. Filters
      for (const [key, value] of Object.entries(
        next.filters as Record<string, FilterValue>,
      )) {
        if (Array.isArray(value)) {
          if (value.length > 0) params.set(`f_${key}`, value.join(","));
        } else if (value && value.trim()) {
          params.set(`f_${key}`, value);
        }
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [defaults, pathname, preserveKeys, router, searchParams],
  );

  /* ── Convenience setters (curried for column-header onChange) ───── */

  const setSort = useCallback(
    (sort: SortState<K> | null) => setState({ sort }),
    [setState],
  );
  const setPage = useCallback((page: number) => setState({ page }), [setState]);
  const setPageSize = useCallback(
    (pageSize: number) => setState({ pageSize }),
    [setState],
  );
  const setGlobalSearch = useCallback(
    (globalSearch: string) => setState({ globalSearch }),
    [setState],
  );
  const setFilters = useCallback(
    (filters: F | ((prev: F) => F)) =>
      setState({
        filters:
          typeof filters === "function"
            ? (filters as (prev: F) => F)(stateRef.current.filters)
            : filters,
      }),
    [setState],
  );

  /* ── One-shot: clamp `?sort=` etc. that don't pass validation ──── */

  // If the URL contained an invalid sort key, surface the resolved
  // default by re-writing the URL once. This keeps the URL honest and
  // shareable.
  const sanitisedOnce = useRef(false);
  useEffect(() => {
    if (sanitisedOnce.current) return;
    sanitisedOnce.current = true;
    const rawSortKey = searchParams.get("sort");
    if (
      rawSortKey &&
      rawSortKey !== "" &&
      !(validSortKeys as readonly string[]).includes(rawSortKey)
    ) {
      setState({ sort: defaults.sort });
    }
  }, [searchParams, validSortKeys, defaults.sort, setState]);

  return {
    state,
    setState,
    setSort,
    setPage,
    setPageSize,
    setGlobalSearch,
    setFilters,
  };
}
