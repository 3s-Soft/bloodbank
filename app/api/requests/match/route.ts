import { ok, withErrorHandling } from "@/lib/api/responses";
import { requireOrgAdmin } from "@/lib/auth/guards";
import { matchDonors } from "@/lib/services/requestService";
import { donorMatchSchema } from "@/lib/validation/schemas";

/**
 * POST /api/requests/match — compatible donors for a blood group.
 *
 * Admin-only: it returns donor phone numbers, which is contact information the
 * public directory deliberately scopes.
 */
export const POST = withErrorHandling(async (request: Request) => {
    const input = donorMatchSchema.parse(await request.json());
    const { organization } = await requireOrgAdmin(input.orgSlug);

    const result = await matchDonors(
        organization.id,
        input.bloodGroup,
        { district: input.district, upazila: input.upazila },
        input.requestId,
    );

    return ok(result);
});
