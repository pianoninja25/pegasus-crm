import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  label: string;
  /** Pre-baked Tailwind tone string (e.g. "bg-sky-500/15 text-sky-300 ring-sky-500/30"). */
  tone: string;
  /** Optional hex colour for the dot indicator. */
  color?: string;
  className?: string;
}

/**
 * Status pill rendered as a coloured chip with a small dot. Designed to be
 * used with the `*_META[status].tone` constants exported from
 * `@/features/service/types`.
 */
export function StatusBadge({
  label,
  tone,
  color,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
        tone,
        className,
      )}
    >
      {color && (
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
        />
      )}
      {label}
    </span>
  );
}
