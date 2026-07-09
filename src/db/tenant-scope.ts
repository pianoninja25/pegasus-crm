/**
 * Per-request tenant scoping for the DB.
 *
 * Every server route handler that touches tenant data must run inside one
 * of these wrappers. They set the Postgres GUCs (`app.tenant_id` and/or
 * `app.role`) that RLS policies read (see migration 0002_rls_policies.sql).
 *
 *   await withTenantContext(session.tenantId, async (tx) => {
 *     const rows = await tx.select().from(customers);
 *     // ^ only rows for session.tenantId are returned; RLS enforces it.
 *   });
 *
 *   await withSuperadminContext(async (tx) => {
 *     // full access across all tenants — use only from `/admin` routes.
 *   });
 *
 * The wrapper opens a transaction so `SET LOCAL` scopes strictly to this
 * unit of work — even if the pool hands the connection to another request
 * next, the GUC is discarded on COMMIT/ROLLBACK.
 *
 * Never call plain `db.select()` from a route handler — it will trip RLS
 * (no tenant set → no rows visible) or, worse, run without isolation if
 * you accidentally connect as a BYPASSRLS role.
 */

import "server-only";

import { sql } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import type { ExtractTablesWithRelations } from "drizzle-orm";

import { db, schema } from "./index";

type Schema = typeof schema;
export type ScopedTx = PgTransaction<
  PostgresJsQueryResultHKT,
  Schema,
  ExtractTablesWithRelations<Schema>
>;

/**
 * Run `fn` with `app.tenant_id` set to `tenantId` for the lifetime of the
 * transaction. RLS policies filter every SELECT/INSERT/UPDATE/DELETE.
 *
 * Throws if `tenantId` is falsy — callers must resolve the session's tenant
 * before calling.
 */
export async function withTenantContext<T>(
  tenantId: string,
  fn: (tx: ScopedTx) => Promise<T>,
): Promise<T> {
  if (!tenantId) {
    throw new Error(
      "withTenantContext: tenantId is required. Resolve the session first.",
    );
  }
  return db.transaction(async (tx) => {
    // `set_config(name, value, is_local=true)` = `SET LOCAL name = value`
    // via a real query (avoids string interpolation into `SET`).
    await tx.execute(sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`);
    await tx.execute(sql`SELECT set_config('app.role', 'user', true)`);
    return fn(tx as unknown as ScopedTx);
  });
}

/**
 * Run `fn` with the superadmin bypass GUC set. All tenant-scoped RLS
 * policies allow the operation. Only use from platform routes (`/admin`)
 * after verifying the session is a `superadmin`.
 */
export async function withSuperadminContext<T>(
  fn: (tx: ScopedTx) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.role', 'superadmin', true)`);
    return fn(tx as unknown as ScopedTx);
  });
}
