import { and, count, desc, eq, like, or, type SQL } from "drizzle-orm";

import { db, type DbExecutor } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { UserRow } from "@/lib/types";

/**
 * User queries.
 *
 * Lookups by phone and email back the two credentials providers, so they hit
 * the unique indexes on those columns rather than scanning.
 */

/**
 * Reads take an optional executor so they can run inside a caller's
 * transaction. This is not optional in practice: the connection pool holds a
 * single connection per instance, so a read issued against the pool while a
 * transaction holds that connection waits for a connection that cannot be
 * released until the transaction finishes, and the request deadlocks.
 */
export async function findById(
    id: number,
    executor: DbExecutor = db,
): Promise<UserRow | null> {
    const [row] = await executor.select().from(users).where(eq(users.id, id)).limit(1);
    return row ?? null;
}

export async function findByPhone(
    phone: string,
    executor: DbExecutor = db,
): Promise<UserRow | null> {
    const [row] = await executor.select().from(users).where(eq(users.phone, phone)).limit(1);
    return row ?? null;
}

export async function findByEmail(
    email: string,
    executor: DbExecutor = db,
): Promise<UserRow | null> {
    const [row] = await executor.select().from(users).where(eq(users.email, email)).limit(1);
    return row ?? null;
}

/** Used by donor registration, which accepts either identifier. */
export async function findByPhoneOrEmail(
    phone?: string | null,
    email?: string | null,
    executor: DbExecutor = db,
): Promise<UserRow | null> {
    const conditions: SQL[] = [];
    if (phone) conditions.push(eq(users.phone, phone));
    if (email) conditions.push(eq(users.email, email));
    if (conditions.length === 0) return null;

    const [row] = await executor
        .select()
        .from(users)
        .where(conditions.length === 1 ? conditions[0] : or(...conditions))
        .limit(1);

    return row ?? null;
}

export interface ListUsersFilters {
    role?: string;
    search?: string;
}

/**
 * Organization member list. Search runs in SQL across name, phone and email;
 * the Firestore version fetched every member and filtered in memory.
 */
export async function listByOrganization(
    organizationId: number,
    filters: ListUsersFilters = {},
): Promise<UserRow[]> {
    const conditions: SQL[] = [eq(users.organizationId, organizationId)];

    if (filters.role && filters.role !== "all") {
        conditions.push(eq(users.role, filters.role as UserRow["role"]));
    }

    if (filters.search) {
        const term = `%${filters.search}%`;
        const match = or(like(users.name, term), like(users.phone, term), like(users.email, term));
        if (match) conditions.push(match);
    }

    return db
        .select()
        .from(users)
        .where(and(...conditions))
        .orderBy(desc(users.createdAt));
}

export interface RoleCounts {
    total: number;
    donors: number;
    admins: number;
    patients: number;
    volunteers: number;
}

/**
 * Member counts by role for the dashboard tiles. One grouped query replaces the
 * five sequential counts the Firestore version issued.
 */
export async function countByRole(organizationId: number): Promise<RoleCounts> {
    const rows = await db
        .select({ role: users.role, total: count() })
        .from(users)
        .where(eq(users.organizationId, organizationId))
        .groupBy(users.role);

    const byRole = Object.fromEntries(rows.map((row) => [row.role, Number(row.total)]));

    return {
        total: rows.reduce((sum, row) => sum + Number(row.total), 0),
        donors: byRole.donor ?? 0,
        admins: byRole.admin ?? 0,
        patients: byRole.patient ?? 0,
        volunteers: byRole.volunteer ?? 0,
    };
}

export async function create(
    values: typeof users.$inferInsert,
    executor: DbExecutor = db,
): Promise<number> {
    const [result] = await executor.insert(users).values(values);
    return Number(result.insertId);
}

export async function update(
    id: number,
    values: Partial<typeof users.$inferInsert>,
    executor: DbExecutor = db,
): Promise<void> {
    await executor.update(users).set(values).where(eq(users.id, id));
}

export async function remove(id: number, executor: DbExecutor = db): Promise<void> {
    await executor.delete(users).where(eq(users.id, id));
}

/**
 * Creates the user record for a Google sign-in, or returns the existing one.
 * NextAuth calls this on every Google login, so it must be idempotent.
 */
export async function upsertGoogleUser(values: {
    name: string;
    email: string;
    image?: string | null;
    defaultRole: UserRow["role"];
    notificationPreferences: UserRow["notificationPreferences"];
}): Promise<UserRow> {
    const existing = await findByEmail(values.email);
    if (existing) {
        // Refresh the avatar but never touch role or organization: those are
        // administrative decisions, not something a login should overwrite.
        if (values.image && values.image !== existing.image) {
            await update(existing.id, { image: values.image });
        }
        return existing;
    }

    const id = await create({
        name: values.name,
        email: values.email,
        image: values.image ?? null,
        role: values.defaultRole,
        notificationPreferences: values.notificationPreferences,
    });

    const created = await findById(id);
    if (!created) {
        throw new Error("Failed to load the user record created for Google sign-in");
    }
    return created;
}
