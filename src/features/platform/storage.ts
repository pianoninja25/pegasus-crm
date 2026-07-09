/**
 * Deterministic per-tenant storage math used by the admin console.
 *
 * The demo has no real filesystem or database — tenants persist their
 * total `storageBytesUsed` in the platform store, and everything else
 * (the per-category breakdown surfaced on the detail page, the "close to
 * quota" tone on the tenants list) is derived from that single number
 * plus a stable hash of the tenant id so the numbers don't jitter on
 * every render.
 *
 * When a real backend arrives, replace {@link storageBreakdownFor} with a
 * server call that returns actual bucket sizes — the callers here don't
 * need to change.
 */

import { TENANT_PLAN_META, type StorageCategory, type Tenant } from "./types";

/**
 * Base split of a tenant's total footprint across categories. The percentages
 * sum to 1. In a real product photos dominate — HVAC field service
 * generates before/after shots, signatures, receipts — so we bias the
 * default that way.
 */
const BASE_SPLIT: Record<StorageCategory, number> = {
  photos: 0.6,
  database: 0.22,
  documents: 0.12,
  logs: 0.06,
};

/** Simple 32-bit hash of a string used to deterministically perturb a tenant's split. */
function hash32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface StorageBreakdownRow {
  category: StorageCategory;
  bytes: number;
  /** Fraction of the tenant's total (0..1). */
  share: number;
}

/**
 * Derive a per-category breakdown for a tenant. The base split is nudged
 * per-tenant using a stable hash so different workspaces show slightly
 * different patterns — while still summing exactly to the persisted
 * `storageBytesUsed` value.
 */
export function storageBreakdownFor(tenant: Tenant): StorageBreakdownRow[] {
  const seed = hash32(tenant.id);
  const jitter = (n: number, span: number) =>
    ((seed >>> (n * 4)) & 0xff) / 255 * span - span / 2;

  const raw: Record<StorageCategory, number> = {
    photos: Math.max(0.15, BASE_SPLIT.photos + jitter(0, 0.15)),
    database: Math.max(0.05, BASE_SPLIT.database + jitter(1, 0.06)),
    documents: Math.max(0.03, BASE_SPLIT.documents + jitter(2, 0.05)),
    logs: Math.max(0.02, BASE_SPLIT.logs + jitter(3, 0.03)),
  };
  const total = raw.photos + raw.database + raw.documents + raw.logs;

  const rows: StorageBreakdownRow[] = (
    ["photos", "database", "documents", "logs"] as StorageCategory[]
  ).map((category) => {
    const share = raw[category] / total;
    return {
      category,
      share,
      bytes: Math.round(tenant.storageBytesUsed * share),
    };
  });

  // Fix rounding drift so the four rows sum to exactly `storageBytesUsed`.
  const diff =
    tenant.storageBytesUsed - rows.reduce((acc, r) => acc + r.bytes, 0);
  if (diff !== 0 && rows[0]) rows[0].bytes += diff;

  return rows;
}

/**
 * Fraction (0..1) of the tenant's plan quota that is currently in use.
 * Values > 1 indicate over-quota — flagged red in the UI.
 */
export function storageUsageFraction(tenant: Tenant): number {
  const limit = TENANT_PLAN_META[tenant.plan].storageLimitBytes;
  if (limit <= 0) return 0;
  return tenant.storageBytesUsed / limit;
}

/** Semantic bucket used by the UI to pick a colour / warn banner. */
export type StorageSeverity = "ok" | "warn" | "critical" | "over";

export function storageSeverity(fraction: number): StorageSeverity {
  if (fraction >= 1) return "over";
  if (fraction >= 0.9) return "critical";
  if (fraction >= 0.75) return "warn";
  return "ok";
}
