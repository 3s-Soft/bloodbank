import { and, count, desc, eq, gte, inArray, type SQL } from "drizzle-orm";

import { db, type DbExecutor } from "@/lib/db";
import { bloodRequestMatches, bloodRequests, users } from "@/lib/db/schema";
import type { BloodGroup, BloodRequestRow, UserRow } from "@/lib/types";

/**
 * Blood request queries.
 *
 * The requester is joined with a LEFT JOIN because anonymous visitors can post
 * a request, leaving `requester_id` null.
 */

export interface RequestWithRequester {
    request: BloodRequestRow;
    requester: Pick<UserRow, "id" | "name" | "phone" | "email"> | null;
}

const requesterColumns = {
    id: users.id,
    name: users.name,
    phone: users.phone,
    email: users.email,
};

export interface ListRequestFilters {
    status?: BloodRequestRow["status"];
    urgency?: BloodRequestRow["urgency"];
    bloodGroup?: BloodGroup;
    /** Caps rows at the database rather than slicing after transfer. */
    limit?: number;
}

export async function listByOrganization(
    organizationId: number,
    filters: ListRequestFilters = {},
): Promise<RequestWithRequester[]> {
    const conditions: SQL[] = [eq(bloodRequests.organizationId, organizationId)];

    if (filters.status) conditions.push(eq(bloodRequests.status, filters.status));
    if (filters.urgency) conditions.push(eq(bloodRequests.urgency, filters.urgency));
    if (filters.bloodGroup) conditions.push(eq(bloodRequests.bloodGroup, filters.bloodGroup));

    const query = db
        .select({ request: bloodRequests, requester: requesterColumns })
        .from(bloodRequests)
        .leftJoin(users, eq(bloodRequests.requesterId, users.id))
        .where(and(...conditions))
        .orderBy(desc(bloodRequests.createdAt));

    const rows = await (filters.limit ? query.limit(filters.limit) : query);

    return rows.map((row) => ({ request: row.request, requester: row.requester }));
}

export async function findById(id: number): Promise<BloodRequestRow | null> {
    const [row] = await db.select().from(bloodRequests).where(eq(bloodRequests.id, id)).limit(1);
    return row ?? null;
}

export async function create(
    values: typeof bloodRequests.$inferInsert,
    executor: DbExecutor = db,
): Promise<number> {
    const [result] = await executor.insert(bloodRequests).values(values);
    return Number(result.insertId);
}

export async function update(
    id: number,
    values: Partial<typeof bloodRequests.$inferInsert>,
    executor: DbExecutor = db,
): Promise<void> {
    await executor.update(bloodRequests).set(values).where(eq(bloodRequests.id, id));
}

/** Counts by status in one grouped query, for dashboard tiles. */
export async function countByStatus(organizationId: number): Promise<Record<string, number>> {
    const rows = await db
        .select({ status: bloodRequests.status, total: count() })
        .from(bloodRequests)
        .where(eq(bloodRequests.organizationId, organizationId))
        .groupBy(bloodRequests.status);

    return Object.fromEntries(rows.map((row) => [row.status, Number(row.total)]));
}

export async function countByUrgency(organizationId: number): Promise<Record<string, number>> {
    const rows = await db
        .select({ urgency: bloodRequests.urgency, total: count() })
        .from(bloodRequests)
        .where(eq(bloodRequests.organizationId, organizationId))
        .groupBy(bloodRequests.urgency);

    return Object.fromEntries(rows.map((row) => [row.urgency, Number(row.total)]));
}

export async function countByBloodGroup(
    organizationId: number,
): Promise<Record<string, number>> {
    const rows = await db
        .select({ bloodGroup: bloodRequests.bloodGroup, total: count() })
        .from(bloodRequests)
        .where(eq(bloodRequests.organizationId, organizationId))
        .groupBy(bloodRequests.bloodGroup);

    return Object.fromEntries(rows.map((row) => [row.bloodGroup, Number(row.total)]));
}

export async function countCreatedSince(organizationId: number, since: Date): Promise<number> {
    const [row] = await db
        .select({ total: count() })
        .from(bloodRequests)
        .where(
            and(
                eq(bloodRequests.organizationId, organizationId),
                gte(bloodRequests.createdAt, since),
            ),
        );

    return Number(row?.total ?? 0);
}

/* ------------------------------------------------------------------ matches */

/** Replaces the old `matchedDonors` array field. */
export async function replaceMatches(
    requestId: number,
    donorProfileIds: number[],
    executor: DbExecutor = db,
): Promise<void> {
    await executor
        .delete(bloodRequestMatches)
        .where(eq(bloodRequestMatches.requestId, requestId));

    if (donorProfileIds.length === 0) return;

    await executor
        .insert(bloodRequestMatches)
        .values(donorProfileIds.map((donorProfileId) => ({ requestId, donorProfileId })));
}

export async function listMatchedDonorIds(requestId: number): Promise<number[]> {
    const rows = await db
        .select({ donorProfileId: bloodRequestMatches.donorProfileId })
        .from(bloodRequestMatches)
        .where(eq(bloodRequestMatches.requestId, requestId));

    return rows.map((row) => row.donorProfileId);
}

/** Matched donor ids for several requests at once, keyed by request id. */
export async function listMatchedDonorIdsFor(
    requestIds: number[],
): Promise<Map<number, number[]>> {
    const grouped = new Map<number, number[]>();
    if (requestIds.length === 0) return grouped;

    const rows = await db
        .select({
            requestId: bloodRequestMatches.requestId,
            donorProfileId: bloodRequestMatches.donorProfileId,
        })
        .from(bloodRequestMatches)
        .where(inArray(bloodRequestMatches.requestId, requestIds));

    for (const row of rows) {
        const existing = grouped.get(row.requestId);
        if (existing) existing.push(row.donorProfileId);
        else grouped.set(row.requestId, [row.donorProfileId]);
    }

    return grouped;
}
