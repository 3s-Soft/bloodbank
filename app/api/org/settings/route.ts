import { ok, searchParams, withErrorHandling } from "@/lib/api/responses";
import { toOrganizationDto } from "@/lib/api/serialize";
import { requireOrgAdmin } from "@/lib/auth/guards";
import { updateOrganization } from "@/lib/services/organizationService";
import { organizationSettingsSchema, orgSlugQuerySchema } from "@/lib/validation/schemas";

/** GET /api/org/settings — current settings for an organization. */
export const GET = withErrorHandling(async (request: Request) => {
    const query = orgSlugQuerySchema.parse(searchParams(request));
    const { organization } = await requireOrgAdmin(query.orgSlug);

    return ok(toOrganizationDto(organization));
});

/**
 * PUT /api/org/settings — update branding and contact details.
 *
 * Previously unauthenticated: anyone could rename an organization or take over
 * its URL slug.
 */
export const PUT = withErrorHandling(async (request: Request) => {
    const input = organizationSettingsSchema.parse(await request.json());
    const { user, organization } = await requireOrgAdmin(input.orgSlug);

    const updated = await updateOrganization(organization.id, input, user.id);

    return ok(toOrganizationDto(updated));
});
