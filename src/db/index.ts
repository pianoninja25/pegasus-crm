/**
 * Server-only Postgres client.
 *
 * Uses the `postgres` (postgres.js) driver — small, fast, no ORM baggage.
 * A single client is cached on `globalThis` in dev so Next.js hot reload
 * doesn't leak connections.
 *
 * Never import this from client components — the file is server-only.
 */

import "server-only";

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://pegasus:pegasus_dev@localhost:5432/pegasus";

type Sql = ReturnType<typeof postgres>;

declare global {
  // eslint-disable-next-line no-var
  var __pegasusPg__: Sql | undefined;
}

const client: Sql =
  globalThis.__pegasusPg__ ??
  postgres(connectionString, {
    // Keep a small pool per Node process. On serverless we'd want max: 1,
    // but here we're always long-lived so 10 is a sensible default.
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__pegasusPg__ = client;
}

export const db = drizzle(client, { schema, logger: false });
export type Db = typeof db;
export { schema };
