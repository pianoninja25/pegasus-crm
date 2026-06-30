"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Canonical page-size choices used across every Pegasus AC list page. */
export const PAGE_SIZES = [10, 20, 50, 100] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export interface PaginationProps {
  page: number;
  pageSize: PageSize;
  total: number;
  rangeStart: number;
  rangeEnd: number;
  totalPages: number;
  onPageChange: (next: number) => void;
  onPageSizeChange: (next: PageSize) => void;
  /** Slot rendered on the far left — e.g. selection count, bulk actions. */
  leadingSlot?: React.ReactNode;
  className?: string;
}

/**
 * Footer pagination control mirroring the Pegasus operations look:
 *   "Rows per page [10] · 1–10 of 72 · ‹ 1/8 ›"
 * Sticks to the bottom of a card or table container.
 */
export function Pagination({
  page,
  pageSize,
  total,
  rangeStart,
  rangeEnd,
  totalPages,
  onPageChange,
  onPageSizeChange,
  leadingSlot,
  className,
}: PaginationProps) {
  const canPrev = page > 1;
  const canNext = page < totalPages;
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/30 px-3 py-2 text-[11px] text-muted-foreground backdrop-blur",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {leadingSlot}
        <span>Rows per page</span>
        <select
          value={pageSize}
          onChange={(e) =>
            onPageSizeChange(Number(e.target.value) as PageSize)
          }
          className={cn(
            "h-7 rounded-md border border-border bg-card/40 px-1.5 text-xs text-foreground transition-colors",
            "focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20",
          )}
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3">
        <span className="tabular-nums">
          {total === 0 ? "0" : `${rangeStart}–${rangeEnd}`}{" "}
          <span className="text-muted-foreground/80">of {total}</span>
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPageChange(page - 1)}
            disabled={!canPrev}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[3.5rem] text-center text-foreground tabular-nums">
            {page}{" "}
            <span className="text-muted-foreground">/ {totalPages}</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onPageChange(page + 1)}
            disabled={!canNext}
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Convenience hook that returns derived pagination state for a filtered
 * dataset. Call once with the full filtered list + page/pageSize and consume
 * `visible` for rendering plus everything else for the {@link Pagination}.
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): {
  visible: T[];
  totalPages: number;
  safePage: number;
  rangeStart: number;
  rangeEnd: number;
} {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = Math.min(items.length, pageStart + pageSize);
  return {
    visible: items.slice(pageStart, pageEnd),
    totalPages,
    safePage,
    rangeStart: items.length === 0 ? 0 : pageStart + 1,
    rangeEnd: pageEnd,
  };
}
