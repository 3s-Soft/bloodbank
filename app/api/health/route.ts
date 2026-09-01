import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — liveness and database reachability.
 *
 * Deliberately minimal in what it reveals: a failure reports that the database
 * is unreachable without echoing the driver error, which would expose the host
 * and credentials shape to anyone who can reach the endpoint. The detail goes
 * to the server log instead.
 *
 * Useful for uptime monitoring and for confirming after a deploy that the
 * Hostinger connection works from Vercel's network.
 */
export async function GET() {
    const startedAt = Date.now();

    try {
        await db.execute(sql`SELECT 1`);

        return NextResponse.json(
            {
                status: "ok",
                database: "connected",
                // Round-trip time to Hostinger; a sharp rise here is the first
                // sign of connection-pool pressure.
                latencyMs: Date.now() - startedAt,
            },
            { headers: { "Cache-Control": "no-store" } },
        );
    } catch (error) {
        console.error("Health check failed:", error);

        return NextResponse.json(
            { status: "error", database: "unreachable" },
            { status: 503, headers: { "Cache-Control": "no-store" } },
        );
    }
}
