"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  deals as seedDeals,
  dealMap,
  contactMap,
  companyMap,
  memberMap,
  currentUser,
} from "@/features/common/seed";
import type { SeedDeal } from "@/features/common/seed";
import { clone, delay } from "@/features/common/mock";
import type { DealStage } from "@/features/common/types";

export const dealKeys = {
  all: ["deals"] as const,
  list: () => [...dealKeys.all, "list"] as const,
  detail: (id: string) => [...dealKeys.all, "detail", id] as const,
};

let store: SeedDeal[] = clone(seedDeals);

export function useDealList() {
  return useQuery({
    queryKey: dealKeys.list(),
    queryFn: () => delay(clone(store), 110),
  });
}

export function useDeal(id: string | undefined) {
  return useQuery({
    queryKey: dealKeys.detail(id ?? ""),
    queryFn: () => delay(store.find((d) => d.id === id) ?? null, 90),
    enabled: !!id,
  });
}

interface MoveStageInput {
  id: string;
  stage: DealStage;
}

export function useMoveDealStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stage }: MoveStageInput) => {
      await delay(null, 80);
      store = store.map((d) => {
        if (d.id !== id) return d;
        const nowIso = new Date().toISOString();
        const wasClosed = stage === "closed_won" || stage === "closed_lost";
        return {
          ...d,
          stage,
          updatedAt: nowIso,
          closedAt: wasClosed ? nowIso : undefined,
          stageHistory: [
            ...d.stageHistory,
            { stage, at: nowIso, actorId: currentUser.id },
          ],
        };
      });
      const updated = store.find((d) => d.id === id)!;
      dealMap[id] = updated;
      return updated;
    },
    onMutate: async ({ id, stage }) => {
      // Optimistic update so the kanban card moves the instant the user
      // drops it, rather than waiting for the 80ms mock latency.
      await qc.cancelQueries({ queryKey: dealKeys.list() });
      const previous = qc.getQueryData<SeedDeal[]>(dealKeys.list());
      if (previous) {
        qc.setQueryData<SeedDeal[]>(
          dealKeys.list(),
          previous.map((d) => (d.id === id ? { ...d, stage } : d)),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(dealKeys.list(), ctx.previous);
    },
    onSuccess: (updated) => {
      qc.setQueryData(dealKeys.detail(updated.id), updated);
      qc.invalidateQueries({ queryKey: dealKeys.list() });
    },
  });
}

export function companyNameFor(companyId: string): string {
  return companyMap[companyId]?.name ?? "Unknown";
}

export function ownerNameFor(ownerId: string): string {
  return memberMap[ownerId]?.name ?? "Unassigned";
}

export function contactNamesFor(ids: string[]): string[] {
  return ids.map((id) => contactMap[id]?.fullName ?? "Unknown");
}
