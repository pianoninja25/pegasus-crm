/**
 * Seed data for the multi-tenant control plane.
 *
 * We surface **four demo tenants** so the superadmin `/admin` area feels
 * populated at first boot. The primary tenant (`t_pegasus_ac`) mirrors the
 * pre-existing single-workspace demo and owns every user that was already
 * seeded in `features/service/seed.ts`. The remaining three tenants get
 * their own generated staff so the cross-tenant user table has enough
 * variety to demonstrate filtering.
 *
 * All data is deterministic (fixed strings, no PRNG) so the platform store
 * can safely rehydrate from localStorage without diverging from what the
 * dashboard already renders.
 */

import { users as serviceUsers } from "@/features/service/seed";
import type { AppUser, ID } from "@/features/service/types";

import type { Tenant } from "./types";

export const DEFAULT_TENANT_ID: ID = "t_pegasus_ac";

/** Fixed platform superadmin. Not tied to any tenant. */
export const SUPERADMIN_USER: AppUser = {
  id: "u_superadmin",
  name: "Ava Sterling",
  email: "ava@pegasus.platform",
  phone: "+1 415-555-0100",
  role: "superadmin",
  title: "Platform Admin",
  hue: 300,
  createdAt: "2022-11-01T00:00:00.000Z",
};

const GB = 1024 ** 3;
const MB = 1024 ** 2;

/** The default tenant, matching the pre-existing demo workspace. */
const primaryTenant: Tenant = {
  id: DEFAULT_TENANT_ID,
  name: "Pegasus AC Service",
  slug: "pegasus-ac",
  plan: "Growth",
  status: "active",
  country: "ID",
  industry: "HVAC / Field Service",
  ownerId: "u_leo",
  createdAt: "2023-01-15T00:00:00.000Z",
  notes: "Flagship demo tenant. Owns the seeded customer + visit data.",
  storageBytesUsed: Math.round(3.2 * GB), // Growth: 10 GB → ~32%
};

/**
 * Extra demo tenants + their users. Kept short — three of each — so the
 * admin console has cross-tenant variety without ballooning the bundle.
 * Storage numbers span the range from "healthy" (Acme) to "near quota"
 * (Northwind) to "brand new trial" (Globex) so the admin surface can
 * show every severity band at once.
 */
const acmeTenant: Tenant = {
  id: "t_acme_hvac",
  name: "Acme HVAC Co.",
  slug: "acme-hvac",
  plan: "Scale",
  status: "active",
  country: "US",
  industry: "Commercial HVAC",
  ownerId: "u_acme_owner",
  createdAt: "2024-03-08T00:00:00.000Z",
  storageBytesUsed: Math.round(18.7 * GB), // Scale: 50 GB → ~37%
};

const northwindTenant: Tenant = {
  id: "t_northwind_cool",
  name: "Northwind Cooling",
  slug: "northwind-cooling",
  plan: "Growth",
  status: "past_due",
  country: "GB",
  industry: "Refrigeration",
  ownerId: "u_north_owner",
  createdAt: "2024-06-21T00:00:00.000Z",
  notes: "Card declined 3 days ago — payment retry scheduled.",
  storageBytesUsed: Math.round(9.4 * GB), // Growth: 10 GB → ~94% (critical)
};

const globexTenant: Tenant = {
  id: "t_globex_climate",
  name: "Globex Climate Solutions",
  slug: "globex-climate",
  plan: "Starter",
  status: "trial",
  country: "SG",
  industry: "Residential AC",
  ownerId: "u_globex_owner",
  createdAt: "2026-06-12T00:00:00.000Z",
  trialEndsAt: "2026-07-26T00:00:00.000Z",
  storageBytesUsed: Math.round(210 * MB), // Starter: 1 GB → ~21%
};

export const DEFAULT_TENANTS: Tenant[] = [
  primaryTenant,
  acmeTenant,
  northwindTenant,
  globexTenant,
];

/* -------------------------------------------------------------------------- */
/* Users per tenant (excluding the primary tenant, which is already seeded)   */
/* -------------------------------------------------------------------------- */

const acmeUsers: AppUser[] = [
  {
    id: "u_acme_owner",
    tenantId: acmeTenant.id,
    name: "Marcus Reid",
    email: "marcus@acmehvac.com",
    phone: "+1 415-555-0121",
    role: "administrator",
    title: "President",
    hue: 190,
    createdAt: "2024-03-08T00:00:00.000Z",
  },
  {
    id: "u_acme_ops",
    tenantId: acmeTenant.id,
    name: "Priya Shah",
    email: "priya@acmehvac.com",
    phone: "+1 415-555-0122",
    role: "manager",
    title: "Ops Director",
    hue: 250,
    createdAt: "2024-04-19T00:00:00.000Z",
  },
  {
    id: "u_acme_eng1",
    tenantId: acmeTenant.id,
    name: "Diego Alvarez",
    email: "diego@acmehvac.com",
    phone: "+1 415-555-0123",
    role: "engineer",
    title: "Lead Technician",
    skills: ["VRF Systems", "Chiller", "Controls"],
    rating: 4.9,
    experienceYears: 11,
    hue: 130,
    createdAt: "2024-05-04T00:00:00.000Z",
  },
];

const northwindUsers: AppUser[] = [
  {
    id: "u_north_owner",
    tenantId: northwindTenant.id,
    name: "Elena Whitmore",
    email: "elena@northwindcool.co.uk",
    phone: "+44 20 7946 0801",
    role: "administrator",
    title: "Managing Director",
    hue: 20,
    createdAt: "2024-06-21T00:00:00.000Z",
  },
  {
    id: "u_north_staff",
    tenantId: northwindTenant.id,
    name: "Tom Bradley",
    email: "tom@northwindcool.co.uk",
    phone: "+44 20 7946 0802",
    role: "admin_staff",
    title: "Scheduler",
    hue: 340,
    createdAt: "2024-07-04T00:00:00.000Z",
  },
  {
    id: "u_north_eng",
    tenantId: northwindTenant.id,
    name: "Aiden Clarke",
    email: "aiden@northwindcool.co.uk",
    phone: "+44 20 7946 0803",
    role: "engineer",
    title: "Refrigeration Engineer",
    skills: ["Refrigerant Recovery", "Brazing"],
    rating: 4.5,
    experienceYears: 7,
    hue: 110,
    createdAt: "2024-08-15T00:00:00.000Z",
  },
];

const globexUsers: AppUser[] = [
  {
    id: "u_globex_owner",
    tenantId: globexTenant.id,
    name: "Nadia Rahman",
    email: "nadia@globexclimate.sg",
    phone: "+65 6100 2201",
    role: "administrator",
    title: "Founder",
    hue: 285,
    createdAt: "2026-06-12T00:00:00.000Z",
  },
  {
    id: "u_globex_eng",
    tenantId: globexTenant.id,
    name: "Josh Tan",
    email: "josh@globexclimate.sg",
    phone: "+65 6100 2202",
    role: "engineer",
    title: "Field Engineer",
    skills: ["Split AC", "Electrical"],
    rating: 4.3,
    experienceYears: 3,
    hue: 170,
    createdAt: "2026-06-20T00:00:00.000Z",
  },
];

/**
 * Every user across every tenant, plus the platform superadmin. The
 * primary-tenant users come from the pre-existing service seed so they
 * stay in lock-step with what the dashboard displays today.
 */
export const DEFAULT_PLATFORM_USERS: AppUser[] = [
  SUPERADMIN_USER,
  ...serviceUsers,
  ...acmeUsers,
  ...northwindUsers,
  ...globexUsers,
];
