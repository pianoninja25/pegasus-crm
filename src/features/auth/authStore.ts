"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { currentUser, teamMembers, workspace } from "@/features/common/seed";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  title: string;
}

export interface SessionWorkspace {
  id: string;
  name: string;
  plan: string;
  role: string;
}

interface AuthStore {
  user: SessionUser | null;
  workspace: SessionWorkspace | null;
  workspaces: SessionWorkspace[];
  hydrated: boolean;
  signIn: () => void;
  signOut: () => void;
  setHydrated: (v: boolean) => void;
}

const defaultUser: SessionUser = {
  id: currentUser.id,
  name: currentUser.name,
  email: currentUser.email,
  title: currentUser.title,
};

const defaultWorkspace: SessionWorkspace = {
  id: workspace.id,
  name: workspace.name,
  plan: workspace.plan,
  role: teamMembers.find((m) => m.id === currentUser.id)?.role ?? "owner",
};

const alternateWorkspace: SessionWorkspace = {
  id: "ws_pegasus_labs",
  name: "Pegasus Labs",
  plan: "Scale",
  role: "admin",
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Mock session is signed-in by default so /dashboard is reachable
      // without having to log in every reload.
      user: defaultUser,
      workspace: defaultWorkspace,
      workspaces: [defaultWorkspace, alternateWorkspace],
      hydrated: false,
      signIn: () =>
        set({
          user: defaultUser,
          workspace: defaultWorkspace,
          workspaces: [defaultWorkspace, alternateWorkspace],
        }),
      signOut: () => set({ user: null, workspace: null, workspaces: [] }),
      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "pegasus-crm-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user,
        workspace: s.workspace,
        workspaces: s.workspaces,
      }),
      onRehydrateStorage: () => (s) => s?.setHydrated(true),
    },
  ),
);
