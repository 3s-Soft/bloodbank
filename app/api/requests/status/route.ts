import { ok, withErrorHandling } from "@/lib/api/responses";
import { toBloodRequestDto } from "@/lib/api/serialize";
import { requireOrgAdmin } from "@/lib/auth/guards";
import { updateStatus } from "@/lib/services/requestService";
import { bloodRequestStatusSchema } from "@/lib/validation/schemas";

/**
 * POST /api/requests/status — admin-only status change.
 *
 * Previously unauthenticated, so anyone could mark requests fulfilled or
 * cancelled. The audit entry now records the session user rather than an id
 * supplied by the caller.
 */
export const POST = withErrorHandling(async (request: Request) => {
    const input = bloodRequestStatusSchema.parse(await request.json());
    const { user, organization } = await requireOrgAdmin(input.orgSlug);

    const updated = await updateStatus(
        input.requestId,
        input.status,
        organization.id,
        user.id,
        input.fulfilledById,
    );

    return ok(toBloodRequestDto(updated, null));
});
