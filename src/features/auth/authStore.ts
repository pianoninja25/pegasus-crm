"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { company, currentUser, users } from "@/features/service/seed";
import {
  DEFAULT_TENANTS,
  SUPERADMIN_USER,
} from "@/features/platform/seed";
import type { UserRole } from "@/features/service/types";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  title: string;
  role: UserRole;
}

export interface SessionWorkspace {
  id: string;
  name: string;
  plan: string;
}

interface AuthStore {
  user: SessionUser | null;
  workspace: SessionWorkspace | null;
  hydrated: boolean;
  signInAs: (userId: string) => void;
  signIn: () => void;
  signInAsSuperadmin: () => void;
  signOut: () => void;
  setHydrated: (v: boolean) => void;
}

const defaultUser: SessionUser = {
  id: currentUser.id,
  name: currentUser.name,
  email: currentUser.email,
  title: currentUser.title,
  role: currentUser.role,
};

const defaultWorkspace: SessionWorkspace = {
  id: company.id,
  name: company.name,
  plan: company.plan,
};

const superadminSession: SessionUser = {
  id: SUPERADMIN_USER.id,
  name: SUPERADMIN_USER.name,
  email: SUPERADMIN_USER.email,
  title: SUPERADMIN_USER.title,
  role: SUPERADMIN_USER.role,
};

/**
 * Given a user id, look them up in the union of tenant-scoped seed users
 * and the platform superadmin. Falls back to the seed's `currentUser` so
 * the demo never breaks on a stale id from persisted state.
 */
function resolveUser(userId: string): {
  user: SessionUser;
  workspace: SessionWorkspace | null;
} {
  if (userId === SUPERADMIN_USER.id) {
    return { user: superadminSession, workspace: null };
  }
  const u = users.find((m) => m.id === userId) ?? currentUser;
  const tenant = DEFAULT_TENANTS.find((t) => t.id === u.tenantId);
  return {
    user: {
      id: u.id,
      name: u.name,
      email: u.email,
      title: u.title,
      role: u.role,
    },
    workspace: tenant
      ? { id: tenant.id, name: tenant.name, plan: tenant.plan }
      : defaultWorkspace,
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Mock session — signed-in by default so /dashboard is reachable
      // without having to log in every reload.
      user: defaultUser,
      workspace: defaultWorkspace,
      hydrated: false,
      signIn: () =>
        set({
          user: defaultUser,
          workspace: defaultWorkspace,
        }),
      signInAs: (userId) => {
        const { user, workspace } = resolveUser(userId);
        set({ user, workspace });
      },
      signInAsSuperadmin: () =>
        set({ user: superadminSession, workspace: null }),
      signOut: () => set({ user: null, workspace: null }),
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "pegasus-ac-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user,
        workspace: s.workspace,
      }),
      onRehydrateStorage: () => (s) => s?.setHydrated(true),
    },
  ),
);
