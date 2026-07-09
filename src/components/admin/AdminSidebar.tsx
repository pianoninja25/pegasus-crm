"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

import { adminSidebar } from "@/config/admin";
import { Logo } from "@/components/shared/Logo";
import { usePlatformStats } from "@/features/platform/hooks";
import { cn } from "@/lib/utils";

/**
 * Platform-console sidebar. Deliberately slimmer than the tenant sidebar
 * — the admin surface only has a handful of top-level routes so we skip
 * the collapse / grouped-section machinery.
 */
export function AdminSidebar() {
  const pathname = usePathname();
  const stats = usePlatformStats();

  const isActive = (href: string, matchExact?: boolean): boolean => {
    if (matchExact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="flex h-full w-[240px] flex-col border-r border-border/60 bg-card/90">
      <div className="flex h-12 shrink-0 items-center border-b border-border/60 px-4">
        <Logo href="/admin" />
      </div>

      <div className="flex items-center gap-2 border-b border-border/60 bg-fuchsia-500/5 px-4 py-2.5">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-300">
          <ShieldCheck className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] font-semibold text-foreground">
            Platform Console
          </p>
          <p className="truncate text-[10px] text-muted-foreground">
            Superadmin only
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-4">
        {adminSidebar.map((section) => (
          <div key={section.label} className="space-y-1">
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              {section.label}
            </p>
            {section.items.map((item) => {
              const active = isActive(item.href, item.matchExact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="admin-sidebar-active"
                      className="absolute inset-0 rounded-lg bg-primary/12 ring-1 ring-inset ring-primary/25 shadow-[inset_0_0_10px_hsl(var(--glow)/0.12)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "relative h-3.5 w-3.5 shrink-0",
                      active ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <span className="relative flex-1 truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border/60 p-3">
        <div className="rounded-lg border border-border/60 bg-card/40 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Platform pulse
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
            <PulseCell label="Tenants" value={stats.tenantCount} />
            <PulseCell label="Users" value={stats.userCount} />
            <PulseCell
              label="Active"
              value={stats.activeTenants}
              tone="text-emerald-600 dark:text-emerald-400"
            />
            <PulseCell
              label="Suspended"
              value={stats.suspendedTenants}
              tone="text-rose-600 dark:text-rose-400"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

function PulseCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="truncate uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className={cn("shrink-0 font-semibold tabular-nums", tone)}>
        {value}
      </span>
    </div>
  );
}
