"use client";

import { useQuery } from "@tanstack/react-query";

import { companies as seedCompanies, contactMap, dealMap, memberMap } from "@/features/common/seed";
import type { SeedCompany, SeedContact, SeedDeal } from "@/features/common/seed";
import { clone, delay } from "@/features/common/mock";

export const companyKeys = {
  all: ["companies"] as const,
  list: () => [...companyKeys.all, "list"] as const,
  detail: (id: string) => [...companyKeys.all, "detail", id] as const,
  contacts: (id: string) => [...companyKeys.all, "contacts", id] as const,
  deals: (id: string) => [...companyKeys.all, "deals", id] as const,
};

const store: SeedCompany[] = clone(seedCompanies);

export function useCompanyList() {
  return useQuery({
    queryKey: companyKeys.list(),
    queryFn: () => delay(clone(store), 90),
  });
}

export function useCompany(id: string | undefined) {
  return useQuery({
    queryKey: companyKeys.detail(id ?? ""),
    queryFn: () => delay(store.find((c) => c.id === id) ?? null, 90),
    enabled: !!id,
  });
}

export function useCompanyContacts(companyId: string | undefined) {
  return useQuery({
    queryKey: companyKeys.contacts(companyId ?? ""),
    queryFn: () => {
      const out: SeedContact[] = Object.values(contactMap).filter(
        (c) => c.companyId === companyId,
      );
      return delay(out, 70);
    },
    enabled: !!companyId,
  });
}

export function useCompanyDeals(companyId: string | undefined) {
  return useQuery({
    queryKey: companyKeys.deals(companyId ?? ""),
    queryFn: () => {
      const out: SeedDeal[] = Object.values(dealMap).filter(
        (d) => d.companyId === companyId,
      );
      return delay(out, 70);
    },
    enabled: !!companyId,
  });
}

export function ownerNameFor(ownerId: string): string {
  return memberMap[ownerId]?.name ?? "Unassigned";
}
