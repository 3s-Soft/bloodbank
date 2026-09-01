import { ok, searchParams, withErrorHandling } from "@/lib/api/responses";
import { requireOrganization } from "@/lib/auth/guards";
import * as organizationsRepo from "@/lib/repositories/organizations";
import { orgSlugQuerySchema } from "@/lib/validation/schemas";

/** GET /api/org/stats — public counters for an organization landing page. */
export const GET = withErrorHandling(async (request: Request) => {
    const query = orgSlugQuerySchema.parse(searchParams(request));
    const organization = await requireOrganization(query.orgSlug);

    return ok(await organizationsRepo.getStats(organization.id));
});
