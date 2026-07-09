import { config as loadEnv } from "dotenv";
// Match Next.js's env loading order — .env.local wins over .env.
loadEnv({ path: ".env.local", override: true });
loadEnv({ path: ".env" });

import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit config — governs `drizzle-kit generate` (schema → SQL migration)
 * and `drizzle-kit migrate` / `drizzle-kit push` (apply / sync against a DB).
 *
 * Reads DATABASE_URL from `.env.local` (dev) or `.env.prod` (VM); see
 * `.env.example` for the shape.
 */
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // drizzle-kit does introspection / diffing / push against the DB, so
    // it also wants the superuser URL to avoid RLS + permission surprises.
    url:
      process.env.MIGRATION_DATABASE_URL ??
      process.env.DATABASE_URL ??
      "postgres://pegasus:pegasus_dev@localhost:5432/pegasus",
  },
  strict: true,
  verbose: true,
  // Every migration ships a `-- breakpoint` marker so a single file can hold
  // multiple statements that must run separately.
  breakpoints: true,
});
