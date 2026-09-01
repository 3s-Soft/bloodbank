import { ok, searchParams, withErrorHandling } from "@/lib/api/responses";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { findInactiveOrganizations } from "@/lib/repositories/analytics";

/**
 * GET /api/admin/inactivity — organizations with no recent donors or requests.
 *
 * The Firestore version looped over every organization issuing four queries
 * each; this is two grouped queries in total.
 */
export const GET = withErrorHandling(async (request: Request) => {
    await requireSuperAdmin();

    const raw = Number(searchParams(request).days ?? 30);
    const days = Number.isFinite(raw) && raw > 0 ? Math.min(raw, 3650) : 30;

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const organizations = await findInactiveOrganizations(cutoff);

    return ok({
        threshold: days,
        totalInactive: organizations.length,
        organizations: organizations.map((org) => ({
            ...org,
            lastActivityDate: org.lastActivityDate ? org.lastActivityDate.toISOString() : null,
        })),
    });
});
