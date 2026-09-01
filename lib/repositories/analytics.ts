import { and, count, desc, eq, gte, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { bloodRequests, donorProfiles, organizations, users } from "@/lib/db/schema";

/**
 * Dashboard aggregates.
 *
 * The Firestore implementations issued one `.count()` per metric: the
 * organization analytics endpoint alone made roughly twenty sequential round
 * trips, plus a full scan of donor documents to tally districts. Every one of
 * those is now a GROUP BY, so the endpoint costs a handful of queries. That
 * matters more here than it did on Firestore, because each round trip crosses
 * the public internet to Hostinger rather than staying inside Google's network.
 */

export interface OrganizationAnalytics {
    overview: {
        totalDonors: number;
        verifiedDonors: number;
        unverifiedDonors: number;
        availableDonors: number;
        totalRequests: number;
        pendingRequests: number;
        fulfilledRequests: number;
        canceledRequests: number;
        fulfillmentRate: number;
        verificationRate: number;
    };
    bloodGroupStats: { group: string; count: number }[];
    urgencyStats: { normal: number; urgent: number; emergency: number };
    districtStats: { district: string; count: number }[];
    upazilaStats: { upazila: string; count: number }[];
    recentActivity: { newDonors: number; newRequests: number };
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] as const;

export async function getOrganizationAnalytics(
    organizationId: number,
): Promise<OrganizationAnalytics> {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
        [donorTotals],
        bloodGroupRows,
        districtRows,
        upazilaRows,
        requestStatusRows,
        pendingUrgencyRows,
        [recentDonors],
        [recentRequests],
    ] = await Promise.all([
        db
            .select({
                total: count(),
                verified: sql<number>`SUM(CASE WHEN ${donorProfiles.isVerified} = 1 THEN 1 ELSE 0 END)`,
                available: sql<number>`SUM(CASE WHEN ${donorProfiles.isAvailable} = 1 THEN 1 ELSE 0 END)`,
            })
            .from(donorProfiles)
            .where(eq(donorProfiles.organizationId, organizationId)),

        db
            .select({ group: donorProfiles.bloodGroup, total: count() })
            .from(donorProfiles)
            .where(eq(donorProfiles.organizationId, organizationId))
            .groupBy(donorProfiles.bloodGroup),

        db
            .select({ district: donorProfiles.district, total: count() })
            .from(donorProfiles)
            .where(eq(donorProfiles.organizationId, organizationId))
            .groupBy(donorProfiles.district)
            .orderBy(desc(count()))
            .limit(5),

        db
            .select({ upazila: donorProfiles.upazila, total: count() })
            .from(donorProfiles)
            .where(eq(donorProfiles.organizationId, organizationId))
            .groupBy(donorProfiles.upazila)
            .orderBy(desc(count()))
            .limit(5),

        db
            .select({ status: bloodRequests.status, total: count() })
            .from(bloodRequests)
            .where(eq(bloodRequests.organizationId, organizationId))
            .groupBy(bloodRequests.status),

        db
            .select({ urgency: bloodRequests.urgency, total: count() })
            .from(bloodRequests)
            .where(
                and(
                    eq(bloodRequests.organizationId, organizationId),
                    eq(bloodRequests.status, "pending"),
                ),
            )
            .groupBy(bloodRequests.urgency),

        db
            .select({ total: count() })
            .from(donorProfiles)
            .where(
                and(
                    eq(donorProfiles.organizationId, organizationId),
                    gte(donorProfiles.createdAt, weekAgo),
                ),
            ),

        db
            .select({ total: count() })
            .from(bloodRequests)
            .where(
                and(
                    eq(bloodRequests.organizationId, organizationId),
                    gte(bloodRequests.createdAt, weekAgo),
                ),
            ),
    ]);

    const totalDonors = Number(donorTotals?.total ?? 0);
    const verifiedDonors = Number(donorTotals?.verified ?? 0);
    const availableDonors = Number(donorTotals?.available ?? 0);

    const byStatus = Object.fromEntries(
        requestStatusRows.map((row) => [row.status, Number(row.total)]),
    );
    const totalRequests = requestStatusRows.reduce((sum, row) => sum + Number(row.total), 0);
    const fulfilledRequests = byStatus.fulfilled ?? 0;

    const byUrgency = Object.fromEntries(
        pendingUrgencyRows.map((row) => [row.urgency, Number(row.total)]),
    );

    const bloodGroupCounts = Object.fromEntries(
        bloodGroupRows.map((row) => [row.group, Number(row.total)]),
    );

    return {
        overview: {
            totalDonors,
            verifiedDonors,
            unverifiedDonors: totalDonors - verifiedDonors,
            availableDonors,
            totalRequests,
            pendingRequests: byStatus.pending ?? 0,
            fulfilledRequests,
            canceledRequests: byStatus.canceled ?? 0,
            fulfillmentRate:
                totalRequests > 0 ? Math.round((fulfilledRequests / totalRequests) * 100) : 0,
            verificationRate:
                totalDonors > 0 ? Math.round((verifiedDonors / totalDonors) * 100) : 0,
        },
        // Every blood group is listed, including those with no donors, so the
        // chart keeps a stable set of bars.
        bloodGroupStats: BLOOD_GROUPS.map((group) => ({
            group,
            count: bloodGroupCounts[group] ?? 0,
        })),
        urgencyStats: {
            normal: byUrgency.normal ?? 0,
            urgent: byUrgency.urgent ?? 0,
            emergency: byUrgency.emergency ?? 0,
        },
        districtStats: districtRows
            .filter((row): row is { district: string; total: number } => Boolean(row.district))
            .map((row) => ({ district: row.district, count: Number(row.total) })),
        upazilaStats: upazilaRows
            .filter((row): row is { upazila: string; total: number } => Boolean(row.upazila))
            .map((row) => ({ upazila: row.upazila, count: Number(row.total) })),
        recentActivity: {
            newDonors: Number(recentDonors?.total ?? 0),
            newRequests: Number(recentRequests?.total ?? 0),
        },
    };
}

export interface PlatformAnalytics {
    overview: {
        totalOrganizations: number;
        activeOrganizations: number;
        verifiedOrganizations: number;
        totalUsers: number;
        totalDonors: number;
        totalRequests: number;
        fulfilledRequests: number;
        fulfillmentRate: number;
    };
    bloodGroupStats: { group: string; count: number }[];
    organizationLeaderboard: {
        id: number;
        name: string;
        slug: string;
        donors: number;
    }[];
}

export async function getPlatformAnalytics(): Promise<PlatformAnalytics> {
    const [
        [orgTotals],
        [userTotals],
        [donorTotals],
        bloodGroupRows,
        requestStatusRows,
        leaderboardRows,
    ] = await Promise.all([
        db
            .select({
                total: count(),
                active: sql<number>`SUM(CASE WHEN ${organizations.isActive} = 1 THEN 1 ELSE 0 END)`,
                verified: sql<number>`SUM(CASE WHEN ${organizations.isVerified} = 1 THEN 1 ELSE 0 END)`,
            })
            .from(organizations),

        db.select({ total: count() }).from(users),
        db.select({ total: count() }).from(donorProfiles),

        db
            .select({ group: donorProfiles.bloodGroup, total: count() })
            .from(donorProfiles)
            .groupBy(donorProfiles.bloodGroup),

        db
            .select({ status: bloodRequests.status, total: count() })
            .from(bloodRequests)
            .groupBy(bloodRequests.status),

        db
            .select({
                id: organizations.id,
                name: organizations.name,
                slug: organizations.slug,
                donors: count(donorProfiles.id),
            })
            .from(organizations)
            .leftJoin(donorProfiles, eq(donorProfiles.organizationId, organizations.id))
            .groupBy(organizations.id, organizations.name, organizations.slug)
            .orderBy(desc(count(donorProfiles.id)))
            .limit(10),
    ]);

    const byStatus = Object.fromEntries(
        requestStatusRows.map((row) => [row.status, Number(row.total)]),
    );
    const totalRequests = requestStatusRows.reduce((sum, row) => sum + Number(row.total), 0);
    const fulfilledRequests = byStatus.fulfilled ?? 0;

    const bloodGroupCounts = Object.fromEntries(
        bloodGroupRows.map((row) => [row.group, Number(row.total)]),
    );

    return {
        overview: {
            totalOrganizations: Number(orgTotals?.total ?? 0),
            activeOrganizations: Number(orgTotals?.active ?? 0),
            verifiedOrganizations: Number(orgTotals?.verified ?? 0),
            totalUsers: Number(userTotals?.total ?? 0),
            totalDonors: Number(donorTotals?.total ?? 0),
            totalRequests,
            fulfilledRequests,
            fulfillmentRate:
                totalRequests > 0 ? Math.round((fulfilledRequests / totalRequests) * 100) : 0,
        },
        bloodGroupStats: BLOOD_GROUPS.map((group) => ({
            group,
            count: bloodGroupCounts[group] ?? 0,
        })),
        organizationLeaderboard: leaderboardRows.map((row) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            donors: Number(row.donors),
        })),
    };
}

/**
 * Organizations with no new donors or requests since the cutoff.
 *
 * Previously this looped over every organization issuing four queries each.
 * Here the last-activity timestamps come back for all organizations at once and
 * the filtering happens over that small result set.
 */
export async function findInactiveOrganizations(cutoff: Date) {
    const rows = await db
        .select({
            id: organizations.id,
            name: organizations.name,
            slug: organizations.slug,
            lastDonorAt: sql<Date | null>`MAX(${donorProfiles.createdAt})`,
            totalDonors: count(donorProfiles.id),
        })
        .from(organizations)
        .leftJoin(donorProfiles, eq(donorProfiles.organizationId, organizations.id))
        .where(eq(organizations.isActive, true))
        .groupBy(organizations.id, organizations.name, organizations.slug);

    const requestRows = await db
        .select({
            organizationId: bloodRequests.organizationId,
            lastRequestAt: sql<Date | null>`MAX(${bloodRequests.createdAt})`,
            totalRequests: count(),
        })
        .from(bloodRequests)
        .groupBy(bloodRequests.organizationId);

    const requestsByOrg = new Map(requestRows.map((row) => [row.organizationId, row]));

    return rows
        .map((row) => {
            const requests = requestsByOrg.get(row.id);
            const lastDonorAt = row.lastDonorAt ? new Date(row.lastDonorAt) : null;
            const lastRequestAt = requests?.lastRequestAt
                ? new Date(requests.lastRequestAt)
                : null;

            const lastActivityDate =
                lastDonorAt && lastRequestAt
                    ? lastDonorAt > lastRequestAt
                        ? lastDonorAt
                        : lastRequestAt
                    : (lastDonorAt ?? lastRequestAt);

            return {
                id: row.id,
                name: row.name,
                slug: row.slug,
                lastActivityDate,
                daysSinceActivity: lastActivityDate
                    ? Math.floor((Date.now() - lastActivityDate.getTime()) / 86_400_000)
                    : null,
                totalDonors: Number(row.totalDonors),
                totalRequests: Number(requests?.totalRequests ?? 0),
            };
        })
        .filter((row) => !row.lastActivityDate || row.lastActivityDate < cutoff);
}
