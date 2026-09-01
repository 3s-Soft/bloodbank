import { and, count, desc, eq, ne, sql } from "drizzle-orm";

import { db, type DbExecutor } from "@/lib/db";
import { bloodRequests, donorProfiles, organizations } from "@/lib/db/schema";
import type { OrganizationRow, OrganizationStatsDto, PlatformStatsDto } from "@/lib/types";

/**
 * Organization queries.
 *
 * Every tenant-scoped request starts here: a slug resolves to a row, and the
 * row's id is what every other repository filters on. No caller may pass an
 * organization id in from the client.
 */

export async function findBySlug(
    slug: string,
    options: { includeInactive?: boolean } = {},
): Promise<OrganizationRow | null> {
    const conditions = [eq(organizations.slug, slug)];
    if (!options.includeInactive) {
        conditions.push(eq(organizations.isActive, true));
    }

    const [row] = await db
        .select()
        .from(organizations)
        .where(and(...conditions))
        .limit(1);

    return row ?? null;
}

export async function findById(id: number): Promise<OrganizationRow | null> {
    const [row] = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
    return row ?? null;
}

export async function listAll(): Promise<OrganizationRow[]> {
    return db.select().from(organizations).orderBy(desc(organizations.createdAt));
}

export async function listActive(): Promise<OrganizationRow[]> {
    return db
        .select()
        .from(organizations)
        .where(eq(organizations.isActive, true))
        .orderBy(desc(organizations.createdAt));
}

export async function slugExists(slug: string, excludeId?: number): Promise<boolean> {
    const conditions = [eq(organizations.slug, slug)];
    if (excludeId !== undefined) {
        conditions.push(ne(organizations.id, excludeId));
    }

    const [row] = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(and(...conditions))
        .limit(1);

    return Boolean(row);
}

export async function create(
    values: typeof organizations.$inferInsert,
    executor: DbExecutor = db,
): Promise<number> {
    const [result] = await executor.insert(organizations).values(values);
    return Number(result.insertId);
}

export async function update(
    id: number,
    values: Partial<typeof organizations.$inferInsert>,
    executor: DbExecutor = db,
): Promise<void> {
    await executor.update(organizations).set(values).where(eq(organizations.id, id));
}

export async function remove(id: number, executor: DbExecutor = db): Promise<void> {
    await executor.delete(organizations).where(eq(organizations.id, id));
}

/**
 * Organization dashboard counters.
 *
 * The Firestore version issued one `.count()` call per metric plus a full scan
 * of donor documents to count distinct villages. This is two round trips, which
 * matters because each one crosses the public internet to Hostinger.
 */
export async function getStats(organizationId: number): Promise<OrganizationStatsDto> {
    const [donorTotals] = await db
        .select({
            donorsCount: count(),
            villagesCovered: sql<number>`COUNT(DISTINCT ${donorProfiles.village})`,
        })
        .from(donorProfiles)
        .where(eq(donorProfiles.organizationId, organizationId));

    const requestRows = await db
        .select({ status: bloodRequests.status, total: count() })
        .from(bloodRequests)
        .where(eq(bloodRequests.organizationId, organizationId))
        .groupBy(bloodRequests.status);

    const byStatus = Object.fromEntries(requestRows.map((row) => [row.status, Number(row.total)]));
    const activeRequests = byStatus.pending ?? 0;
    const completedRequests = byStatus.fulfilled ?? 0;
    const donorsCount = Number(donorTotals?.donorsCount ?? 0);

    return {
        donorsCount,
        activeRequests,
        completedRequests,
        // Heuristic carried over from the previous implementation: a fulfilled
        // request helps roughly three people, plus a standing contribution from
        // the registered donor pool.
        livesHelped: completedRequests * 3 + Math.floor(donorsCount / 2),
        villagesCovered: Number(donorTotals?.villagesCovered ?? 0),
    };
}

/** Platform-wide counters for the super-admin dashboard. */
export async function getPlatformStats(): Promise<PlatformStatsDto> {
    const [[orgTotals], [donorTotals], requestRows] = await Promise.all([
        db.select({ total: count() }).from(organizations),
        db.select({ total: count() }).from(donorProfiles),
        db
            .select({ status: bloodRequests.status, total: count() })
            .from(bloodRequests)
            .groupBy(bloodRequests.status),
    ]);

    const byStatus = Object.fromEntries(requestRows.map((row) => [row.status, Number(row.total)]));

    return {
        organizationsCount: Number(orgTotals?.total ?? 0),
        donorsCount: Number(donorTotals?.total ?? 0),
        requestsCount: requestRows.reduce((sum, row) => sum + Number(row.total), 0),
        fulfilledRequests: byStatus.fulfilled ?? 0,
    };
}
