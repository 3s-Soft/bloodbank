import { created, ok, searchParams, withErrorHandling } from "@/lib/api/responses";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/api/rateLimit";
import { toOrganizationDto } from "@/lib/api/serialize";
import { requireSession } from "@/lib/auth/guards";
import * as organizationsRepo from "@/lib/repositories/organizations";
import { createOrganization } from "@/lib/services/organizationService";
import { organizationCreateSchema } from "@/lib/validation/schemas";

/**
 * GET /api/organizations — public directory.
 *
 * Unverified organizations are hidden unless explicitly requested, so a
 * freshly-submitted organization does not appear as endorsed.
 */
export const GET = withErrorHandling(async (request: Request) => {
    const includeUnverified = searchParams(request).includeUnverified === "true";
    const rows = await organizationsRepo.listActive();

    const visible = includeUnverified ? rows : rows.filter((row) => row.isVerified);

    return ok(visible.map(toOrganizationDto));
});

/**
 * POST /api/organizations — request a new organization.
 *
 * Any signed-in user may apply; it is created unverified and a super admin
 * reviews it.
 */
export const POST = withErrorHandling(async (request: Request) => {
    enforceRateLimit(request, RATE_LIMITS.submission);

    await requireSession();
    const input = organizationCreateSchema.parse(await request.json());

    const organization = await createOrganization(input);

    return created({
        ...toOrganizationDto(organization),
        message: "Organization submitted. It will be reviewed by an administrator.",
    });
});
