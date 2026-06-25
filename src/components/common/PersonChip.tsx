"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

type Size = "xs" | "sm" | "md";

const SIZE_CLASSES: Record<Size, { avatar: string; font: string }> = {
  xs: { avatar: "h-4 w-4", font: "text-[8px]" },
  sm: { avatar: "h-5 w-5", font: "text-[9px]" },
  md: { avatar: "h-7 w-7", font: "text-[10px]" },
};

export interface PersonChipProps {
  name: string;
  email?: string;
  size?: Size;
  showEmail?: boolean;
  bold?: boolean;
  className?: string;
}

export function PersonChip({
  name,
  email,
  size = "sm",
  showEmail = false,
  bold = true,
  className,
}: PersonChipProps) {
  const dim = SIZE_CLASSES[size];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 align-middle",
        className,
      )}
    >
      <Avatar className={cn(dim.avatar, "ring-1 ring-border/60")}>
        <AvatarFallback className={dim.font}>
          {initials(name, email)}
        </AvatarFallback>
      </Avatar>
      <span
        className={cn("truncate text-foreground", bold && "font-medium")}
        title={email}
      >
        {name}
      </span>
      {showEmail && email && (
        <span className="truncate text-[10px] text-muted-foreground">
          ({email})
        </span>
      )}
    </span>
  );
}
