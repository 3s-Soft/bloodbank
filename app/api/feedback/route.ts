import { created, ok, searchParams, withErrorHandling } from "@/lib/api/responses";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/api/rateLimit";
import { toFeedbackDto } from "@/lib/api/serialize";
import { requireOrgAdmin, requireOrganization, requireSuperAdmin } from "@/lib/auth/guards";
import { feedbackRepo } from "@/lib/repositories/misc";
import { feedbackCreateSchema, feedbackQuerySchema } from "@/lib/validation/schemas";

/**
 * GET /api/feedback — submitted feedback.
 *
 * Scoped to an organization for its admins; platform-wide for super admins.
 */
export const GET = withErrorHandling(async (request: Request) => {
    const query = feedbackQuerySchema.parse(searchParams(request));

    if (query.orgSlug) {
        const { organization } = await requireOrgAdmin(query.orgSlug);
        return ok(
            (
                await feedbackRepo.list({
                    organizationId: organization.id,
                    status: query.status,
                    category: query.category,
                })
            ).map(toFeedbackDto),
        );
    }

    await requireSuperAdmin();
    const rows = await feedbackRepo.list({ status: query.status, category: query.category });

    return ok(rows.map(toFeedbackDto));
});

/** POST /api/feedback — public feedback submission. */
export const POST = withErrorHandling(async (request: Request) => {
    enforceRateLimit(request, RATE_LIMITS.submission);

    const input = feedbackCreateSchema.parse(await request.json());

    const organization = input.orgSlug ? await requireOrganization(input.orgSlug) : null;

    const id = await feedbackRepo.create({
        name: input.name,
        email: input.email || null,
        category: input.category,
        message: input.message,
        organizationId: organization?.id ?? null,
    });

    return created({ id, message: "Thank you for your feedback" });
});
