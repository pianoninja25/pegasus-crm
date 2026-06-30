"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import type { Customer } from "@/features/service/types";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface CustomerPickerProps {
  /** Currently selected customer id (empty string when nothing is picked). */
  value: string;
  /** Called when the user picks an existing customer from the suggestions. */
  onChange: (customerId: string) => void;
  /** Full customer list (already loaded from `useCustomers().data`). */
  customers: Customer[];
  /**
   * Optional callback to launch the "create new customer" dialog. The
   * current search query is forwarded so the caller can pre-fill the
   * new-customer form's name field.
   */
  onCreateNew?: (currentSearch: string) => void;
  /** Input placeholder for the search field. */
  placeholder: string;
  /** Label shown when no customer matches the search. */
  noMatchLabel: string;
  /** CTA label for the "create new" affordance. */
  createNewLabel?: string;
  /** Optional helper line shown under the create-new CTA (e.g. "as Admin"). */
  createNewHint?: string;
}

/**
 * Reusable customer typeahead with optional "create new" fallback.
 *
 * Shows a compact selected-state card once the user picks a customer
 * (avatar + name + city). Clicking the selected card re-opens the
 * search box so the user can swap customers.
 *
 * Used by `NewQuotationDialog` and `NewContractDialog` — extract any
 * further variants by adding props here rather than copy-pasting.
 */
export function CustomerPicker({
  value,
  onChange,
  customers,
  onCreateNew,
  placeholder,
  noMatchLabel,
  createNewLabel,
  createNewHint,
}: CustomerPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const boxRef = useRef<HTMLDivElement | null>(null);

  /* Close on outside click. */
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const selected = customers.find((c) => c.id === value);

  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers
      .filter((c) =>
        [c.name, c.contactPerson, c.companyName, c.city]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
      .slice(0, 8);
  }, [customers, search]);

  const trimmed = search.trim();

  return (
    <div ref={boxRef} className="relative">
      <User className="pointer-events-none absolute left-2.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      {selected && !open ? (
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setOpen(true);
          }}
          className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background pl-8 pr-3 text-left text-sm transition-colors hover:border-primary/40"
        >
          <Avatar className="h-5 w-5">
            <AvatarFallback className="bg-primary/15 text-[9px] font-semibold text-primary">
              {initials(selected.name)}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-foreground">{selected.name}</span>
          <span className="ml-auto truncate text-[11px] text-muted-foreground">
            {selected.city}
          </span>
        </button>
      ) : (
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="pl-8"
        />
      )}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-lg border border-border/60 bg-popover/95 shadow-xl backdrop-blur">
          {matches.length === 0 ? (
            <p className="px-3 py-2 text-[11px] text-muted-foreground">
              {noMatchLabel}
            </p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {matches.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(c.id);
                      setSearch("");
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-foreground/5"
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
                        {c.contactPerson} · {c.city}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {onCreateNew && createNewLabel && (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onCreateNew(trimmed);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 border-t border-dashed border-border/60",
                "bg-primary/5 px-3 py-2 text-left text-xs transition-colors hover:bg-primary/10",
              )}
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Plus className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-primary">
                  {createNewLabel}
                  {trimmed && (
                    <>
                      {" · "}
                      <span className="text-foreground">
                        &ldquo;{trimmed}&rdquo;
                      </span>
                    </>
                  )}
                </p>
                {createNewHint && (
                  <p className="truncate text-[10px] text-muted-foreground">
                    {createNewHint}
                  </p>
                )}
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
