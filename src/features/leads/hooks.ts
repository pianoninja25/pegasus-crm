"use client";

import { useQuery } from "@tanstack/react-query";

import { leads as seedLeads, memberMap } from "@/features/common/seed";
import { clone, delay } from "@/features/common/mock";

export const leadKeys = {
  all: ["leads"] as const,
  list: () => [...leadKeys.all, "list"] as const,
};

const store = clone(seedLeads);

export function useLeadList() {
  return useQuery({
    queryKey: leadKeys.list(),
    queryFn: () => delay(clone(store), 90),
  });
}

export function ownerNameFor(ownerId: string): string {
  return memberMap[ownerId]?.name ?? "Unassigned";
}
