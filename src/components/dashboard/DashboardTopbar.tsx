"use client";

import { useEffect, useState } from "react";
import {
  Command,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCommandPalette } from "@/components/shared/CommandPalette";
import { useSidebarStore } from "./sidebarStore";
import { UserMenu } from "./UserMenu";
import { NotificationsMenu } from "./NotificationsMenu";
import { DashboardSidebar } from "./DashboardSidebar";

export function DashboardTopbar() {
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed);
  const mobileOpen = useSidebarStore((s) => s.mobileOpen);
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);
  const { open } = useCommandPalette();
  const [mac, setMac] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setMac(/Mac|iPhone|iPad/i.test(window.navigator.userAgent));
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-border/60 bg-background/85 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/65 lg:px-4">
      {/* Mobile sidebar trigger */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 lg:hidden"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <SheetContent side="left" className="w-[260px] p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <DashboardSidebar variant="mobile" />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden h-8 w-8 lg:inline-flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        onClick={toggleCollapsed}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-4 w-4" />
        ) : (
          <PanelLeftClose className="h-4 w-4" />
        )}
      </Button>

      {/* Command palette trigger */}
      <button
        type="button"
        onClick={() => open()}
        className="group flex h-8 max-w-md flex-1 items-center gap-2 rounded-md border border-border/60 bg-card/60 px-3 text-left text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden flex-1 truncate sm:inline">
          Search contacts, deals, companies…
        </span>
        <span className="sm:hidden flex-1" />
        <kbd className="hidden items-center gap-1 rounded border border-border/60 bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
          {mac ? (
            <Command className="h-3 w-3" />
          ) : (
            <span>Ctrl</span>
          )}
          <span>K</span>
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="outline" size="sm" className="hidden h-8 gap-1.5 md:inline-flex">
          <Plus className="h-3.5 w-3.5" /> Quick add
        </Button>
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  );
}
