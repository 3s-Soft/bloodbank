import { and, count, desc, eq, gte, or, isNull, type SQL } from "drizzle-orm";

import { db, type DbExecutor } from "@/lib/db";
import {
    auditLogs,
    donations,
    donorProfiles,
    events,
    feedback,
    pushSubscriptions,
    users,
} from "@/lib/db/schema";
import type {
    AuditLogRow,
    BloodGroup,
    DonationRow,
    DonorProfileRow,
    EventRow,
    FeedbackRow,
    PushSubscriptionRow,
    UserRow,
} from "@/lib/types";

/**
 * Repositories for the smaller tables: donations, events, audit logs, feedback
 * and push subscriptions. They are grouped in one module because each is a
 * handful of queries with no cross-table complexity.
 */

/* --------------------------------------------------------------- donations */

export const donationsRepo = {
    async findById(id: number, executor: DbExecutor = db): Promise<DonationRow | null> {
        const [row] = await executor.select().from(donations).where(eq(donations.id, id)).limit(1);
        return row ?? null;
    },

    async listByDonor(donorProfileId: number): Promise<DonationRow[]> {
        return db
            .select()
            .from(donations)
            .where(eq(donations.donorProfileId, donorProfileId))
            .orderBy(desc(donations.donationDate));
    },

    async listByOrganization(
        organizationId: number,
    ): Promise<{ donation: DonationRow; donor: DonorProfileRow; user: UserRow["name"] }[]> {
        const rows = await db
            .select({ donation: donations, donor: donorProfiles, user: users.name })
            .from(donations)
            .innerJoin(donorProfiles, eq(donations.donorProfileId, donorProfiles.id))
            .innerJoin(users, eq(donorProfiles.userId, users.id))
            .where(eq(donations.organizationId, organizationId))
            .orderBy(desc(donations.donationDate));

        return rows;
    },

    async countByOrganization(organizationId: number): Promise<number> {
        const [row] = await db
            .select({ total: count() })
            .from(donations)
            .where(eq(donations.organizationId, organizationId));
        return Number(row?.total ?? 0);
    },

    async countSince(organizationId: number, since: Date): Promise<number> {
        const [row] = await db
            .select({ total: count() })
            .from(donations)
            .where(
                and(
                    eq(donations.organizationId, organizationId),
                    gte(donations.donationDate, since),
                ),
            );
        return Number(row?.total ?? 0);
    },

    async create(
        values: typeof donations.$inferInsert,
        executor: DbExecutor = db,
    ): Promise<number> {
        const [result] = await executor.insert(donations).values(values);
        return Number(result.insertId);
    },
};

/* ------------------------------------------------------------------ events */

export const eventsRepo = {
    async listByOrganization(
        organizationId: number,
        filters: { status?: EventRow["status"]; upcomingOnly?: boolean } = {},
    ): Promise<EventRow[]> {
        const conditions: SQL[] = [eq(events.organizationId, organizationId)];

        if (filters.status) {
            conditions.push(eq(events.status, filters.status));
        } else if (filters.upcomingOnly) {
            const active = or(eq(events.status, "upcoming"), eq(events.status, "ongoing"));
            if (active) conditions.push(active);
        }

        return db
            .select()
            .from(events)
            .where(and(...conditions))
            .orderBy(desc(events.date));
    },

    async findById(id: number): Promise<EventRow | null> {
        const [row] = await db.select().from(events).where(eq(events.id, id)).limit(1);
        return row ?? null;
    },

    async create(values: typeof events.$inferInsert, executor: DbExecutor = db): Promise<number> {
        const [result] = await executor.insert(events).values(values);
        return Number(result.insertId);
    },

    async update(
        id: number,
        values: Partial<typeof events.$inferInsert>,
        executor: DbExecutor = db,
    ): Promise<void> {
        await executor.update(events).set(values).where(eq(events.id, id));
    },

    async remove(id: number, executor: DbExecutor = db): Promise<void> {
        await executor.delete(events).where(eq(events.id, id));
    },
};

/* -------------------------------------------------------------- audit logs */

export const auditLogsRepo = {
    async listByOrganization(
        organizationId: number,
        filters: { action?: string; limit?: number } = {},
    ): Promise<{ log: AuditLogRow; performedBy: Pick<UserRow, "id" | "name" | "phone" | "email"> | null }[]> {
        const conditions: SQL[] = [eq(auditLogs.organizationId, organizationId)];
        if (filters.action) {
            conditions.push(eq(auditLogs.action, filters.action as AuditLogRow["action"]));
        }

        return db
            .select({
                log: auditLogs,
                performedBy: {
                    id: users.id,
                    name: users.name,
                    phone: users.phone,
                    email: users.email,
                },
            })
            .from(auditLogs)
            .leftJoin(users, eq(auditLogs.performedById, users.id))
            .where(and(...conditions))
            .orderBy(desc(auditLogs.createdAt))
            .limit(filters.limit ?? 100);
    },

    /**
     * Appends an audit entry. `performedById` must come from the server-side
     * session; earlier code accepted it from the request body, which let any
     * caller attribute an action to another user.
     */
    async record(
        values: typeof auditLogs.$inferInsert,
        executor: DbExecutor = db,
    ): Promise<void> {
        await executor.insert(auditLogs).values(values);
    },
};

/* ---------------------------------------------------------------- feedback */

export const feedbackRepo = {
    async list(
        filters: {
            organizationId?: number;
            status?: FeedbackRow["status"];
            category?: FeedbackRow["category"];
        } = {},
    ): Promise<FeedbackRow[]> {
        const conditions: SQL[] = [];
        if (filters.organizationId !== undefined) {
            conditions.push(eq(feedback.organizationId, filters.organizationId));
        }
        if (filters.status) conditions.push(eq(feedback.status, filters.status));
        if (filters.category) conditions.push(eq(feedback.category, filters.category));

        const query = db.select().from(feedback);
        const filtered = conditions.length > 0 ? query.where(and(...conditions)) : query;

        return filtered.orderBy(desc(feedback.createdAt));
    },

    async create(
        values: typeof feedback.$inferInsert,
        executor: DbExecutor = db,
    ): Promise<number> {
        const [result] = await executor.insert(feedback).values(values);
        return Number(result.insertId);
    },
};

/* ------------------------------------------------------ push subscriptions */

export const pushSubscriptionsRepo = {
    /**
     * Subscribers to notify for a request.
     *
     * A subscription with no district or blood-group filter receives
     * everything, so each filter matches rows that either agree or are unset.
     * The Firestore version pulled every subscription for the organization and
     * applied this logic in memory.
     */
    async findTargets(
        organizationId: number,
        filters: { district?: string | null; bloodGroup?: BloodGroup | null } = {},
    ): Promise<PushSubscriptionRow[]> {
        const conditions: SQL[] = [eq(pushSubscriptions.organizationId, organizationId)];

        if (filters.district) {
            const match = or(
                isNull(pushSubscriptions.district),
                eq(pushSubscriptions.district, filters.district),
            );
            if (match) conditions.push(match);
        }

        if (filters.bloodGroup) {
            const match = or(
                isNull(pushSubscriptions.bloodGroup),
                eq(pushSubscriptions.bloodGroup, filters.bloodGroup),
            );
            if (match) conditions.push(match);
        }

        return db
            .select()
            .from(pushSubscriptions)
            .where(and(...conditions));
    },

    async upsert(
        values: typeof pushSubscriptions.$inferInsert,
        executor: DbExecutor = db,
    ): Promise<void> {
        await executor
            .insert(pushSubscriptions)
            .values(values)
            .onDuplicateKeyUpdate({
                set: {
                    organizationId: values.organizationId,
                    userId: values.userId,
                    district: values.district,
                    bloodGroup: values.bloodGroup,
                },
            });
    },

    async removeByToken(token: string, executor: DbExecutor = db): Promise<void> {
        await executor.delete(pushSubscriptions).where(eq(pushSubscriptions.token, token));
    },

    /** Drops tokens that FCM reported as unregistered. */
    async removeTokens(tokens: string[], executor: DbExecutor = db): Promise<void> {
        for (const token of tokens) {
            await executor.delete(pushSubscriptions).where(eq(pushSubscriptions.token, token));
        }
    },
};
