"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Building2,
  CircleDollarSign,
  HardDrive,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Save,
  ShieldOff,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";

import { NewUserDialog } from "@/components/admin/NewUserDialog";
import { StorageUsageBar } from "@/components/admin/StorageUsageBar";
import { TenantStorageCard } from "@/components/admin/TenantStorageCard";
import { InsightCard } from "@/components/common/InsightCard";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useTenant,
  useTenantUsers,
} from "@/features/platform/hooks";
import { usePlatformStore } from "@/features/platform/store";
import {
  TENANT_PLAN_META,
  TENANT_STATUS_META,
  type TenantPlan,
  type TenantStatus,
} from "@/features/platform/types";
import {
  ROLE_META,
  TENANT_ROLES,
  type UserRole,
} from "@/features/service/types";
import { formatNumber, initials, relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const PLAN_OPTIONS: TenantPlan[] = ["Starter", "Growth", "Scale", "Enterprise"];
const STATUS_OPTIONS: TenantStatus[] = [
  "trial",
  "active",
  "past_due",
  "suspended",
];

export default function AdminTenantDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const tenantId = params?.id;
  const tenant = useTenant(tenantId);
  const users = useTenantUsers(tenantId);

  const updateTenant = usePlatformStore((s) => s.updateTenant);
  const suspendTenant = usePlatformStore((s) => s.suspendTenant);
  const resumeTenant = usePlatformStore((s) => s.resumeTenant);
  const deleteTenant = usePlatformStore((s) => s.deleteTenant);
  const updateUser = usePlatformStore((s) => s.updateUser);
  const deleteUser = usePlatformStore((s) => s.deleteUser);

  const [invitingUser, setInvitingUser] = useState(false);

  if (!tenant) {
    return (
      <div className="space-y-4">
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="h-8 gap-1.5 px-2 text-xs"
        >
          <Link href="/admin/tenants">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to tenants
          </Link>
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
            <Building2 className="h-8 w-8 text-muted-foreground opacity-70" />
            <p className="text-sm font-semibold">Tenant not found</p>
            <p className="text-xs text-muted-foreground">
              It may have been deleted from another tab.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const planMeta = TENANT_PLAN_META[tenant.plan];
  const statusMeta = TENANT_STATUS_META[tenant.status];
  const seatCount = users.length;
  const overCapacity = seatCount > planMeta.seats;

  const handleDelete = () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm(
        `Delete tenant "${tenant.name}" and all its ${seatCount} users? This cannot be undone.`,
      );
      if (!ok) return;
    }
    deleteTenant(tenant.id);
    router.push("/admin/tenants");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="mb-3 h-8 gap-1.5 px-2 text-xs"
        >
          <Link href="/admin/tenants">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to tenants
          </Link>
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span
              className="inline-flex h-12 w-12 items-center justify-center rounded-lg text-sm font-semibold text-white"
              style={{
                background: `hsl(${(tenant.name.charCodeAt(0) * 37) % 360} 70% 45%)`,
              }}
            >
              {initials(tenant.name)}
            </span>
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">
                {tenant.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className={cn(planMeta.tone)}>
                  {planMeta.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("gap-1", statusMeta.tone)}
                >
                  <span
                    className={cn(
                      "inline-block h-1.5 w-1.5 rounded-full",
                      statusMeta.dotClass,
                    )}
                  />
                  {statusMeta.label}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {tenant.slug} · {tenant.industry} · {tenant.country}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  · created {relativeTime(tenant.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {tenant.status !== "suspended" ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={() => suspendTenant(tenant.id)}
              >
                <Pause className="h-3.5 w-3.5" /> Suspend
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={() => resumeTenant(tenant.id)}
              >
                <Play className="h-3.5 w-3.5" /> Resume
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InsightCard
          icon={Users}
          label="Users"
          value={formatNumber(seatCount)}
          caption={`Seats: ${seatCount} / ${planMeta.seats}`}
          tone={overCapacity ? "destructive" : "primary"}
          variant="compact"
        />
        <InsightCard
          icon={CircleDollarSign}
          label="Plan value"
          value={`$${planMeta.priceMonthly}/mo`}
          caption={`${planMeta.label} tier`}
          tone="success"
          variant="compact"
        />
        <InsightCard
          icon={ShieldOff}
          label="Status"
          value={statusMeta.label}
          caption={
            tenant.status === "trial" && tenant.trialEndsAt
              ? `Trial ends ${new Date(tenant.trialEndsAt).toLocaleDateString()}`
              : tenant.status === "past_due"
                ? "Retry billing soon"
                : "—"
          }
          tone={
            tenant.status === "active"
              ? "success"
              : tenant.status === "suspended"
                ? "destructive"
                : "warn"
          }
          variant="compact"
        />
        <Card className="overflow-hidden">
          <CardContent className="flex items-start gap-2.5 p-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-inset ring-primary/25">
              <HardDrive className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Storage
              </p>
              <StorageUsageBar
                usedBytes={tenant.storageBytesUsed}
                limitBytes={planMeta.storageLimitBytes}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings + Users */}
      <div className="grid gap-4 lg:grid-cols-5">
        <TenantSettingsCard
          key={tenant.id}
          tenantId={tenant.id}
          initialName={tenant.name}
          initialSlug={tenant.slug}
          initialPlan={tenant.plan}
          initialStatus={tenant.status}
          initialCountry={tenant.country}
          initialIndustry={tenant.industry}
          initialNotes={tenant.notes ?? ""}
          onSave={(patch) => updateTenant(tenant.id, patch)}
        />

        <Card className="lg:col-span-3">
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-sm font-semibold tracking-tight">
                  Members
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Users belonging to this tenant.
                </p>
              </div>
              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setInvitingUser(true)}
              >
                <Plus className="h-3.5 w-3.5" /> Invite user
              </Button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-xs">
                <thead className="border-b border-border/60 bg-card/40">
                  <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2 font-semibold">User</th>
                    <th className="px-3 py-2 font-semibold">Role</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {users.map((u) => {
                    const isOwner = u.id === tenant.ownerId;
                    return (
                      <tr key={u.id}>
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
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                <span className="truncate">{u.name}</span>
                                {isOwner && (
                                  <Badge
                                    variant="outline"
                                    className="h-4 px-1.5 text-[9px]"
                                  >
                                    Owner
                                  </Badge>
                                )}
                              </div>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {u.email} · {u.title}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
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
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  aria-label="User actions"
                                >
                                  <MoreHorizontal className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-48"
                              >
                                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  User
                                </DropdownMenuLabel>
                                {!isOwner && (
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      updateTenant(tenant.id, {
                                        // Promote to owner: nudge their role
                                        // to administrator and update tenant.
                                      })
                                    }
                                    className="gap-2 text-xs"
                                    disabled
                                  >
                                    <UserCog className="h-3.5 w-3.5" /> Make owner
                                    <span className="ml-auto text-[10px] text-muted-foreground">
                                      soon
                                    </span>
                                  </DropdownMenuItem>
                                )}
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
                                        `Remove ${u.name} from ${tenant.name}?`,
                                      )
                                    ) {
                                      return;
                                    }
                                    deleteUser(u.id);
                                  }}
                                  disabled={isOwner}
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-10 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                          <Users className="h-6 w-6 opacity-70" />
                          <p className="text-xs">
                            No users yet — invite one to get started.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Storage & usage */}
      <TenantStorageCard tenant={tenant} />

      <NewUserDialog
        open={invitingUser}
        onOpenChange={setInvitingUser}
        defaultTenantId={tenant.id}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Settings card                                                       */
/* ------------------------------------------------------------------ */

interface TenantSettingsCardProps {
  tenantId: string;
  initialName: string;
  initialSlug: string;
  initialPlan: TenantPlan;
  initialStatus: TenantStatus;
  initialCountry: string;
  initialIndustry: string;
  initialNotes: string;
  onSave: (patch: {
    name: string;
    slug: string;
    plan: TenantPlan;
    status: TenantStatus;
    country: string;
    industry: string;
    notes: string;
  }) => void;
}

function TenantSettingsCard({
  initialName,
  initialSlug,
  initialPlan,
  initialStatus,
  initialCountry,
  initialIndustry,
  initialNotes,
  onSave,
}: TenantSettingsCardProps) {
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [plan, setPlan] = useState<TenantPlan>(initialPlan);
  const [status, setStatus] = useState<TenantStatus>(initialStatus);
  const [country, setCountry] = useState(initialCountry);
  const [industry, setIndustry] = useState(initialIndustry);
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(false);

  const dirty =
    name !== initialName ||
    slug !== initialSlug ||
    plan !== initialPlan ||
    status !== initialStatus ||
    country !== initialCountry ||
    industry !== initialIndustry ||
    notes !== initialNotes;

  return (
    <Card className="lg:col-span-2">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm font-semibold tracking-tight">
              Tenant settings
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Change plan, status, or metadata.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Plan</Label>
              <Select
                value={plan}
                onValueChange={(v) => setPlan(v as TenantPlan)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_OPTIONS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {TENANT_PLAN_META[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as TenantStatus)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {TENANT_STATUS_META[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">
                Country
              </Label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">
                Industry
              </Label>
              <Input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">
              Internal notes
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="text-xs"
            />
          </div>

          <Button
            size="sm"
            className="mt-1 h-8 w-full gap-1.5 text-xs"
            disabled={!dirty}
            onClick={() => {
              onSave({ name, slug, plan, status, country, industry, notes });
              setSaved(true);
              setTimeout(() => setSaved(false), 1500);
            }}
          >
            <Save className="h-3.5 w-3.5" />
            {saved ? "Saved" : dirty ? "Save changes" : "No changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
