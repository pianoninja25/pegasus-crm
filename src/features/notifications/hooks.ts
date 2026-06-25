"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notifications as seedNotifications } from "@/features/common/seed";
import type { SeedNotification } from "@/features/common/seed";
import { clone, delay } from "@/features/common/mock";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationKeys.all, "list"] as const,
};

let store: SeedNotification[] = clone(seedNotifications);

export function useNotificationsList() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: () => delay(clone(store), 90),
  });
}

export function unreadNotificationsCount(): number {
  return store.filter((n) => !n.read).length;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await delay(null, 40);
      store = store.map((n) => (n.id === id ? { ...n, read: true } : n));
      return store.find((n) => n.id === id)!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await delay(null, 60);
      store = store.map((n) => ({ ...n, read: true }));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
