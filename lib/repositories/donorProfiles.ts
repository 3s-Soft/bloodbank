import { and, desc, eq, inArray, like, type SQL } from "drizzle-orm";

import { db, type DbExecutor } from "@/lib/db";
import { donorProfiles, users } from "@/lib/db/schema";
import type { BloodGroup, DonorProfileRow, UserRow } from "@/lib/types";

/**
 * Donor profile queries.
 *
 * Every read joins `users`, because a donor is only useful with a name and a
 * phone number. Firestore could not join, so routes fetched profiles, collected
 * user ids, issued one document read per id, built a `userMap` and merged by
 * hand. That whole dance is a single `innerJoin` here.
 *
 * Note: Drizzle's relational API (`db.query`) is unusable on this database —
 * MariaDB has no LATERAL join. See the comment in `lib/db/schema.ts`.
 */

export interface DonorWithUser {
    profile: DonorProfileRow;
    user: Pick<UserRow, "id" | "name" | "phone" | "email">;
}

const userColumns = {
    id: users.id,
    name: users.name,
    phone: users.phone,
    email: users.email,
};

function mapRow(row: { profile: DonorProfileRow; user: DonorWithUser["user"] }): DonorWithUser {
    return { profile: row.profile, user: row.user };
}

export interface ListDonorFilters {
    bloodGroup?: BloodGroup;
    district?: string;
    upazila?: string;
    availableOnly?: boolean;
    donorId?: number;
    /** Caps rows at the database rather than slicing after transfer. */
    limit?: number;
}

export async function listByOrganization(
    organizationId: number,
    filters: ListDonorFilters = {},
): Promise<DonorWithUser[]> {
    const conditions: SQL[] = [eq(donorProfiles.organizationId, organizationId)];

    if (filters.bloodGroup) {
        conditions.push(eq(donorProfiles.bloodGroup, filters.bloodGroup));
    }
    if (filters.availableOnly) {
        conditions.push(eq(donorProfiles.isAvailable, true));
    }
    if (filters.donorId) {
        conditions.push(eq(donorProfiles.id, filters.donorId));
    }
    // Substring matching preserves the previous behaviour, where a partial
    // district name still matched. It ran in memory before; now it is SQL.
    if (filters.district) {
        conditions.push(like(donorProfiles.district, `%${filters.district}%`));
    }
    if (filters.upazila) {
        conditions.push(like(donorProfiles.upazila, `%${filters.upazila}%`));
    }

    const query = db
        .select({ profile: donorProfiles, user: userColumns })
        .from(donorProfiles)
        .innerJoin(users, eq(donorProfiles.userId, users.id))
        .where(and(...conditions))
        .orderBy(desc(donorProfiles.createdAt));

    const rows = await (filters.limit ? query.limit(filters.limit) : query);

    return rows.map(mapRow);
}

/** Compatible-donor lookup behind `/api/requests/match`. */
export async function findAvailableByBloodGroups(
    organizationId: number,
    bloodGroups: BloodGroup[],
): Promise<DonorWithUser[]> {
    if (bloodGroups.length === 0) return [];

    const rows = await db
        .select({ profile: donorProfiles, user: userColumns })
        .from(donorProfiles)
        .innerJoin(users, eq(donorProfiles.userId, users.id))
        .where(
            and(
                eq(donorProfiles.organizationId, organizationId),
                inArray(donorProfiles.bloodGroup, bloodGroups),
                eq(donorProfiles.isAvailable, true),
            ),
        )
        .orderBy(desc(donorProfiles.totalDonations));

    return rows.map(mapRow);
}

export async function findById(id: number): Promise<DonorWithUser | null> {
    const [row] = await db
        .select({ profile: donorProfiles, user: userColumns })
        .from(donorProfiles)
        .innerJoin(users, eq(donorProfiles.userId, users.id))
        .where(eq(donorProfiles.id, id))
        .limit(1);

    return row ? mapRow(row) : null;
}

export async function findByIds(ids: number[]): Promise<DonorWithUser[]> {
    if (ids.length === 0) return [];

    const rows = await db
        .select({ profile: donorProfiles, user: userColumns })
        .from(donorProfiles)
        .innerJoin(users, eq(donorProfiles.userId, users.id))
        .where(inArray(donorProfiles.id, ids));

    return rows.map(mapRow);
}

export async function findByUserAndOrganization(
    userId: number,
    organizationId: number,
    executor: DbExecutor = db,
): Promise<DonorProfileRow | null> {
    const [row] = await executor
        .select()
        .from(donorProfiles)
        .where(
            and(
                eq(donorProfiles.userId, userId),
                eq(donorProfiles.organizationId, organizationId),
            ),
        )
        .limit(1);

    return row ?? null;
}

/** Leaderboard: highest points first. */
export async function listTopByPoints(
    organizationId: number,
    limit = 20,
): Promise<DonorWithUser[]> {
    const rows = await db
        .select({ profile: donorProfiles, user: userColumns })
        .from(donorProfiles)
        .innerJoin(users, eq(donorProfiles.userId, users.id))
        .where(eq(donorProfiles.organizationId, organizationId))
        .orderBy(desc(donorProfiles.points), desc(donorProfiles.totalDonations))
        .limit(limit);

    return rows.map(mapRow);
}

/**
 * Creates the profile, or updates it if this person is already registered with
 * this organization. Relies on `unique(user_id, organization_id)`, which is what
 * makes re-registration idempotent instead of producing duplicates.
 */
export async function upsert(
    values: typeof donorProfiles.$inferInsert,
    executor: DbExecutor = db,
): Promise<void> {
    await executor
        .insert(donorProfiles)
        .values(values)
        .onDuplicateKeyUpdate({
            set: {
                bloodGroup: values.bloodGroup,
                district: values.district,
                upazila: values.upazila,
                village: values.village,
                lastDonationDate: values.lastDonationDate,
            },
        });
}

export async function update(
    id: number,
    values: Partial<typeof donorProfiles.$inferInsert>,
    executor: DbExecutor = db,
): Promise<void> {
    await executor.update(donorProfiles).set(values).where(eq(donorProfiles.id, id));
}

export async function remove(id: number, executor: DbExecutor = db): Promise<void> {
    await executor.delete(donorProfiles).where(eq(donorProfiles.id, id));
}
