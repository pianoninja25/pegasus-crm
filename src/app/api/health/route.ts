/**
 * Liveness + readiness probe.
 *
 * Docker's healthcheck (see docker-compose.prod.yml) hits this every 30s.
 * Caddy uses container health to decide whether to route traffic.
 *
 * We do a cheap DB round-trip (`SELECT 1`) so a broken/unreachable Postgres
 * takes the container out of rotation rather than serving 500s.
 */

import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface HealthReport {
  status: "ok" | "degraded";
  uptimeSec: number;
  db: "ok" | "unreachable";
  timestamp: string;
}

export async function GET() {
  const report: HealthReport = {
    status: "ok",
    uptimeSec: Math.round(process.uptime()),
    db: "ok",
    timestamp: new Date().toISOString(),
  };

  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    report.db = "unreachable";
    report.status = "degraded";
    return NextResponse.json(report, { status: 503 });
  }

  return NextResponse.json(report);
}
