"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { dashboardSidebar, type SidebarItem } from "@/config/dashboard";
import { Logo } from "@/components/shared/Logo";
import { useSidebarStore } from "./sidebarStore";
import {
  unreadNotificationCount,
  upcomingVisitsCount,
} from "@/features/service/seed";
import { useAuthStore } from "@/features/auth/authStore";
import { useT } from "@/features/locale/hooks";

interface DashboardSidebarProps {
  variant?: "desktop" | "mobile";
}

/**
 * Persistent left navigation. Collapses to icon-only (72px) on desktop,
 * stays full-width inside a Sheet on mobile. Live badges (inbox unread,
 * notifications, open activities) override the static values in
 * `dashboardSidebar`.
 */
export function DashboardSidebar({ variant = "desktop" }: DashboardSidebarProps) {
  const collapsed = useSidebarStore((s) =>
    variant === "desktop" ? s.collapsed : false,
  );
  const closeMobile = useSidebarStore((s) => s.setMobileOpen);
  const pathname = usePathname();
  const hash = useLocationHash();
  const role = useAuthStore((s) => s.user?.role) ?? "administrator";
  const t = useT();

  const upcoming = upcomingVisitsCount();
  const notifUnread = unreadNotificationCount();

  const hashesByPath = new Map<string, Set<string>>();
  for (const section of dashboardSidebar) {
    for (const item of section.items) {
      const [path, frag] = item.href.split("#");
      if (!path || !frag) continue;
      if (!hashesByPath.has(path)) hashesByPath.set(path, new Set());
      hashesByPath.get(path)!.add(`#${frag}`);
    }
  }

  const isItemActive = (href: string): boolean => {
    const [rawPath, frag] = href.split("#");
    const path = rawPath ?? "/";
    if (path === "/dashboard") return pathname === "/dashboard" && !hash;
    if (!pathname.startsWith(path)) return false;
    if (frag) return hash === `#${frag}`;
    const siblings = hashesByPath.get(path);
    if (siblings && siblings.has(hash)) return false;
    return true;
  };

  const resolveItem = (item: SidebarItem): SidebarItem => {
    if (item.href === "/dashboard/scheduling") {
      return {
        ...item,
        badge: upcoming > 0 ? String(upcoming) : undefined,
        badgeTone: upcoming > 0 ? "default" : item.badgeTone,
      };
    }
    if (item.href === "/dashboard/notifications") {
      return {
        ...item,
        badge:
          notifUnread > 0
            ? notifUnread > 99
              ? "99+"
              : String(notifUnread)
            : undefined,
        badgeTone: notifUnread > 0 ? "accent" : item.badgeTone,
      };
    }
    return item;
  };

  const isAllowed = (item: SidebarItem): boolean =>
    !item.roles || item.roles.includes(role);

  const handleNavClick = () => {
    if (variant === "mobile") closeMobile(false);
  };

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "group/sidebar relative flex h-full flex-col border-r border-border/60 bg-card/90 transition-[width] duration-300",
        variant === "desktop"
          ? collapsed
            ? "w-[72px]"
            : "w-[260px]"
          : "w-full",
      )}
    >
      <div
        className={cn(
          "flex h-12 shrink-0 items-center border-b border-border/60 px-4",
          collapsed && "justify-center px-2",
        )}
      >
        <Logo showWordmark={!collapsed} href="/dashboard" />
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-2.5 py-4">
        {dashboardSidebar
          .map((section) => ({
            ...section,
            items: section.items.filter(isAllowed),
          }))
          .filter((section) => section.items.length > 0)
          .map((section) => (
          <Fragment key={section.labelKey}>
            <div className="space-y-1">
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
                  >
                    {t(section.labelKey)}
                  </motion.p>
                )}
              </AnimatePresence>
              {section.items
                .filter((item) => !(collapsed && item.hideCollapsed))
                .map((item) => {
                  const resolved = resolveItem(item);
                  return (
                    <SidebarLink
                      key={item.href}
                      item={resolved}
                      label={t(resolved.labelKey)}
                      collapsed={collapsed}
                      isActive={isItemActive(item.href)}
                      onClick={handleNavClick}
                    />
                  );
                })}
            </div>
          </Fragment>
        ))}
      </nav>

      <div className="border-t border-border/60 p-3">
        {!collapsed ? (
          <PlanCard />
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-md bg-[image:var(--gradient-primary)] text-[10px] font-bold uppercase text-primary-foreground shadow-glow">
                G
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">Growth plan · 6 of 10 seats</TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                             */
/* -------------------------------------------------------------------------- */

interface SidebarLinkProps {
  item: SidebarItem;
  label: string;
  collapsed: boolean;
  isActive: boolean;
  onClick?: () => void;
}

function SidebarLink({
  item,
  label,
  collapsed,
  isActive,
  onClick,
}: SidebarLinkProps) {
  const Icon = item.icon;

  const content = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors",
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {isActive && (
        <motion.span
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-primary/12 ring-1 ring-inset ring-primary/25 shadow-[inset_0_0_10px_hsl(var(--glow)/0.12)]"
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
        />
      )}
      <Icon
        className={cn(
          "relative h-3.5 w-3.5 shrink-0",
          isActive ? "text-primary" : "text-muted-foreground",
        )}
      />
      {!collapsed && (
        <span className="relative flex-1 truncate">{label}</span>
      )}
      {!collapsed && item.badge && (
        <Badge
          variant={item.badgeTone === "accent" ? "accent" : "outline"}
          className="relative h-4 px-1.5 text-[9px]"
        >
          {item.badge}
        </Badge>
      )}
    </Link>
  );

  if (!collapsed) return content;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent side="right">
        <span className="flex items-center gap-2">
          {label}
          {item.badge && (
            <Badge
              variant={item.badgeTone === "accent" ? "accent" : "outline"}
              className="h-4 px-1.5 text-[9px]"
            >
              {item.badge}
            </Badge>
          )}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

function PlanCard() {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-3">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>Growth Plan</span>
        <span className="text-primary">60%</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[image:var(--gradient-primary)]"
          style={{ width: "60%" }}
        />
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        6 of 10 seats used.{" "}
        <Link href="/dashboard/settings#billing" className="text-primary hover:underline">
          Upgrade
        </Link>
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* useLocationHash — track the URL fragment for hash-routed sidebar entries   */
/* -------------------------------------------------------------------------- */

function useLocationHash(): string {
  const [hash, setHash] = useState("");
  useEffect(() => {
    const update = () =>
      setHash(typeof window === "undefined" ? "" : window.location.hash);
    update();
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  return hash;
}
