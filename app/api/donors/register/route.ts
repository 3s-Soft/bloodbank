import { created, withErrorHandling } from "@/lib/api/responses";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/api/rateLimit";
import { requireOrganization } from "@/lib/auth/guards";
import { registerDonor } from "@/lib/services/donorService";
import { donorRegistrationSchema } from "@/lib/validation/schemas";

/**
 * POST /api/donors/register — public donor sign-up.
 *
 * Deliberately unauthenticated: donors register themselves from the org page.
 */
export const POST = withErrorHandling(async (request: Request) => {
    enforceRateLimit(request, RATE_LIMITS.registration);

    const input = donorRegistrationSchema.parse(await request.json());
    const organization = await requireOrganization(input.orgSlug);

    const result = await registerDonor(input, organization.id);

    return created({
        userId: result.userId,
        created: result.created,
        message: "Registration successful",
    });
});
