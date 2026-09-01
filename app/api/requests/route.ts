import { ok, searchParams, withErrorHandling } from "@/lib/api/responses";
import { toBloodRequestDto } from "@/lib/api/serialize";
import { requireOrganization } from "@/lib/auth/guards";
import * as bloodRequestsRepo from "@/lib/repositories/bloodRequests";
import { bloodRequestQuerySchema } from "@/lib/validation/schemas";

/**
 * GET /api/requests — blood requests for an organization.
 *
 * The dashboard polls this every 15 seconds, replacing the Firestore
 * onSnapshot listener, so it stays a single query with one join.
 */
export const GET = withErrorHandling(async (request: Request) => {
    const query = bloodRequestQuerySchema.parse(searchParams(request));
    const organization = await requireOrganization(query.orgSlug);

    const requests = await bloodRequestsRepo.listByOrganization(organization.id, {
        status: query.status,
        urgency: query.urgency,
        bloodGroup: query.bloodGroup,
    });

    return ok(requests.map((row) => toBloodRequestDto(row.request, row.requester)));
});
