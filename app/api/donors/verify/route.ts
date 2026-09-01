import { ok, withErrorHandling } from "@/lib/api/responses";
import { requireOrgAdmin } from "@/lib/auth/guards";
import { setDonorVerification } from "@/lib/services/donorService";
import { donorVerifySchema } from "@/lib/validation/schemas";

/**
 * POST /api/donors/verify — admin-only donor verification toggle.
 *
 * This endpoint had no authentication before: anyone could mark any donor
 * verified by posting an id.
 */
export const POST = withErrorHandling(async (request: Request) => {
    const input = donorVerifySchema.parse(await request.json());
    const { user, organization } = await requireOrgAdmin(input.orgSlug);

    await setDonorVerification(input.donorId, input.isVerified, organization.id, user.id);

    return ok({ donorId: input.donorId, isVerified: input.isVerified });
});
