"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Compass,
  HelpCircle,
  LifeBuoy,
  LogOut,
  Palette,
  Settings,
  UserRound,
} from "lucide-react";

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

export function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const workspace = useAuthStore((s) => s.workspace);
  const workspaces = useAuthStore((s) => s.workspaces);
  const signOut = useAuthStore((s) => s.signOut);

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-2 rounded-full border border-border/60 bg-card/80 py-0.5 pl-0.5 pr-2.5 text-[11px] font-medium text-foreground transition-colors hover:bg-foreground/5"
        >
          <Avatar className="h-7 w-7 ring-1 ring-primary/20">
            <AvatarFallback className="bg-[image:var(--gradient-primary)] text-[10px] font-semibold text-primary-foreground">
              {initials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-start gap-3 p-2.5">
          <Avatar className="h-10 w-10 ring-1 ring-primary/20">
            <AvatarFallback className="bg-[image:var(--gradient-primary)] text-xs font-semibold text-primary-foreground">
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
            <p className="mt-0.5 text-[10px] text-primary">{user.title}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Workspaces
        </DropdownMenuLabel>
        {workspaces.map((ws) => {
          const active = ws.id === workspace?.id;
          return (
            <DropdownMenuItem key={ws.id} className="flex items-center gap-2 text-xs">
              <Compass className="h-3.5 w-3.5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-foreground">{ws.name}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {ws.plan} · {ws.role}
                </p>
              </div>
              {active && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings#profile" className="flex items-center gap-2 text-xs">
            <UserRound className="h-3.5 w-3.5" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings#appearance" className="flex items-center gap-2 text-xs">
            <Palette className="h-3.5 w-3.5" /> Appearance & theme
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="flex items-center gap-2 text-xs">
            <Settings className="h-3.5 w-3.5" /> Workspace settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center gap-2 text-xs">
          <LifeBuoy className="h-3.5 w-3.5" /> Help center
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 text-xs">
          <HelpCircle className="h-3.5 w-3.5" /> Keyboard shortcuts
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
  );
}

export function MockSignInButton() {
  const signIn = useAuthStore((s) => s.signIn);
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        signIn();
        router.push("/dashboard");
      }}
      className="w-full"
    >
      Sign in as Leo Santoso
    </Button>
  );
}
