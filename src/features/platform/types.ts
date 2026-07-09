/**
 * Platform-level types for **superadmin** management of the multi-tenant
 * SaaS surface (tenants + cross-tenant users).
 *
 * These live outside the tenant-scoped `features/service` layer since they
 * describe the "control plane" — what a platform superadmin sees at
 * `/admin`, above any single workspace.
 */

import type { ID } from "@/features/service/types";

/** Subscription tier a tenant is currently on. */
export type TenantPlan = "Starter" | "Growth" | "Scale" | "Enterprise";

export const TENANT_PLAN_META: Record<
  TenantPlan,
  {
    label: string;
    tone: string;
    seats: number;
    priceMonthly: number;
    /**
     * Included storage quota in bytes. Once exceeded the tenant either has
     * upload writes blocked (real backend) or a nag banner shown here.
     */
    storageLimitBytes: number;
  }
> = {
  Starter: {
    label: "Starter",
    tone: "bg-slate-500/20 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300 ring-slate-500/40",
    seats: 3,
    priceMonthly: 49,
    storageLimitBytes: 1 * 1024 ** 3, // 1 GB
  },
  Growth: {
    label: "Growth",
    tone: "bg-sky-500/20 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 ring-sky-500/40",
    seats: 10,
    priceMonthly: 149,
    storageLimitBytes: 10 * 1024 ** 3, // 10 GB
  },
  Scale: {
    label: "Scale",
    tone: "bg-violet-500/20 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 ring-violet-500/40",
    seats: 25,
    priceMonthly: 349,
    storageLimitBytes: 50 * 1024 ** 3, // 50 GB
  },
  Enterprise: {
    label: "Enterprise",
    tone: "bg-fuchsia-500/20 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300 ring-fuchsia-500/40",
    seats: 100,
    priceMonthly: 999,
    storageLimitBytes: 500 * 1024 ** 3, // 500 GB
  },
};

/**
 * Categories that make up a tenant's total storage. Splits are surfaced
 * on the tenant detail page so a superadmin can see *why* usage is high.
 */
export type StorageCategory =
  | "photos"
  | "database"
  | "documents"
  | "logs";

export const STORAGE_CATEGORY_META: Record<
  StorageCategory,
  { label: string; tone: string; caption: string }
> = {
  photos: {
    label: "Photos & attachments",
    tone: "bg-sky-500/20 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300 ring-sky-500/40",
    caption: "Before/after service photos, signatures, receipts.",
  },
  database: {
    label: "Application data",
    tone: "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-500/40",
    caption: "Customers, visits, invoices, contracts, users.",
  },
  documents: {
    label: "Generated documents",
    tone: "bg-violet-500/20 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300 ring-violet-500/40",
    caption: "Quotation, invoice, and contract PDFs.",
  },
  logs: {
    label: "Logs & cached backups",
    tone: "bg-amber-500/20 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-500/40",
    caption: "Audit trail, error logs, rolling snapshots.",
  },
};

/**
 * Lifecycle state a tenant can be in.
 *
 * - `trial`      → free trial window, not yet paying
 * - `active`     → healthy, paying tenant
 * - `past_due`   → last invoice failed, still has access
 * - `suspended`  → access frozen by platform admin (visible but locked)
 */
export type TenantStatus = "trial" | "active" | "past_due" | "suspended";

export const TENANT_STATUS_META: Record<
  TenantStatus,
  { label: string; tone: string; dotClass: string }
> = {
  trial: {
    label: "Trial",
    tone: "bg-amber-500/20 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300 ring-amber-500/40",
    dotClass: "bg-amber-500",
  },
  active: {
    label: "Active",
    tone: "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 ring-emerald-500/40",
    dotClass: "bg-emerald-500",
  },
  past_due: {
    label: "Past due",
    tone: "bg-rose-500/20 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 ring-rose-500/40",
    dotClass: "bg-rose-500",
  },
  suspended: {
    label: "Suspended",
    tone: "bg-slate-500/25 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300 ring-slate-500/50",
    dotClass: "bg-slate-500",
  },
};

/**
 * A tenant (workspace) that lives in the platform. Every non-superadmin
 * user belongs to exactly one tenant via `AppUser.tenantId`.
 */
export interface Tenant {
  id: ID;
  name: string;
  /** URL-safe slug — could later map to a subdomain like `acme.pegasus.app`. */
  slug: string;
  plan: TenantPlan;
  status: TenantStatus;
  /** Country code (ISO 3166 alpha-2) for the billing address. */
  country: string;
  /** Free-form industry tag surfaced on the tenant detail page. */
  industry: string;
  /** User id of the tenant "owner" (usually the founding administrator). */
  ownerId: ID;
  /** ISO timestamps. */
  createdAt: string;
  /** When the trial ends. Only meaningful when `status === "trial"`. */
  trialEndsAt?: string;
  /** Free-form notes visible to superadmins only. */
  notes?: string;
  /**
   * Current billed storage footprint in bytes across every category
   * ({@link StorageCategory}). See {@link storageBreakdownFor} in
   * `features/platform/storage.ts` for the per-category derivation.
   */
  storageBytesUsed: number;
}
