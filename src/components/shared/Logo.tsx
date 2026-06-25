import Link from "next/link";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

interface LogoProps {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}

export function Logo({ className, href = "/", showWordmark = true }: LogoProps) {
  const content = (
    <span className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-border bg-card shadow-glow-sm transition-all group-hover:shadow-glow">
        <span className="absolute inset-0 primary-gradient opacity-90" />
        <PegasusMark className="relative z-10 h-5 w-5 text-primary-foreground" />
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-semibold tracking-tight">
            {siteConfig.shortName}
          </span>
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {siteConfig.tagline}
          </span>
        </span>
      )}
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

/**
 * Stylised pegasus mark — a horse head in profile (facing right) with a wing
 * arching off the back of the neck.
 */
function PegasusMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M11 13 C6 11 3 7 6 4 C9 7 12 8 13 9 Z"
        fill="currentColor"
        opacity={0.6}
      />
      <path
        d="M8 21 C8 16 10 14 11 13 C11 11 12 10 13 9 L14 6 L14.5 7.5 L15.5 6 L16 8 C17 8 18 9 19 10 L21 11 L21 12 L19 12.5 C17 13 16 14 15 15 C14 16 13 17 13 18 L13 21 Z"
        fill="currentColor"
      />
    </svg>
  );
}
