import { ok, searchParams, withErrorHandling } from "@/lib/api/responses";
import { toBloodRequestDto, toDonorProfileDto } from "@/lib/api/serialize";
import { requireOrgAdmin } from "@/lib/auth/guards";
import { getOrganizationAnalytics } from "@/lib/repositories/analytics";
import * as bloodRequestsRepo from "@/lib/repositories/bloodRequests";
import * as donorProfilesRepo from "@/lib/repositories/donorProfiles";
import { orgSlugQuerySchema } from "@/lib/validation/schemas";

/** GET /api/org/analytics — dashboard analytics for an organization admin. */
export const GET = withErrorHandling(async (request: Request) => {
    const query = orgSlugQuerySchema.parse(searchParams(request));
    const { organization } = await requireOrgAdmin(query.orgSlug);

    // The dashboard shows five of each. Fetching only five keeps this endpoint
    // constant-cost: it previously transferred every donor and every request
    // for the organization and then sliced, which grows without bound.
    const RECENT_LIMIT = 5;

    const [analytics, donors, requests] = await Promise.all([
        getOrganizationAnalytics(organization.id),
        donorProfilesRepo.listByOrganization(organization.id, { limit: RECENT_LIMIT }),
        bloodRequestsRepo.listByOrganization(organization.id, { limit: RECENT_LIMIT }),
    ]);

    return ok({
        organization: {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            primaryColor: organization.primaryColor,
        },
        ...analytics,
        recentDonors: donors.map((donor) => toDonorProfileDto(donor.profile, donor.user)),
        recentRequests: requests.map((row) => toBloodRequestDto(row.request, row.requester)),
    });
});
