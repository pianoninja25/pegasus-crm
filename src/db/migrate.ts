/**
 * Apply pending Drizzle migrations against the configured DATABASE_URL.
 *
 * Runs from `npm run db:migrate`. Prefer this over `drizzle-kit migrate`
 * because it uses the same `postgres` driver as the app, plays nicely
 * with our .env.local convention, and exits with a real error message
 * when anything goes wrong.
 *
 * In production, run this once per deploy before starting the app.
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env" });

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

// Prefer the superuser URL so RLS doesn't block DDL / DML during migrations.
const connectionString =
  process.env.MIGRATION_DATABASE_URL ??
  process.env.DATABASE_URL ??
  "postgres://pegasus:pegasus_dev@localhost:5432/pegasus";

async function main() {
  const client = postgres(connectionString, { max: 1, prepare: false });
  const db = drizzle(client);
  console.log("→ Applying migrations from src/db/migrations");
  await migrate(db, { migrationsFolder: "src/db/migrations" });
  console.log("✓ Migrations up to date");
  await client.end({ timeout: 5 });
}

main().catch((err) => {
  console.error("\n✗ Migration failed:", err);
  process.exit(1);
});
