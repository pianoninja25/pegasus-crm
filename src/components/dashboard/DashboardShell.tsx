"use client";

import { ReactNode } from "react";

import { CursorGlow } from "@/components/shared/CursorGlow";
import { CommandPaletteProvider } from "@/components/shared/CommandPalette";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopbar } from "./DashboardTopbar";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <CommandPaletteProvider>
      <div className="relative flex h-screen min-h-0 w-full overflow-hidden bg-background text-foreground">
        <CursorGlow />
        <div className="hidden lg:flex">
          <DashboardSidebar />
        </div>
        <div className="relative flex h-full min-w-0 flex-1 flex-col">
          <DashboardTopbar />
          <main className="relative flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </CommandPaletteProvider>
  );
}
