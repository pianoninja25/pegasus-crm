"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone: string;
  icon?: React.ComponentType<{ className?: string }>;
  ringed?: boolean;
  size?: "xs" | "sm";
  children: React.ReactNode;
}

export function StatusPill({
  tone,
  icon: Icon,
  ringed = false,
  size = "sm",
  className,
  children,
  ...rest
}: StatusPillProps) {
  return (
    <span
      {...rest}
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide",
        size === "xs"
          ? "px-1.5 py-0.5 text-[9px]"
          : "px-1.5 py-0.5 text-[10px]",
        ringed && "ring-1 ring-inset",
        tone,
        className,
      )}
    >
      {Icon && <Icon className="h-2.5 w-2.5" />}
      {children}
    </span>
  );
}
