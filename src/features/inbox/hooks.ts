"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { conversations as seedConversations } from "@/features/common/seed";
import type { SeedConversation } from "@/features/common/seed";
import { clone, delay } from "@/features/common/mock";

export const inboxKeys = {
  all: ["inbox"] as const,
  list: () => [...inboxKeys.all, "list"] as const,
  detail: (id: string) => [...inboxKeys.all, "detail", id] as const,
};

let store: SeedConversation[] = clone(seedConversations);

export function useInboxList() {
  return useQuery({
    queryKey: inboxKeys.list(),
    queryFn: () =>
      delay(
        [...store].sort(
          (a, b) =>
            new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
        ),
        90,
      ),
  });
}

export function useConversation(id: string | undefined) {
  return useQuery({
    queryKey: inboxKeys.detail(id ?? ""),
    queryFn: () => delay(store.find((c) => c.id === id) ?? null, 60),
    enabled: !!id,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(null, 40);
      store = store.map((c) => (c.id === id ? { ...c, unread: false } : c));
      return store.find((c) => c.id === id)!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: inboxKeys.all }),
  });
}

export function useToggleStarConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(null, 40);
      store = store.map((c) =>
        c.id === id ? { ...c, starred: !c.starred } : c,
      );
      return store.find((c) => c.id === id)!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: inboxKeys.all }),
  });
}

export function unreadInboxCount(): number {
  return store.filter((c) => c.unread).length;
}
