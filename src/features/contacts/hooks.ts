"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  contacts as seedContacts,
  contactMap,
  companyMap,
  memberMap,
} from "@/features/common/seed";
import type { SeedContact } from "@/features/common/seed";
import { clone, delay } from "@/features/common/mock";

export const contactKeys = {
  all: ["contacts"] as const,
  list: () => [...contactKeys.all, "list"] as const,
  detail: (id: string) => [...contactKeys.all, "detail", id] as const,
};

// Mutable in-memory mirror so simulated mutations stick across renders.
let store: SeedContact[] = clone(seedContacts);

export function useContactList() {
  return useQuery({
    queryKey: contactKeys.list(),
    queryFn: () => delay(clone(store), 90),
  });
}

export function useContact(id: string | undefined) {
  return useQuery({
    queryKey: contactKeys.detail(id ?? ""),
    queryFn: () =>
      delay(
        store.find((c) => c.id === id) ?? null,
        90,
      ),
    enabled: !!id,
  });
}

export function useToggleStarContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(null, 60);
      store = store.map((c) =>
        c.id === id ? { ...c, starred: !c.starred } : c,
      );
      contactMap[id] = store.find((c) => c.id === id) ?? contactMap[id]!;
      return store.find((c) => c.id === id)!;
    },
    onSuccess: (updated) => {
      qc.setQueryData(contactKeys.detail(updated.id), updated);
      qc.invalidateQueries({ queryKey: contactKeys.list() });
    },
  });
}

/** Resolve a contact's company name without re-fetching. */
export function companyNameFor(companyId: string | null): string {
  if (!companyId) return "Unaffiliated";
  return companyMap[companyId]?.name ?? "Unknown";
}

/** Resolve an owner's name. */
export function ownerNameFor(ownerId: string): string {
  return memberMap[ownerId]?.name ?? "Unassigned";
}
