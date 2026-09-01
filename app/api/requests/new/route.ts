import { created, withErrorHandling } from "@/lib/api/responses";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/api/rateLimit";
import { toBloodRequestDto } from "@/lib/api/serialize";
import { optionalSession, requireOrganization } from "@/lib/auth/guards";
import { createRequest } from "@/lib/services/requestService";
import { bloodRequestCreateSchema } from "@/lib/validation/schemas";

/**
 * POST /api/requests/new — public blood request creation.
 *
 * Public by design: someone needing blood must not have to register first. If
 * the caller happens to be signed in, the request is attributed to them.
 */
export const POST = withErrorHandling(async (request: Request) => {
    enforceRateLimit(request, RATE_LIMITS.bloodRequest);

    const input = bloodRequestCreateSchema.parse(await request.json());
    const organization = await requireOrganization(input.orgSlug);
    const session = await optionalSession();

    const bloodRequest = await createRequest(
        input,
        organization.id,
        organization.slug,
        session?.id ?? null,
    );

    return created(toBloodRequestDto(bloodRequest, null));
});
