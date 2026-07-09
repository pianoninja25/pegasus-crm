"use client";

import { ReactNode } from "react";

import { CursorGlow } from "@/components/shared/CursorGlow";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="relative flex h-screen min-h-0 w-full overflow-hidden bg-background text-foreground">
      <CursorGlow />
      <div className="hidden lg:flex">
        <AdminSidebar />
      </div>
      <div className="relative flex h-full min-w-0 flex-1 flex-col">
        <AdminTopbar />
        <main className="relative flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
