/**
 * Pegasus CRM database schema.
 *
 * One-to-one with the domain types in `src/features/service/types.ts` and
 * `src/features/platform/types.ts`. Table + column names are snake_case in
 * SQL; Drizzle's inferred TS types stay camelCase to match the app.
 *
 * Multi-tenancy: every tenant-scoped table carries `tenant_id text NOT NULL`
 * with a FK to `tenants(id)`. Row-Level Security policies (added in a
 * follow-up migration) will filter by `current_setting('app.tenant_id')`.
 *
 * IDs are `text` (not uuid) because the app already uses human-readable
 * prefixed ids like `cu_0001`, `q_00a4`, `t_pegasus_ac`. We keep them.
 */

import { relations, sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/* Enums                                                                      */
/* -------------------------------------------------------------------------- */

export const userRole = pgEnum("user_role", [
  "superadmin",
  "administrator",
  "manager",
  "admin_staff",
  "engineer",
]);

export const tenantPlan = pgEnum("tenant_plan", [
  "Starter",
  "Growth",
  "Scale",
  "Enterprise",
]);

export const tenantStatus = pgEnum("tenant_status", [
  "trial",
  "active",
  "past_due",
  "suspended",
]);

export const customerType = pgEnum("customer_type", [
  "residential",
  "commercial",
  "industrial",
]);

export const unitType = pgEnum("unit_type", [
  "split",
  "window",
  "central",
  "vrf",
  "cassette",
  "chiller",
]);

export const unitCondition = pgEnum("unit_condition", [
  "excellent",
  "good",
  "fair",
  "poor",
]);

export const quotationCategory = pgEnum("quotation_category", [
  "service",
  "product",
  "spare_parts",
  "service_contract",
]);

export const quotationStatus = pgEnum("quotation_status", [
  "draft",
  "sent",
  "approved",
  "rejected",
  "expired",
]);

export const contractType = pgEnum("contract_type", [
  "ac_cleaning",
  "ac_replacement",
  "spare_part_replacement",
  "preventive_maintenance",
  "custom",
]);

export const serviceFrequency = pgEnum("service_frequency", [
  "monthly",
  "quarterly",
  "biannual",
  "annual",
  "custom",
]);

export const contractStatus = pgEnum("contract_status", [
  "active",
  "expiring_soon",
  "completed",
  "awaiting_renewal",
  "draft",
]);

export const visitStatus = pgEnum("visit_status", [
  "scheduled",
  "in_progress",
  "completed",
  "overdue",
  "cancelled",
]);

export const paymentMethod = pgEnum("payment_method", [
  "cash",
  "bank_transfer",
  "credit_card",
  "ewallet",
  "check",
]);

export const invoiceStatus = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "partially_paid",
  "overdue",
  "cancelled",
]);

export const incomeSource = pgEnum("income_source", [
  "service_job",
  "product_sale",
  "spare_part_sale",
  "service_contract",
]);

export const expenseCategory = pgEnum("expense_category", [
  "fuel",
  "transport",
  "spare_parts",
  "tools",
  "salaries",
  "rent",
  "utilities",
  "marketing",
  "misc",
]);

export const notificationKind = pgEnum("notification_kind", [
  "upcoming_service",
  "expiring_contract",
  "quotation_expiring",
  "outstanding_payment",
  "engineer_assigned",
  "daily_schedule",
  "overdue_maintenance",
  "renewal_reminder",
]);

/* -------------------------------------------------------------------------- */
/* Common column helpers                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Standard timestamptz column, kept as ISO string in JS so the existing
 * TanStack Query cache doesn't need conversion.
 */
const isoTimestamp = (name: string) =>
  timestamp(name, { withTimezone: true, mode: "string" });

/**
 * Money column. Numeric(14,2) fits values up to 999,999,999,999.99 which
 * is comfortably beyond any realistic HVAC line item.
 */
const money = (name: string) => numeric(name, { precision: 14, scale: 2 });

/* -------------------------------------------------------------------------- */
/* tenants                                                                    */
/* -------------------------------------------------------------------------- */

export const tenants = pgTable(
  "tenants",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    plan: tenantPlan("plan").notNull(),
    status: tenantStatus("status").notNull(),
    country: text("country").notNull(),
    industry: text("industry").notNull(),
    // Nullable — a tenant can exist before its owner user is created (and
    // the users table hasn't been declared yet at this point, so we set the
    // FK reference lazily below via ALTER TABLE in a follow-up migration or
    // via Drizzle's `foreignKey()` in relations. Keeping it as plain text
    // avoids the circular type reference between tenants ↔ users.
    ownerId: text("owner_id"),
    trialEndsAt: isoTimestamp("trial_ends_at"),
    notes: text("notes"),
    storageBytesUsed: numeric("storage_bytes_used", {
      precision: 20,
      scale: 0,
    })
      .notNull()
      .default("0"),
    createdAt: isoTimestamp("created_at").notNull().defaultNow(),
    updatedAt: isoTimestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("tenants_slug_idx").on(t.slug),
  }),
);

/* -------------------------------------------------------------------------- */
/* users                                                                      */
/* -------------------------------------------------------------------------- */

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    // Nullable: platform `superadmin` users are not scoped to a tenant.
    tenantId: text("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    role: userRole("role").notNull(),
    title: text("title").notNull(),
    /** Engineer-only. Stored as JSONB text[] for flexibility. */
    skills: jsonb("skills").$type<string[]>(),
    rating: doublePrecision("rating"),
    experienceYears: integer("experience_years"),
    hue: integer("hue"),
    disabled: boolean("disabled").notNull().default(false),
    createdAt: isoTimestamp("created_at").notNull().defaultNow(),
    updatedAt: isoTimestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
    tenantIdx: index("users_tenant_idx").on(t.tenantId),
  }),
);

/* -------------------------------------------------------------------------- */
/* customers                                                                  */
/* -------------------------------------------------------------------------- */

export const customers = pgTable(
  "customers",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    type: customerType("type").notNull(),
    contactPerson: text("contact_person").notNull(),
    name: text("name").notNull(),
    companyName: text("company_name"),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    country: text("country").notNull(),
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    ownerId: text("owner_id").references(() => users.id, {
      onDelete: "set null",
    }),
    notes: text("notes").notNull().default(""),
    lifetimeValue: money("lifetime_value").notNull().default("0"),
    createdAt: isoTimestamp("created_at").notNull().defaultNow(),
    lastTouchedAt: isoTimestamp("last_touched_at").notNull().defaultNow(),
  },
  (t) => ({
    tenantIdx: index("customers_tenant_idx").on(t.tenantId),
    ownerIdx: index("customers_owner_idx").on(t.ownerId),
    // Trigram indexes for fast fuzzy search — created in a follow-up
    // migration once the pg_trgm extension is enabled.
  }),
);

/* -------------------------------------------------------------------------- */
/* ac_units                                                                   */
/* -------------------------------------------------------------------------- */

export const acUnits = pgTable(
  "ac_units",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    brand: text("brand").notNull(),
    model: text("model").notNull(),
    type: unitType("type").notNull(),
    btu: integer("btu").notNull(),
    serialNumber: text("serial_number").notNull(),
    installedAt: isoTimestamp("installed_at").notNull(),
    location: text("location").notNull(),
    condition: unitCondition("condition").notNull(),
    lastServicedAt: isoTimestamp("last_serviced_at"),
  },
  (t) => ({
    tenantIdx: index("ac_units_tenant_idx").on(t.tenantId),
    customerIdx: index("ac_units_customer_idx").on(t.customerId),
  }),
);

/* -------------------------------------------------------------------------- */
/* quotations + lines                                                         */
/* -------------------------------------------------------------------------- */

export const quotations = pgTable(
  "quotations",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    number: text("number").notNull(),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    category: quotationCategory("category").notNull(),
    status: quotationStatus("status").notNull(),
    title: text("title").notNull(),
    notes: text("notes"),
    discountPct: numeric("discount_pct", { precision: 6, scale: 2 })
      .notNull()
      .default("0"),
    taxPct: numeric("tax_pct", { precision: 6, scale: 2 })
      .notNull()
      .default("0"),
    ownerId: text("owner_id").references(() => users.id, {
      onDelete: "set null",
    }),
    validUntil: isoTimestamp("valid_until").notNull(),
    sentAt: isoTimestamp("sent_at"),
    decidedAt: isoTimestamp("decided_at"),
    convertedToContractId: text("converted_to_contract_id"),
    convertedToWorkOrderId: text("converted_to_work_order_id"),
    createdAt: isoTimestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    tenantIdx: index("quotations_tenant_idx").on(t.tenantId),
    numberIdx: uniqueIndex("quotations_number_idx").on(t.tenantId, t.number),
    customerIdx: index("quotations_customer_idx").on(t.customerId),
    statusIdx: index("quotations_status_idx").on(t.status),
  }),
);

export const quotationLines = pgTable(
  "quotation_lines",
  {
    id: text("id").primaryKey(),
    // Denormalized from parent quotation so RLS can filter without a join.
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    quotationId: text("quotation_id")
      .notNull()
      .references(() => quotations.id, { onDelete: "cascade" }),
    /** 0-based ordering inside the parent quotation. */
    position: integer("position").notNull(),
    description: text("description").notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 3 }).notNull(),
    unitPrice: money("unit_price").notNull(),
    taxPct: numeric("tax_pct", { precision: 6, scale: 2 }),
  },
  (t) => ({
    tenantIdx: index("quotation_lines_tenant_idx").on(t.tenantId),
    quotationIdx: index("quotation_lines_quotation_idx").on(t.quotationId),
  }),
);

/* -------------------------------------------------------------------------- */
/* service_contracts + covered units join                                     */
/* -------------------------------------------------------------------------- */

export const serviceContracts = pgTable(
  "service_contracts",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    number: text("number").notNull(),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    type: contractType("type").notNull(),
    status: contractStatus("status").notNull(),
    startDate: isoTimestamp("start_date").notNull(),
    endDate: isoTimestamp("end_date").notNull(),
    frequency: serviceFrequency("frequency").notNull(),
    customIntervalDays: integer("custom_interval_days"),
    engineerId: text("engineer_id").references(() => users.id, {
      onDelete: "set null",
    }),
    value: money("value").notNull(),
    notes: text("notes").notNull().default(""),
  },
  (t) => ({
    tenantIdx: index("service_contracts_tenant_idx").on(t.tenantId),
    numberIdx: uniqueIndex("service_contracts_number_idx").on(
      t.tenantId,
      t.number,
    ),
    customerIdx: index("service_contracts_customer_idx").on(t.customerId),
    statusIdx: index("service_contracts_status_idx").on(t.status),
  }),
);

/** Many-to-many: which AC units a contract covers. */
export const serviceContractUnits = pgTable(
  "service_contract_units",
  {
    // Denormalized so RLS can filter without joining `service_contracts`.
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    contractId: text("contract_id")
      .notNull()
      .references(() => serviceContracts.id, { onDelete: "cascade" }),
    unitId: text("unit_id")
      .notNull()
      .references(() => acUnits.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.contractId, t.unitId] }),
    tenantIdx: index("service_contract_units_tenant_idx").on(t.tenantId),
  }),
);

/* -------------------------------------------------------------------------- */
/* service_visits + serviced units join                                       */
/* -------------------------------------------------------------------------- */

/** Shape of a checklist item stored as JSONB in `service_visits.checklist`. */
export interface ChecklistItemRow {
  id: string;
  label: string;
  checked: boolean;
  note?: string;
}

export const serviceVisits = pgTable(
  "service_visits",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    number: text("number").notNull(),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    engineerId: text("engineer_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    contractId: text("contract_id").references(() => serviceContracts.id, {
      onDelete: "set null",
    }),
    quotationId: text("quotation_id").references(() => quotations.id, {
      onDelete: "set null",
    }),
    type: contractType("type").notNull(),
    status: visitStatus("status").notNull(),
    scheduledAt: isoTimestamp("scheduled_at").notNull(),
    startedAt: isoTimestamp("started_at"),
    completedAt: isoTimestamp("completed_at"),
    durationMinutes: integer("duration_minutes"),
    photos: jsonb("photos").$type<string[]>().notNull().default([]),
    customerSigned: boolean("customer_signed").notNull().default(false),
    notes: text("notes").notNull().default(""),
    checklist: jsonb("checklist")
      .$type<ChecklistItemRow[]>()
      .notNull()
      .default([]),
    rating: doublePrecision("rating"),
    revenue: money("revenue").notNull().default("0"),
  },
  (t) => ({
    tenantIdx: index("service_visits_tenant_idx").on(t.tenantId),
    numberIdx: uniqueIndex("service_visits_number_idx").on(
      t.tenantId,
      t.number,
    ),
    customerIdx: index("service_visits_customer_idx").on(t.customerId),
    engineerIdx: index("service_visits_engineer_idx").on(t.engineerId),
    statusIdx: index("service_visits_status_idx").on(t.status),
    scheduledIdx: index("service_visits_scheduled_idx").on(t.scheduledAt),
  }),
);

export const serviceVisitUnits = pgTable(
  "service_visit_units",
  {
    // Denormalized so RLS can filter without joining `service_visits`.
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    visitId: text("visit_id")
      .notNull()
      .references(() => serviceVisits.id, { onDelete: "cascade" }),
    unitId: text("unit_id")
      .notNull()
      .references(() => acUnits.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.visitId, t.unitId] }),
    tenantIdx: index("service_visit_units_tenant_idx").on(t.tenantId),
  }),
);

/* -------------------------------------------------------------------------- */
/* invoices                                                                   */
/* -------------------------------------------------------------------------- */

export const invoices = pgTable(
  "invoices",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    number: text("number").notNull(),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "restrict" }),
    source: incomeSource("source").notNull(),
    amount: money("amount").notNull(),
    issuedAt: isoTimestamp("issued_at").notNull(),
    dueAt: isoTimestamp("due_at").notNull(),
    paidAt: isoTimestamp("paid_at"),
    status: invoiceStatus("status").notNull(),
    method: paymentMethod("method"),
    visitId: text("visit_id").references(() => serviceVisits.id, {
      onDelete: "set null",
    }),
    contractId: text("contract_id").references(() => serviceContracts.id, {
      onDelete: "set null",
    }),
    quotationId: text("quotation_id").references(() => quotations.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
  },
  (t) => ({
    tenantIdx: index("invoices_tenant_idx").on(t.tenantId),
    numberIdx: uniqueIndex("invoices_number_idx").on(t.tenantId, t.number),
    customerIdx: index("invoices_customer_idx").on(t.customerId),
    statusIdx: index("invoices_status_idx").on(t.status),
    dueIdx: index("invoices_due_idx").on(t.dueAt),
  }),
);

/* -------------------------------------------------------------------------- */
/* expenses                                                                   */
/* -------------------------------------------------------------------------- */

export const expenses = pgTable(
  "expenses",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    category: expenseCategory("category").notNull(),
    description: text("description").notNull(),
    amount: money("amount").notNull(),
    spentAt: isoTimestamp("spent_at").notNull(),
    vendor: text("vendor"),
    recordedById: text("recorded_by_id").references(() => users.id, {
      onDelete: "set null",
    }),
    notes: text("notes"),
  },
  (t) => ({
    tenantIdx: index("expenses_tenant_idx").on(t.tenantId),
    categoryIdx: index("expenses_category_idx").on(t.category),
    spentIdx: index("expenses_spent_idx").on(t.spentAt),
  }),
);

/* -------------------------------------------------------------------------- */
/* notifications                                                              */
/* -------------------------------------------------------------------------- */

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    kind: notificationKind("kind").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    unread: boolean("unread").notNull().default(true),
    href: text("href"),
    customerId: text("customer_id").references(() => customers.id, {
      onDelete: "cascade",
    }),
    contractId: text("contract_id").references(() => serviceContracts.id, {
      onDelete: "cascade",
    }),
    visitId: text("visit_id").references(() => serviceVisits.id, {
      onDelete: "cascade",
    }),
    quotationId: text("quotation_id").references(() => quotations.id, {
      onDelete: "cascade",
    }),
    invoiceId: text("invoice_id").references(() => invoices.id, {
      onDelete: "cascade",
    }),
    createdAt: isoTimestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    tenantIdx: index("notifications_tenant_idx").on(t.tenantId),
    unreadIdx: index("notifications_unread_idx").on(t.unread),
    createdIdx: index("notifications_created_idx").on(sql`${t.createdAt} DESC`),
  }),
);

/* -------------------------------------------------------------------------- */
/* Relations (typed accessors for Drizzle Query API)                          */
/* -------------------------------------------------------------------------- */

export const tenantsRelations = relations(tenants, ({ many, one }) => ({
  users: many(users),
  customers: many(customers),
  owner: one(users, {
    fields: [tenants.ownerId],
    references: [users.id],
    relationName: "tenant_owner",
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
  ownedCustomers: many(customers, { relationName: "customer_owner" }),
  assignedContracts: many(serviceContracts),
  assignedVisits: many(serviceVisits),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [customers.tenantId],
    references: [tenants.id],
  }),
  owner: one(users, {
    fields: [customers.ownerId],
    references: [users.id],
    relationName: "customer_owner",
  }),
  units: many(acUnits),
  quotations: many(quotations),
  contracts: many(serviceContracts),
  visits: many(serviceVisits),
  invoices: many(invoices),
}));

export const acUnitsRelations = relations(acUnits, ({ one, many }) => ({
  customer: one(customers, {
    fields: [acUnits.customerId],
    references: [customers.id],
  }),
  contractUnits: many(serviceContractUnits),
  visitUnits: many(serviceVisitUnits),
}));

export const quotationsRelations = relations(quotations, ({ one, many }) => ({
  customer: one(customers, {
    fields: [quotations.customerId],
    references: [customers.id],
  }),
  owner: one(users, {
    fields: [quotations.ownerId],
    references: [users.id],
  }),
  lines: many(quotationLines),
}));

export const quotationLinesRelations = relations(
  quotationLines,
  ({ one }) => ({
    quotation: one(quotations, {
      fields: [quotationLines.quotationId],
      references: [quotations.id],
    }),
  }),
);

export const serviceContractsRelations = relations(
  serviceContracts,
  ({ one, many }) => ({
    customer: one(customers, {
      fields: [serviceContracts.customerId],
      references: [customers.id],
    }),
    engineer: one(users, {
      fields: [serviceContracts.engineerId],
      references: [users.id],
    }),
    contractUnits: many(serviceContractUnits),
    visits: many(serviceVisits),
  }),
);

export const serviceContractUnitsRelations = relations(
  serviceContractUnits,
  ({ one }) => ({
    contract: one(serviceContracts, {
      fields: [serviceContractUnits.contractId],
      references: [serviceContracts.id],
    }),
    unit: one(acUnits, {
      fields: [serviceContractUnits.unitId],
      references: [acUnits.id],
    }),
  }),
);

export const serviceVisitsRelations = relations(
  serviceVisits,
  ({ one, many }) => ({
    customer: one(customers, {
      fields: [serviceVisits.customerId],
      references: [customers.id],
    }),
    engineer: one(users, {
      fields: [serviceVisits.engineerId],
      references: [users.id],
    }),
    contract: one(serviceContracts, {
      fields: [serviceVisits.contractId],
      references: [serviceContracts.id],
    }),
    quotation: one(quotations, {
      fields: [serviceVisits.quotationId],
      references: [quotations.id],
    }),
    visitUnits: many(serviceVisitUnits),
  }),
);

export const serviceVisitUnitsRelations = relations(
  serviceVisitUnits,
  ({ one }) => ({
    visit: one(serviceVisits, {
      fields: [serviceVisitUnits.visitId],
      references: [serviceVisits.id],
    }),
    unit: one(acUnits, {
      fields: [serviceVisitUnits.unitId],
      references: [acUnits.id],
    }),
  }),
);

export const invoicesRelations = relations(invoices, ({ one }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  visit: one(serviceVisits, {
    fields: [invoices.visitId],
    references: [serviceVisits.id],
  }),
  contract: one(serviceContracts, {
    fields: [invoices.contractId],
    references: [serviceContracts.id],
  }),
  quotation: one(quotations, {
    fields: [invoices.quotationId],
    references: [quotations.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  recordedBy: one(users, {
    fields: [expenses.recordedById],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  tenant: one(tenants, {
    fields: [notifications.tenantId],
    references: [tenants.id],
  }),
}));

/* -------------------------------------------------------------------------- */
/* Inferred TS types (import these from `@/db/schema` when you need row shapes) */
/* -------------------------------------------------------------------------- */

export type TenantRow = typeof tenants.$inferSelect;
export type NewTenantRow = typeof tenants.$inferInsert;
export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type CustomerRow = typeof customers.$inferSelect;
export type NewCustomerRow = typeof customers.$inferInsert;
export type AcUnitRow = typeof acUnits.$inferSelect;
export type NewAcUnitRow = typeof acUnits.$inferInsert;
export type QuotationRow = typeof quotations.$inferSelect;
export type NewQuotationRow = typeof quotations.$inferInsert;
export type QuotationLineRow = typeof quotationLines.$inferSelect;
export type NewQuotationLineRow = typeof quotationLines.$inferInsert;
export type ServiceContractRow = typeof serviceContracts.$inferSelect;
export type NewServiceContractRow = typeof serviceContracts.$inferInsert;
export type ServiceVisitRow = typeof serviceVisits.$inferSelect;
export type NewServiceVisitRow = typeof serviceVisits.$inferInsert;
export type InvoiceRow = typeof invoices.$inferSelect;
export type NewInvoiceRow = typeof invoices.$inferInsert;
export type ExpenseRow = typeof expenses.$inferSelect;
export type NewExpenseRow = typeof expenses.$inferInsert;
export type NotificationRow = typeof notifications.$inferSelect;
export type NewNotificationRow = typeof notifications.$inferInsert;
