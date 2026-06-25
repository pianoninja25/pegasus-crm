"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { activities as seedActivities, memberMap } from "@/features/common/seed";
import type { SeedActivity } from "@/features/common/seed";
import { clone, delay } from "@/features/common/mock";

export const activityKeys = {
  all: ["activities"] as const,
  list: () => [...activityKeys.all, "list"] as const,
  forDeal: (id: string) => [...activityKeys.all, "deal", id] as const,
  forContact: (id: string) => [...activityKeys.all, "contact", id] as const,
  forCompany: (id: string) => [...activityKeys.all, "company", id] as const,
};

let store: SeedActivity[] = clone(seedActivities);

export function useActivityList() {
  return useQuery({
    queryKey: activityKeys.list(),
    queryFn: () => delay(clone(store), 100),
  });
}

export function useDealActivities(dealId: string | undefined) {
  return useQuery({
    queryKey: activityKeys.forDeal(dealId ?? ""),
    queryFn: () => delay(store.filter((a) => a.dealId === dealId), 80),
    enabled: !!dealId,
  });
}

export function useContactActivities(contactId: string | undefined) {
  return useQuery({
    queryKey: activityKeys.forContact(contactId ?? ""),
    queryFn: () => delay(store.filter((a) => a.contactId === contactId), 80),
    enabled: !!contactId,
  });
}

export function useCompanyActivities(companyId: string | undefined) {
  return useQuery({
    queryKey: activityKeys.forCompany(companyId ?? ""),
    queryFn: () => delay(store.filter((a) => a.companyId === companyId), 80),
    enabled: !!companyId,
  });
}

export function useToggleActivityComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(null, 60);
      store = store.map((a) =>
        a.id === id
          ? {
              ...a,
              completedAt: a.completedAt ? undefined : new Date().toISOString(),
            }
          : a,
      );
      return store.find((a) => a.id === id)!;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: activityKeys.all });
    },
  });
}

export function ownerNameFor(ownerId: string): string {
  return memberMap[ownerId]?.name ?? "Unassigned";
}

export function openActivityCount(): number {
  return store.filter((a) => !a.completedAt).length;
}
