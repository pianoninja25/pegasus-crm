/**
 * Tiny helpers to simulate async behaviour on top of the in-memory seeds,
 * so the feature hooks can look identical to a real API client (TanStack
 * Query, mutations + invalidation, loading skeletons, etc.).
 */

export function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

export function clone<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
