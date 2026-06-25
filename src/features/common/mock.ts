/**
 * Tiny helpers to simulate async behaviour on top of the in-memory seed,
 * so the feature hooks can look identical to a real API client (TanStack
 * Query, mutations + invalidation, loading skeletons, etc.).
 */

export function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

export function clone<T>(value: T): T {
  // Structured clone is supported in modern browsers + Node 17+, but we
  // fall back to JSON for safety. Mock data is plain JSON so this is fine.
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
