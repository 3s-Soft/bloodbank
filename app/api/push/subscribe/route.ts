import { created, ok, withErrorHandling } from "@/lib/api/responses";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/api/rateLimit";
import { optionalSession, requireOrganization } from "@/lib/auth/guards";
import { pushSubscriptionsRepo } from "@/lib/repositories/misc";
import { pushSubscribeSchema, pushUnsubscribeSchema } from "@/lib/validation/schemas";

/**
 * POST /api/push/subscribe — register an FCM token for notifications.
 *
 * Public: donors subscribe before creating an account. Signing in simply
 * associates the token with the user.
 */
export const POST = withErrorHandling(async (request: Request) => {
    enforceRateLimit(request, RATE_LIMITS.pushSubscribe);

    const input = pushSubscribeSchema.parse(await request.json());
    const organization = await requireOrganization(input.orgSlug);
    const session = await optionalSession();

    await pushSubscriptionsRepo.upsert({
        token: input.token,
        organizationId: organization.id,
        userId: session?.id ?? null,
        district: input.district ?? null,
        bloodGroup: input.bloodGroup ?? null,
    });

    return created({ subscribed: true });
});

/** DELETE /api/push/subscribe — drop a token. */
export const DELETE = withErrorHandling(async (request: Request) => {
    const input = pushUnsubscribeSchema.parse(await request.json());
    await pushSubscriptionsRepo.removeByToken(input.token);

    return ok({ subscribed: false });
});
