"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MutableRefObject,
} from "react";

interface UseSearchSuggestionsOptions<T> {
  /** Currently visible suggestions (already filtered + sliced). */
  suggestions: T[];
  /** Called when the user activates a row via mouse click or Enter. */
  onPick: (item: T) => void;
  /** Optional reset trigger — when this string changes, the active index
   *  resets to 0 (typically you pass the current search query here). */
  resetKey?: string;
}

interface UseSearchSuggestionsReturn {
  /** Whether the dropdown should be visible right now. */
  open: boolean;
  /** Toggle the dropdown open/closed (rarely called directly; usually you
   *  pass `setOpen(true)` from the input's onFocus / onChange). */
  setOpen: (open: boolean) => void;
  /** Index of the keyboard-highlighted row. Sync with mouseenter on each row. */
  activeIndex: number;
  /** Setter for the active row index — call this from row onMouseEnter. */
  setActiveIndex: (idx: number) => void;
  /** Attach to the wrapper `<div>` that contains both the input and the
   *  dropdown so outside-click detection works. */
  boxRef: MutableRefObject<HTMLDivElement | null>;
  /** Wire onto the search `<input>` to get arrow-key navigation, Enter to
   *  pick, Escape to close. Does nothing when the dropdown is closed or
   *  there are no suggestions. */
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Shared headless behaviour for the "global search with suggestions
 * dropdown" pattern used on Customers / Engineers / Quotations / Contracts
 * list pages.
 *
 * Owns: open/close state, outside-click detection, arrow-key + Enter +
 * Escape keyboard handling, active-row index reset on query change.
 *
 * Does NOT render anything — each list page renders its own dropdown so
 * the row contents (avatars, type colours, badges) stay entity-specific.
 *
 * Typical usage:
 * ```tsx
 * const { open, setOpen, activeIndex, setActiveIndex, boxRef, onKeyDown } =
 *   useSearchSuggestions({
 *     suggestions,
 *     onPick: (c) => router.push(`/dashboard/customers/${c.id}`),
 *     resetKey: trimmedSearch,
 *   });
 *
 * return (
 *   <div ref={boxRef} className="relative">
 *     <Input
 *       onChange={(e) => { setGlobalSearch(e.target.value); setOpen(true); }}
 *       onFocus={() => setOpen(true)}
 *       onKeyDown={onKeyDown}
 *     />
 *     {open && <SuggestionDropdown ... />}
 *   </div>
 * );
 * ```
 */
export function useSearchSuggestions<T>({
  suggestions,
  onPick,
  resetKey,
}: UseSearchSuggestionsOptions<T>): UseSearchSuggestionsReturn {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const boxRef = useRef<HTMLDivElement | null>(null);

  /* Reset highlighted row whenever the upstream query changes. */
  useEffect(() => {
    setActiveIndex(0);
  }, [resetKey]);

  /* Close on outside click. */
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (i) => (i - 1 + suggestions.length) % suggestions.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = suggestions[activeIndex];
      if (pick) {
        setOpen(false);
        onPick(pick);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return { open, setOpen, activeIndex, setActiveIndex, boxRef, onKeyDown };
}
