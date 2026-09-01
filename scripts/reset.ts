/**
 * Empties every application table, leaving the schema in place.
 *
 *   npm run db:reset -- --yes
 *
 * Use this to clear demo data before going live. It deletes all rows and resets
 * AUTO_INCREMENT so new records start at 1.
 *
 * What it does NOT touch:
 *   - the table definitions themselves (no DROP)
 *   - `__drizzle_migrations`, which records the applied migrations. Clearing it
 *     would make drizzle-kit believe the schema was never migrated and try to
 *     re-create existing tables on the next `db:migrate`.
 *
 * This is irreversible and there is no backup step, so it requires an explicit
 * --yes and refuses to run without it.
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local"), quiet: true });

import { count } from "drizzle-orm";

import { closeDb, db } from "../lib/db";
import {
    auditLogs,
    bloodRequestMatches,
    bloodRequests,
    donations,
    donorProfiles,
    events,
    feedback,
    organizations,
    pushSubscriptions,
    users,
} from "../lib/db/schema";
import { sql } from "drizzle-orm";

/** Children before parents, so nothing depends on cascade ordering. */
const TABLES = [
    { name: "blood_request_matches", table: bloodRequestMatches },
    { name: "audit_logs", table: auditLogs },
    { name: "donations", table: donations },
    { name: "push_subscriptions", table: pushSubscriptions },
    { name: "feedback", table: feedback },
    { name: "events", table: events },
    { name: "blood_requests", table: bloodRequests },
    { name: "donor_profiles", table: donorProfiles },
    { name: "users", table: users },
    { name: "organizations", table: organizations },
] as const;

async function main() {
    const confirmed = process.argv.includes("--yes");

    console.log(
        `Target: ${process.env.MYSQL_DATABASE} on ${process.env.MYSQL_HOST}\n`,
    );

    // Report what is about to be destroyed before destroying it.
    let total = 0;
    for (const { name, table } of TABLES) {
        const [row] = await db.select({ total: count() }).from(table);
        const rows = Number(row?.total ?? 0);
        total += rows;
        console.log(`  ${name.padEnd(24)} ${rows}`);
    }
    console.log(`  ${"TOTAL".padEnd(24)} ${total}\n`);

    if (!confirmed) {
        console.error(
            "Refusing to delete without confirmation.\n" +
                "Re-run with:  npm run db:reset -- --yes",
        );
        await closeDb();
        process.exit(1);
    }

    if (total === 0) {
        console.log("Already empty. Nothing to do.");
        await closeDb();
        process.exit(0);
    }

    console.log("Deleting...");
    for (const { name, table } of TABLES) {
        await db.delete(table);
        // Restart ids from 1 so a fresh database does not inherit the demo
        // data's id sequence.
        await db.execute(sql.raw(`ALTER TABLE \`${name}\` AUTO_INCREMENT = 1`));
        console.log(`  cleared ${name}`);
    }

    let remaining = 0;
    for (const { table } of TABLES) {
        const [row] = await db.select({ total: count() }).from(table);
        remaining += Number(row?.total ?? 0);
    }

    console.log(`\nDone. Rows remaining: ${remaining}`);
    console.log("Schema and migration history are unchanged.");

    await closeDb();
    process.exit(remaining === 0 ? 0 : 1);
}

main().catch(async (error) => {
    console.error("Reset failed:", error);
    await closeDb();
    process.exit(1);
});
