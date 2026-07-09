"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  Plus,
  Search,
  ShieldOff,
  Trash2,
  Users,
} from "lucide-react";

import { NewUserDialog } from "@/components/admin/NewUserDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminUsers,
  useTenants,
} from "@/features/platform/hooks";
import { usePlatformStore } from "@/features/platform/store";
import {
  ROLE_META,
  TENANT_ROLES,
  type UserRole,
} from "@/features/service/types";
import { initials, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Cross-tenant users management. Superadmins can filter by tenant,
 * role, or status; change roles inline; disable/re-enable accounts;
 * or delete them entirely.
 *
 * The `superadmin` user itself is listed for transparency but cannot be
 * demoted or deleted (protected in {@link usePlatformStore.deleteUser}).
 */
export default function AdminUsersPage() {
  const users = useAdminUsers();
  const tenants = useTenants();
  const updateUser = usePlatformStore((s) => s.updateUser);
  const deleteUser = usePlatformStore((s) => s.deleteUser);

  const [query, setQuery] = useState("");
  const [tenantFilter, setTenantFilter] = useState<string | "all" | "none">(
    "all",
  );
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "disabled"
  >("all");
  const [inviting, setInviting] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (tenantFilter === "none" && u.tenantId) return false;
      if (
        tenantFilter !== "all" &&
        tenantFilter !== "none" &&
        u.tenantId !== tenantFilter
      )
        return false;
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (statusFilter === "active" && u.disabled) return false;
      if (statusFilter === "disabled" && !u.disabled) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.title.toLowerCase().includes(q)
      );
    });
  }, [users, query, tenantFilter, roleFilter, statusFilter]);

  const tenantMap = useMemo(
    () => new Map(tenants.map((t) => [t.id, t])),
    [tenants],
  );

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-fuchsia-600 dark:text-fuchsia-400">
            Platform · Users
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight">
            All users
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every user across every tenant, plus the platform superadmin.
          </p>
        </div>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => setInviting(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Invite user
        </Button>
      </header>

      {/* Filters */}
      <Card>
        <CardContent className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, title…"
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Select
            value={tenantFilter}
            onValueChange={(v) => setTenantFilter(v)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Tenant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tenants</SelectItem>
              <SelectItem value="none">Platform (no tenant)</SelectItem>
              {tenants.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={roleFilter}
            onValueChange={(v) => setRoleFilter(v as UserRole | "all")}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="superadmin">Superadmin</SelectItem>
              {TENANT_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_META[r].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as "all" | "active" | "disabled")
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="disabled">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-border/60 bg-card/40">
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="px-3 py-2 font-semibold">User</th>
                  <th className="px-3 py-2 font-semibold">Tenant</th>
                  <th className="px-3 py-2 font-semibold">Role</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Joined</th>
                  <th className="px-3 py-2 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((u) => {
                  const tenant = u.tenantId ? tenantMap.get(u.tenantId) : null;
                  const isSuperadmin = u.role === "superadmin";
                  return (
                    <tr
                      key={u.id}
                      className="group transition-colors hover:bg-foreground/5"
                    >
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white"
                            style={{
                              background: `hsl(${u.hue ?? 215} 70% 45%)`,
                            }}
                          >
                            {initials(u.name, u.email)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-foreground">
                              {u.name}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        {tenant ? (
                          <Link
                            href={`/admin/tenants/${tenant.id}`}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/40 px-2 py-0.5 text-[11px] text-foreground hover:bg-foreground/5"
                          >
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{
                                background: `hsl(${(tenant.name.charCodeAt(0) * 37) % 360} 70% 45%)`,
                              }}
                            />
                            {tenant.name}
                          </Link>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-fuchsia-500/12 text-fuchsia-700 ring-fuchsia-500/30 dark:text-fuchsia-300"
                          >
                            Platform
                          </Badge>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {isSuperadmin ? (
                          <Badge
                            variant="outline"
                            className={cn(ROLE_META.superadmin.tone)}
                          >
                            {ROLE_META.superadmin.label}
                          </Badge>
                        ) : (
                          <Select
                            value={u.role}
                            onValueChange={(v) =>
                              updateUser(u.id, {
                                role: v as Exclude<UserRole, "superadmin">,
                              })
                            }
                          >
                            <SelectTrigger
                              className={cn(
                                "h-7 w-[130px] gap-1 border-border/60 text-[11px]",
                                ROLE_META[u.role].tone,
                              )}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TENANT_ROLES.map((r) => (
                                <SelectItem key={r} value={r}>
                                  {ROLE_META[r].label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            u.disabled
                              ? "bg-slate-500/20 text-slate-700 ring-slate-500/40 dark:text-slate-300"
                              : "bg-emerald-500/20 text-emerald-700 ring-emerald-500/40 dark:text-emerald-300",
                          )}
                        >
                          {u.disabled ? "Disabled" : "Active"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {u.createdAt ? relativeTime(u.createdAt) : "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                aria-label="User actions"
                                disabled={isSuperadmin}
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                User
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onSelect={() =>
                                  updateUser(u.id, { disabled: !u.disabled })
                                }
                                className="gap-2 text-xs"
                              >
                                <ShieldOff className="h-3.5 w-3.5" />
                                {u.disabled ? "Re-enable" : "Disable"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 text-xs text-destructive focus:text-destructive"
                                onSelect={() => {
                                  if (
                                    typeof window !== "undefined" &&
                                    !window.confirm(
                                      `Delete user "${u.name}"? This cannot be undone.`,
                                    )
                                  ) {
                                    return;
                                  }
                                  deleteUser(u.id);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-12 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                        <Users className="h-6 w-6 opacity-70" />
                        <p className="text-xs">No users match your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <NewUserDialog open={inviting} onOpenChange={setInviting} />
    </div>
  );
}
