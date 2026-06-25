"use client";

import { cn } from "@/lib/utils";
import { formatDateTime, relativeTime } from "@/lib/format";

export interface TimeStampProps {
  iso: string | Date;
  mode?: "inline" | "relative";
  className?: string;
  withYear?: boolean;
}

export function TimeStamp({
  iso,
  mode = "inline",
  className,
  withYear,
}: TimeStampProps) {
  if (!iso) return null;
  const abs = formatDateTime(iso, { withYear });
  const rel = relativeTime(iso);
  if (mode === "relative") {
    return (
      <span className={className} title={abs}>
        {rel}
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span>{rel}</span>
      <span className="text-muted-foreground/70">·</span>
      <span className="font-mono text-[10px] text-muted-foreground">
        {abs}
      </span>
    </span>
  );
}
