"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/features/auth/authStore";
import { initials } from "@/lib/format";
import { ROLE_META } from "@/features/service/types";

/**
 * Admin console topbar. Distinct from the tenant `DashboardTopbar` because
 * the admin surface doesn't expose things like command palette, workspace
 * switcher, or locale controls — those are per-tenant concerns.
 */
export function AdminTopbar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-border/60 bg-background/85 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/65 lg:px-4">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-fuchsia-500/12 px-2 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-700 ring-1 ring-inset ring-fuchsia-500/30 dark:text-fuchsia-300">
          <ShieldCheck className="h-3 w-3" /> Platform
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-xs"
        >
          <Link href="/dashboard">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">View tenant dashboard</span>
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="group flex items-center gap-2 rounded-full border border-border/60 bg-card/80 py-0.5 pl-0.5 pr-2.5 text-[11px] font-medium text-foreground transition-colors hover:bg-foreground/5"
            >
              <Avatar className="h-7 w-7 ring-1 ring-fuchsia-500/30">
                <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-violet-600 text-[10px] font-semibold text-white">
                  {initials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <div className="flex items-start gap-3 p-2.5">
              <Avatar className="h-10 w-10 ring-1 ring-fuchsia-500/30">
                <AvatarFallback className="bg-gradient-to-br from-fuchsia-500 to-violet-600 text-xs font-semibold text-white">
                  {initials(user.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  {user.name}
                </p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {user.email}
                </p>
                <p className="mt-0.5 text-[10px] text-fuchsia-600 dark:text-fuchsia-400">
                  {ROLE_META[user.role].label}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Platform actions
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-xs"
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> View tenant dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-xs text-destructive focus:text-destructive"
              onSelect={() => {
                signOut();
                router.push("/login");
              }}
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
