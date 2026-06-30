"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { company, currentUser, users } from "@/features/service/seed";
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
        const u = users.find((m) => m.id === userId) ?? currentUser;
        set({
          user: {
            id: u.id,
            name: u.name,
            email: u.email,
            title: u.title,
            role: u.role,
          },
          workspace: defaultWorkspace,
        });
      },
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
