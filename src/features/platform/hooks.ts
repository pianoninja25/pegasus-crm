"use client";

import { useMemo } from "react";

import type { AppUser, ID, UserRole } from "@/features/service/types";

import { usePlatformStore } from "./store";
import { storageSeverity, storageUsageFraction } from "./storage";
import { TENANT_PLAN_META, type Tenant } from "./types";

/**
 * Thin selector hooks over {@link usePlatformStore}.
 *
 * We intentionally *don't* use React Query here: the underlying Zustand
 * store is already a single reactive source of truth and each mutation
 * (createTenant, updateUser, etc.) synchronously updates state — so any
 * component subscribed via one of these selectors re-renders automatically
 * without needing an invalidate step. When the mock store is swapped for
 * a real backend, wrap these hooks in `useQuery` instead.
 */

/* ─────────────────────────── Tenants ─────────────────────────────────── */

export function useTenants(): Tenant[] {
  return usePlatformStore((s) => s.tenants);
}

export function useTenant(id: ID | undefined): Tenant | undefined {
  return usePlatformStore((s) =>
    id ? s.tenants.find((t) => t.id === id) : undefined,
  );
}

/* ─────────────────────────── Users ───────────────────────────────────── */

export function useAdminUsers(): AppUser[] {
  return usePlatformStore((s) => s.users);
}

export function useTenantUsers(tenantId: ID | undefined): AppUser[] {
  const users = useAdminUsers();
  return useMemo(
    () => (tenantId ? users.filter((u) => u.tenantId === tenantId) : []),
    [users, tenantId],
  );
}

export function useUserById(id: ID | undefined): AppUser | undefined {
  return usePlatformStore((s) =>
    id ? s.users.find((u) => u.id === id) : undefined,
  );
}

/* ─────────────────────────── Derived stats ───────────────────────────── */

export interface PlatformStats {
  tenantCount: number;
  activeTenants: number;
  suspendedTenants: number;
  trialTenants: number;
  pastDueTenants: number;
  userCount: number;
  usersByRole: Record<UserRole, number>;
  /** Sum of `storageBytesUsed` across every tenant. */
  storageBytesUsed: number;
  /** Sum of each tenant's plan quota (their "allowed" ceiling). */
  storageBytesQuota: number;
  /** Number of tenants with usage ≥ 75% of their quota. */
  tenantsNearQuota: number;
  /** Number of tenants with usage ≥ 100% of their quota. */
  tenantsOverQuota: number;
}

export function usePlatformStats(): PlatformStats {
  const tenants = useTenants();
  const users = useAdminUsers();

  return useMemo(() => {
    const usersByRole: Record<UserRole, number> = {
      superadmin: 0,
      administrator: 0,
      manager: 0,
      admin_staff: 0,
      engineer: 0,
    };
    for (const u of users) usersByRole[u.role] += 1;

    let storageBytesUsed = 0;
    let storageBytesQuota = 0;
    let tenantsNearQuota = 0;
    let tenantsOverQuota = 0;

    for (const t of tenants) {
      storageBytesUsed += t.storageBytesUsed;
      storageBytesQuota += TENANT_PLAN_META[t.plan].storageLimitBytes;
      const severity = storageSeverity(storageUsageFraction(t));
      if (severity === "warn" || severity === "critical") tenantsNearQuota += 1;
      if (severity === "over") tenantsOverQuota += 1;
    }

    return {
      tenantCount: tenants.length,
      activeTenants: tenants.filter((t) => t.status === "active").length,
      suspendedTenants: tenants.filter((t) => t.status === "suspended").length,
      trialTenants: tenants.filter((t) => t.status === "trial").length,
      pastDueTenants: tenants.filter((t) => t.status === "past_due").length,
      userCount: users.length,
      usersByRole,
      storageBytesUsed,
      storageBytesQuota,
      tenantsNearQuota,
      tenantsOverQuota,
    };
  }, [tenants, users]);
}
