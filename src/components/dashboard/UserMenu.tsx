"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  HelpCircle,
  LifeBuoy,
  LogOut,
  Palette,
  Settings,
  ShieldCheck,
  Users2,
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
import { SUPERADMIN_USER } from "@/features/platform/seed";
import { initials } from "@/lib/format";
import { users } from "@/features/service/seed";
import { ROLE_META } from "@/features/service/types";

export function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const workspace = useAuthStore((s) => s.workspace);
  const signOut = useAuthStore((s) => s.signOut);
  const signInAs = useAuthStore((s) => s.signInAs);
  const signInAsSuperadmin = useAuthStore((s) => s.signInAsSuperadmin);

  if (!user) return null;

  const isSuperadmin = user.role === "superadmin";

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
      <DropdownMenuContent align="end" className="w-72">
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
            <p className="mt-0.5 text-[10px] text-primary">
              {user.title} · {ROLE_META[user.role].label}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        {workspace ? (
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {workspace.name} · {workspace.plan}
          </DropdownMenuLabel>
        ) : (
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400">
            Platform superadmin
          </DropdownMenuLabel>
        )}
        {isSuperadmin && (
          <DropdownMenuItem asChild>
            <Link
              href="/admin"
              className="flex items-center gap-2 text-xs text-fuchsia-700 focus:text-fuchsia-700 dark:text-fuchsia-300 dark:focus:text-fuchsia-300"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Admin console
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
          <Users2 className="h-3 w-3" /> Switch role (demo)
        </DropdownMenuLabel>
        <DropdownMenuItem
          className="flex items-center gap-2 text-xs"
          onSelect={() => {
            signInAsSuperadmin();
            router.push("/admin");
          }}
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback
              className="text-[9px] font-semibold text-white"
              style={{
                background: "linear-gradient(135deg,#d946ef,#7c3aed)",
              }}
            >
              {initials(SUPERADMIN_USER.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-foreground">{SUPERADMIN_USER.name}</p>
            <p className="truncate text-[10px] text-fuchsia-600 dark:text-fuchsia-400">
              Superadmin (platform)
            </p>
          </div>
          {isSuperadmin && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        {users
          .filter((u) =>
            ["administrator", "manager", "admin_staff", "engineer"].includes(
              u.role,
            ),
          )
          .slice(0, 5)
          .map((u) => {
            const active = u.id === user.id;
            return (
              <DropdownMenuItem
                key={u.id}
                className="flex items-center gap-2 text-xs"
                onSelect={() => signInAs(u.id)}
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback
                    className="text-[9px] font-semibold"
                    style={{
                      background: `hsl(${u.hue ?? 215} 80% 35%)`,
                      color: "white",
                    }}
                  >
                    {initials(u.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-foreground">{u.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {ROLE_META[u.role].label}
                  </p>
                </div>
                {active && <Check className="h-3.5 w-3.5 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/settings#profile"
            className="flex items-center gap-2 text-xs"
          >
            <UserRound className="h-3.5 w-3.5" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/settings#appearance"
            className="flex items-center gap-2 text-xs"
          >
            <Palette className="h-3.5 w-3.5" /> Appearance & theme
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 text-xs"
          >
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
      Sign in to Pegasus AC
    </Button>
  );
}
