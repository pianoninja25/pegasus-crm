"use client";

import {
  ArrowDownAZ,
  ArrowUpAZ,
  CheckCircle2,
  ChevronDown,
  X,
} from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type SortDir = "asc" | "desc";

export interface SortState<K extends string = string> {
  key: K;
  dir: SortDir;
}

/** Multi-select filter option used by the `enum` filter kind. */
export interface FilterOption {
  value: string;
  label: string;
  /** Optional inline count rendered as a small pill. */
  count?: number;
  /** Tailwind background colour class for the dot ("bg-emerald-500"). */
  dotClass?: string;
}

export type FilterConfig =
  | { kind: "none" }
  | { kind: "text"; value: string; onChange: (next: string) => void; placeholder?: string }
  | {
      kind: "enum";
      value: string[];
      onChange: (next: string[]) => void;
      options: FilterOption[];
    };

export interface DataTableColumnHeaderProps {
  label: string;
  align?: "left" | "right" | "center";
  className?: string;
  /** When omitted, no sort dropdown is rendered (label-only header). */
  sort?: {
    active: SortDir | null;
    onChange: (next: SortDir | null) => void;
  };
  filter?: FilterConfig;
}

/**
 * Reusable column header for AC Service tables.
 *
 * Renders a label that, when sortable / filterable, opens a dropdown with
 * Sort (asc/desc/clear) + Filter (text or multi-select) sections. Mirrors
 * the look of Pegasus's `<HeaderCell />` so every list in the app feels
 * the same.
 */
export function DataTableColumnHeader({
  label,
  align = "left",
  className,
  sort,
  filter,
}: DataTableColumnHeaderProps) {
  const hasSort = !!sort;
  const hasFilter = !!filter && filter.kind !== "none";
  const filterActive = hasFilter ? isFilterActive(filter) : false;

  // Simple non-interactive header
  if (!hasSort && !hasFilter) {
    return (
      <th
        className={cn(
          "px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
          align === "right" && "text-right",
          align === "center" && "text-center",
          align === "left" && "text-left",
          className,
        )}
      >
        <span className="truncate" title={label}>
          {label}
        </span>
      </th>
    );
  }

  const sortDir = sort?.active ?? null;

  return (
    <th
      className={cn(
        "px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
        align === "right" && "text-right",
        align === "center" && "text-center",
        className,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "group inline-flex w-full items-center gap-1.5 truncate rounded px-1.5 py-1 transition-colors",
              // Suppress the browser's default focus outline on click;
              // only show a (subtle) ring during keyboard navigation
              "outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:ring-offset-0",
              "hover:bg-foreground/[0.05]",
              (sortDir || filterActive) && "bg-primary/10 text-foreground",
              align === "right" && "justify-end",
              align === "center" && "justify-center",
              align === "left" && "justify-start",
            )}
            title={label}
          >
            <span className="truncate">{label}</span>
            {sortDir === "asc" && (
              <ArrowUpAZ className="h-3 w-3 shrink-0 text-foreground" />
            )}
            {sortDir === "desc" && (
              <ArrowDownAZ className="h-3 w-3 shrink-0 text-foreground" />
            )}
            {!sortDir && (
              <ChevronDown className="h-3 w-3 shrink-0 opacity-40 transition-opacity group-hover:opacity-100" />
            )}
            {filterActive && (
              <span
                className="ml-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                aria-label="filter active"
              />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-64 max-h-[70vh] overflow-y-auto"
        >
          {hasSort && (
            <>
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Sort
              </DropdownMenuLabel>
              <DropdownMenuItem
                onSelect={() => sort!.onChange("asc")}
                className="gap-2 text-xs"
              >
                <ArrowUpAZ className="h-3 w-3" />
                Ascending
                {sortDir === "asc" && (
                  <CheckCircle2 className="ml-auto h-3 w-3 text-primary" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => sort!.onChange("desc")}
                className="gap-2 text-xs"
              >
                <ArrowDownAZ className="h-3 w-3" />
                Descending
                {sortDir === "desc" && (
                  <CheckCircle2 className="ml-auto h-3 w-3 text-primary" />
                )}
              </DropdownMenuItem>
              {sortDir && (
                <DropdownMenuItem
                  onSelect={() => sort!.onChange(null)}
                  className="gap-2 text-xs text-muted-foreground"
                >
                  <X className="h-3 w-3" />
                  Clear sort
                </DropdownMenuItem>
              )}
            </>
          )}

          {hasSort && hasFilter && <DropdownMenuSeparator />}

          {hasFilter && (
            <>
              <DropdownMenuLabel className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>Filter</span>
                {filterActive && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      clearFilter(filter!);
                    }}
                    className="text-[10px] font-medium text-primary hover:underline"
                  >
                    Clear
                  </button>
                )}
              </DropdownMenuLabel>
              <FilterBody filter={filter!} />
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </th>
  );
}

/* ─────────────────────── Filter body renderers ──────────────────────── */

function FilterBody({ filter }: { filter: FilterConfig }) {
  if (filter.kind === "text") {
    return (
      <div className="px-2 pb-2 pt-1">
        <Input
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          placeholder={filter.placeholder ?? "Contains…"}
          className="h-8 text-xs"
          onKeyDown={(e) => {
            // keep the dropdown open while typing
            e.stopPropagation();
          }}
          autoFocus
        />
      </div>
    );
  }

  if (filter.kind === "enum") {
    const { value, onChange, options } = filter;
    const toggle = (v: string) => {
      const set = new Set(value);
      if (set.has(v)) set.delete(v);
      else set.add(v);
      onChange(Array.from(set));
    };
    return (
      <div className="max-h-60 overflow-y-auto px-1 pb-1">
        {options.map((opt) => {
          const checked = value.includes(opt.value);
          return (
            <DropdownMenuItem
              key={opt.value}
              onSelect={(e) => {
                e.preventDefault();
                toggle(opt.value);
              }}
              className="gap-2 text-xs"
            >
              <Checkbox checked={checked} className="h-3.5 w-3.5" />
              {opt.dotClass && (
                <span
                  className={cn(
                    "inline-block h-2 w-2 rounded-full",
                    opt.dotClass,
                  )}
                />
              )}
              <span className="flex-1 truncate">{opt.label}</span>
              {typeof opt.count === "number" && (
                <span className="rounded bg-foreground/10 px-1 text-[9px] tabular-nums text-muted-foreground">
                  {opt.count}
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </div>
    );
  }

  return null;
}

/* ─────────────────────── helpers ──────────────────────── */

function isFilterActive(filter: FilterConfig): boolean {
  if (filter.kind === "text") return filter.value.trim().length > 0;
  if (filter.kind === "enum") return filter.value.length > 0;
  return false;
}

function clearFilter(filter: FilterConfig) {
  if (filter.kind === "text") filter.onChange("");
  else if (filter.kind === "enum") filter.onChange([]);
}
