"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AppUser, ID, UserRole } from "@/features/service/types";

import { DEFAULT_PLATFORM_USERS, DEFAULT_TENANTS } from "./seed";
import type { Tenant, TenantPlan, TenantStatus } from "./types";

/**
 * Persistent client-side "control plane" store — this is the mock backend
 * for the superadmin `/admin` area. It owns:
 *
 *   • every {@link Tenant} on the platform
 *   • every {@link AppUser} across all tenants (plus the `superadmin` user)
 *
 * When a real backend arrives, replace the direct mutations in this store
 * with fetches; the shape of the state and the hooks in `hooks.ts` don't
 * need to change.
 */

export interface CreateTenantInput {
  name: string;
  slug: string;
  plan: TenantPlan;
  country: string;
  industry: string;
  status?: TenantStatus;
  /**
   * Optionally seed an owner administrator user at the same time. When
   * provided, a corresponding {@link AppUser} is created and linked as the
   * tenant's `ownerId`.
   */
  owner?: {
    name: string;
    email: string;
    phone?: string;
    title?: string;
  };
  notes?: string;
}

export interface UpdateTenantInput {
  name?: string;
  slug?: string;
  plan?: TenantPlan;
  status?: TenantStatus;
  country?: string;
  industry?: string;
  notes?: string;
}

export interface CreateUserInput {
  tenantId: ID;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  role: Exclude<UserRole, "superadmin">;
  skills?: string[];
  experienceYears?: number;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  role?: Exclude<UserRole, "superadmin">;
  disabled?: boolean;
  tenantId?: ID;
}

interface PlatformStore {
  tenants: Tenant[];
  users: AppUser[];
  hydrated: boolean;

  /* ---------- Tenants ---------- */
  createTenant: (input: CreateTenantInput) => Tenant;
  updateTenant: (id: ID, patch: UpdateTenantInput) => void;
  suspendTenant: (id: ID) => void;
  resumeTenant: (id: ID) => void;
  deleteTenant: (id: ID) => void;

  /* ---------- Storage ---------- */
  /** Set a tenant's total storage footprint (in bytes) directly. */
  setTenantStorage: (id: ID, bytes: number) => void;
  /**
   * Simulate purging cached logs + backups for a tenant. Removes roughly
   * `fraction` of the current footprint (default 8% — matches the
   * logs+backups slice from the deterministic breakdown).
   */
  purgeTenantCache: (id: ID, fraction?: number) => number;

  /* ---------- Users ---------- */
  createUser: (input: CreateUserInput) => AppUser;
  updateUser: (id: ID, patch: UpdateUserInput) => void;
  deleteUser: (id: ID) => void;

  setHydrated: (v: boolean) => void;
  resetToSeed: () => void;
}

function newId(prefix: string): ID {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const usePlatformStore = create<PlatformStore>()(
  persist(
    (set, get) => ({
      tenants: DEFAULT_TENANTS,
      users: DEFAULT_PLATFORM_USERS,
      hydrated: false,

      createTenant: (input) => {
        const id = newId("t");
        const ownerId = input.owner ? newId("u") : `${id}_owner`;

        const tenant: Tenant = {
          id,
          name: input.name.trim(),
          slug: input.slug.trim().toLowerCase(),
          plan: input.plan,
          status: input.status ?? "trial",
          country: input.country,
          industry: input.industry,
          ownerId,
          createdAt: nowIso(),
          notes: input.notes,
          trialEndsAt:
            (input.status ?? "trial") === "trial"
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
              : undefined,
          storageBytesUsed: 0,
        };

        set((s) => ({ tenants: [tenant, ...s.tenants] }));

        if (input.owner) {
          const owner: AppUser = {
            id: ownerId,
            tenantId: id,
            name: input.owner.name.trim(),
            email: input.owner.email.trim(),
            phone: input.owner.phone?.trim() ?? "",
            role: "administrator",
            title: input.owner.title?.trim() || "Administrator",
            hue: Math.round(Math.random() * 360),
            createdAt: tenant.createdAt,
          };
          set((s) => ({ users: [owner, ...s.users] }));
        }

        return tenant;
      },

      updateTenant: (id, patch) =>
        set((s) => ({
          tenants: s.tenants.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...patch,
                  name: patch.name?.trim() ?? t.name,
                  slug: patch.slug?.trim().toLowerCase() ?? t.slug,
                }
              : t,
          ),
        })),

      suspendTenant: (id) =>
        set((s) => ({
          tenants: s.tenants.map((t) =>
            t.id === id ? { ...t, status: "suspended" as const } : t,
          ),
        })),

      resumeTenant: (id) =>
        set((s) => ({
          tenants: s.tenants.map((t) =>
            t.id === id ? { ...t, status: "active" as const } : t,
          ),
        })),

      deleteTenant: (id) =>
        set((s) => ({
          tenants: s.tenants.filter((t) => t.id !== id),
          users: s.users.filter((u) => u.tenantId !== id),
        })),

      setTenantStorage: (id, bytes) =>
        set((s) => ({
          tenants: s.tenants.map((t) =>
            t.id === id
              ? { ...t, storageBytesUsed: Math.max(0, Math.round(bytes)) }
              : t,
          ),
        })),

      purgeTenantCache: (id, fraction = 0.08) => {
        const tenant = get().tenants.find((t) => t.id === id);
        if (!tenant) return 0;
        const freed = Math.round(tenant.storageBytesUsed * fraction);
        set((s) => ({
          tenants: s.tenants.map((t) =>
            t.id === id
              ? {
                  ...t,
                  storageBytesUsed: Math.max(0, t.storageBytesUsed - freed),
                }
              : t,
          ),
        }));
        return freed;
      },

      createUser: (input) => {
        const user: AppUser = {
          id: newId("u"),
          tenantId: input.tenantId,
          name: input.name.trim(),
          email: input.email.trim(),
          phone: input.phone?.trim() ?? "",
          role: input.role,
          title: input.title?.trim() || defaultTitleFor(input.role),
          skills: input.skills ?? [],
          experienceYears: input.experienceYears,
          hue: Math.round(Math.random() * 360),
          createdAt: nowIso(),
        };
        set((s) => ({ users: [user, ...s.users] }));
        return user;
      },

      updateUser: (id, patch) =>
        set((s) => ({
          users: s.users.map((u) =>
            u.id === id
              ? {
                  ...u,
                  ...patch,
                  name: patch.name?.trim() ?? u.name,
                  email: patch.email?.trim() ?? u.email,
                }
              : u,
          ),
        })),

      deleteUser: (id) => {
        const target = get().users.find((u) => u.id === id);
        if (target?.role === "superadmin") {
          return;
        }
        set((s) => {
          const remainingUsers = s.users.filter((u) => u.id !== id);

          const remainingTenants = s.tenants.map((t) =>
            t.ownerId === id
              ? {
                  ...t,
                  ownerId:
                    remainingUsers.find(
                      (u) => u.tenantId === t.id && u.role === "administrator",
                    )?.id ??
                    remainingUsers.find((u) => u.tenantId === t.id)?.id ??
                    t.ownerId,
                }
              : t,
          );

          return { users: remainingUsers, tenants: remainingTenants };
        });
      },

      setHydrated: (v) => set({ hydrated: v }),
      resetToSeed: () =>
        set({ tenants: DEFAULT_TENANTS, users: DEFAULT_PLATFORM_USERS }),
    }),
    {
      name: "pegasus-platform",
      // Bump version whenever the persisted shape changes. v2 adds
      // `storageBytesUsed` to every Tenant — older state is discarded
      // and reseeded from `DEFAULT_TENANTS`.
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ tenants: s.tenants, users: s.users }),
      migrate: (persisted, fromVersion) => {
        if (fromVersion < 2) {
          return {
            tenants: DEFAULT_TENANTS,
            users: DEFAULT_PLATFORM_USERS,
          };
        }
        return persisted as { tenants: Tenant[]; users: AppUser[] };
      },
      onRehydrateStorage: () => (s) => s?.setHydrated(true),
    },
  ),
);

function defaultTitleFor(role: Exclude<UserRole, "superadmin">): string {
  switch (role) {
    case "administrator":
      return "Administrator";
    case "manager":
      return "Manager";
    case "admin_staff":
      return "Admin Staff";
    case "engineer":
      return "Engineer";
  }
}
