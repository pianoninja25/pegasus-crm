/**
 * Seed the Postgres database with the same deterministic mock data the
 * frontend currently renders from the src/features seed modules. Running this
 * gives local dev an identical experience — same 4 tenants, same 72
 * customers, same quotations, contracts, visits, invoices — but backed by
 * real rows instead of an in-memory array.
 *
 *   npm run db:seed
 *
 * The script is destructive: it TRUNCATEs every table first so re-running
 * is idempotent. Wire it into your dev loop after every schema change.
 */

import { config as loadEnv } from "dotenv";
// Match Next.js's env loading order — .env.local wins over .env.
loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env" });

import { sql } from "drizzle-orm";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";
import {
  DEFAULT_TENANTS,
  DEFAULT_PLATFORM_USERS,
} from "../features/platform/seed";
import {
  acUnits as mockAcUnits,
  contracts as mockContracts,
  customers as mockCustomers,
  expenses as mockExpenses,
  invoices as mockInvoices,
  notifications as mockNotifications,
  quotations as mockQuotations,
  visits as mockVisits,
} from "../features/service/seed";

// Prefer the superuser URL — the seed is a schema-admin task, not a
// tenant-scoped runtime call, and BYPASSRLS keeps it simple.
const connectionString =
  process.env.MIGRATION_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "postgres://pegasus:pegasus_dev@localhost:5432/pegasus";

/** Standalone client — we don't share the app's pooled client here because
 *  seeding runs in a short-lived Node process outside `next dev`. */
const client = postgres(connectionString, { max: 1, prepare: false });
const db = drizzle(client, { schema });

/** Convert JS numbers to strings for Drizzle's `numeric()` columns. */
const n = (v: number | null | undefined): string | null =>
  v === null || v === undefined ? null : v.toString();

async function truncateAll() {
  // FK-safe: `CASCADE` handles the tangled graph in one shot.
  await db.execute(sql`
    TRUNCATE TABLE
      notifications,
      expenses,
      invoices,
      service_visit_units,
      service_visits,
      service_contract_units,
      service_contracts,
      quotation_lines,
      quotations,
      ac_units,
      customers,
      users,
      tenants
    RESTART IDENTITY CASCADE;
  `);
}

async function seedTenants() {
  const rows = DEFAULT_TENANTS.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    plan: t.plan,
    status: t.status,
    country: t.country,
    industry: t.industry,
    // Set ownerId later, after users exist, since FK-less column can still
    // point at nothing during a mid-seed snapshot.
    ownerId: null as string | null,
    trialEndsAt: t.trialEndsAt ?? null,
    notes: t.notes ?? null,
    storageBytesUsed: t.storageBytesUsed.toString(),
    createdAt: t.createdAt,
    updatedAt: t.createdAt,
  }));
  await db.insert(schema.tenants).values(rows);
  return rows.length;
}

async function seedUsers() {
  const rows = DEFAULT_PLATFORM_USERS.map((u) => ({
    id: u.id,
    tenantId: u.tenantId ?? null,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    title: u.title,
    skills: u.skills ?? null,
    rating: u.rating ?? null,
    experienceYears: u.experienceYears ?? null,
    hue: u.hue ?? null,
    disabled: u.disabled ?? false,
    createdAt: u.createdAt ?? new Date().toISOString(),
    updatedAt: u.createdAt ?? new Date().toISOString(),
  }));
  await db.insert(schema.users).values(rows);
  return rows.length;
}

/**
 * Now that users exist, wire up `tenants.owner_id`. We do this in a second
 * pass so tenant insertion doesn't depend on user insertion (avoiding a
 * chicken-and-egg problem if we ever add a real FK constraint later).
 */
async function linkTenantOwners() {
  for (const t of DEFAULT_TENANTS) {
    await db.execute(sql`
      UPDATE tenants SET owner_id = ${t.ownerId} WHERE id = ${t.id};
    `);
  }
}

const PRIMARY_TENANT_ID = "t_pegasus_ac";

async function seedCustomers() {
  const rows = mockCustomers.map((c) => ({
    id: c.id,
    tenantId: PRIMARY_TENANT_ID,
    type: c.type,
    contactPerson: c.contactPerson,
    name: c.name,
    companyName: c.companyName ?? null,
    phone: c.phone,
    email: c.email,
    address: c.address,
    city: c.city,
    country: c.country,
    lat: c.lat,
    lng: c.lng,
    tags: c.tags,
    ownerId: c.ownerId,
    notes: c.notes,
    lifetimeValue: n(c.lifetimeValue) ?? "0",
    createdAt: c.createdAt,
    lastTouchedAt: c.lastTouchedAt,
  }));
  await db.insert(schema.customers).values(rows);
  return rows.length;
}

async function seedAcUnits() {
  const rows = mockAcUnits.map((u) => ({
    id: u.id,
    tenantId: PRIMARY_TENANT_ID,
    customerId: u.customerId,
    brand: u.brand,
    model: u.model,
    type: u.type,
    btu: u.btu,
    serialNumber: u.serialNumber,
    installedAt: u.installedAt,
    location: u.location,
    condition: u.condition,
    lastServicedAt: u.lastServicedAt ?? null,
  }));
  await db.insert(schema.acUnits).values(rows);
  return rows.length;
}

async function seedQuotations() {
  const quotationRows = mockQuotations.map((q) => ({
    id: q.id,
    tenantId: PRIMARY_TENANT_ID,
    number: q.number,
    customerId: q.customerId,
    category: q.category,
    status: q.status,
    title: q.title,
    notes: q.notes ?? null,
    discountPct: n(q.discountPct) ?? "0",
    taxPct: n(q.taxPct) ?? "0",
    ownerId: q.ownerId,
    validUntil: q.validUntil,
    sentAt: q.sentAt ?? null,
    decidedAt: q.decidedAt ?? null,
    convertedToContractId: q.convertedToContractId ?? null,
    convertedToWorkOrderId: q.convertedToWorkOrderId ?? null,
    createdAt: q.createdAt,
  }));
  await db.insert(schema.quotations).values(quotationRows);

  const lineRows = mockQuotations.flatMap((q) =>
    q.lines.map((l, idx) => ({
      id: l.id,
      tenantId: PRIMARY_TENANT_ID,
      quotationId: q.id,
      position: idx,
      description: l.description,
      quantity: n(l.quantity)!,
      unitPrice: n(l.unitPrice)!,
      taxPct: n(l.taxPct),
    })),
  );
  if (lineRows.length > 0) {
    await db.insert(schema.quotationLines).values(lineRows);
  }
  return { quotations: quotationRows.length, lines: lineRows.length };
}

async function seedContracts() {
  const rows = mockContracts.map((c) => ({
    id: c.id,
    tenantId: PRIMARY_TENANT_ID,
    number: c.number,
    customerId: c.customerId,
    type: c.type,
    status: c.status,
    startDate: c.startDate,
    endDate: c.endDate,
    frequency: c.frequency,
    customIntervalDays: c.customIntervalDays ?? null,
    engineerId: c.engineerId,
    value: n(c.value)!,
    notes: c.notes,
  }));
  await db.insert(schema.serviceContracts).values(rows);

  const joinRows = mockContracts.flatMap((c) =>
    c.unitIds.map((unitId) => ({
      tenantId: PRIMARY_TENANT_ID,
      contractId: c.id,
      unitId,
    })),
  );
  if (joinRows.length > 0) {
    await db.insert(schema.serviceContractUnits).values(joinRows);
  }
  return { contracts: rows.length, joins: joinRows.length };
}

async function seedVisits() {
  const rows = mockVisits.map((v) => ({
    id: v.id,
    tenantId: PRIMARY_TENANT_ID,
    number: v.number,
    customerId: v.customerId,
    engineerId: v.engineerId,
    contractId: v.contractId ?? null,
    quotationId: v.quotationId ?? null,
    type: v.type,
    status: v.status,
    scheduledAt: v.scheduledAt,
    startedAt: v.startedAt ?? null,
    completedAt: v.completedAt ?? null,
    durationMinutes: v.durationMinutes ?? null,
    photos: v.photos,
    customerSigned: v.customerSigned,
    notes: v.notes,
    checklist: v.checklist,
    rating: v.rating ?? null,
    revenue: n(v.revenue) ?? "0",
  }));
  // Chunk to keep parameter count safe (visits have wide rows w/ JSONB).
  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    await db.insert(schema.serviceVisits).values(rows.slice(i, i + CHUNK));
  }

  const joinRows = mockVisits.flatMap((v) =>
    v.unitIds.map((unitId) => ({
      tenantId: PRIMARY_TENANT_ID,
      visitId: v.id,
      unitId,
    })),
  );
  if (joinRows.length > 0) {
    await db.insert(schema.serviceVisitUnits).values(joinRows);
  }
  return { visits: rows.length, joins: joinRows.length };
}

async function seedInvoices() {
  const rows = mockInvoices.map((i) => ({
    id: i.id,
    tenantId: PRIMARY_TENANT_ID,
    number: i.number,
    customerId: i.customerId,
    source: i.source,
    amount: n(i.amount)!,
    issuedAt: i.issuedAt,
    dueAt: i.dueAt,
    paidAt: i.paidAt ?? null,
    status: i.status,
    method: i.method ?? null,
    visitId: i.visitId ?? null,
    contractId: i.contractId ?? null,
    quotationId: i.quotationId ?? null,
    notes: i.notes ?? null,
  }));
  await db.insert(schema.invoices).values(rows);
  return rows.length;
}

async function seedExpenses() {
  const rows = mockExpenses.map((e) => ({
    id: e.id,
    tenantId: PRIMARY_TENANT_ID,
    category: e.category,
    description: e.description,
    amount: n(e.amount)!,
    spentAt: e.spentAt,
    vendor: e.vendor ?? null,
    recordedById: e.recordedById,
    notes: e.notes ?? null,
  }));
  await db.insert(schema.expenses).values(rows);
  return rows.length;
}

async function seedNotifications() {
  const rows = mockNotifications.map((n) => ({
    id: n.id,
    tenantId: PRIMARY_TENANT_ID,
    kind: n.kind,
    title: n.title,
    body: n.body,
    unread: n.unread,
    href: n.href ?? null,
    customerId: n.customerId ?? null,
    contractId: n.contractId ?? null,
    visitId: n.visitId ?? null,
    quotationId: n.quotationId ?? null,
    invoiceId: n.invoiceId ?? null,
    createdAt: n.createdAt,
  }));
  await db.insert(schema.notifications).values(rows);
  return rows.length;
}

async function main() {
  // Run the whole seed under a superadmin bypass so once we add RLS in
  // migration 0002 the INSERTs are still allowed. Sessions set the GUC
  // for the lifetime of this connection.
  await db.execute(sql`SET app.role = 'superadmin'`);

  console.log("→ Truncating tables");
  await truncateAll();

  console.log("→ Seeding tenants");
  const tenantsCount = await seedTenants();
  console.log(`  ${tenantsCount} tenants`);

  console.log("→ Seeding users");
  const usersCount = await seedUsers();
  console.log(`  ${usersCount} users`);

  console.log("→ Linking tenant owners");
  await linkTenantOwners();

  console.log("→ Seeding customers");
  const customersCount = await seedCustomers();
  console.log(`  ${customersCount} customers`);

  console.log("→ Seeding AC units");
  const unitsCount = await seedAcUnits();
  console.log(`  ${unitsCount} AC units`);

  console.log("→ Seeding quotations + lines");
  const q = await seedQuotations();
  console.log(`  ${q.quotations} quotations, ${q.lines} lines`);

  console.log("→ Seeding service contracts");
  const c = await seedContracts();
  console.log(`  ${c.contracts} contracts, ${c.joins} contract-unit links`);

  console.log("→ Seeding service visits");
  const v = await seedVisits();
  console.log(`  ${v.visits} visits, ${v.joins} visit-unit links`);

  console.log("→ Seeding invoices");
  const invoicesCount = await seedInvoices();
  console.log(`  ${invoicesCount} invoices`);

  console.log("→ Seeding expenses");
  const expensesCount = await seedExpenses();
  console.log(`  ${expensesCount} expenses`);

  console.log("→ Seeding notifications");
  const notificationsCount = await seedNotifications();
  console.log(`  ${notificationsCount} notifications`);

  console.log("\n✓ Seed complete");
}

main()
  .catch((err) => {
    console.error("\n✗ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await client.end({ timeout: 5 });
  });
