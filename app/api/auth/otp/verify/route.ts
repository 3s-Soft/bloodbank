import { ok, withErrorHandling } from "@/lib/api/responses";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/api/rateLimit";
import { verifyCode } from "@/lib/services/otpService";
import { otpVerifySchema } from "@/lib/validation/schemas";

/**
 * POST /api/auth/otp/verify — confirm a code.
 *
 * The per-code attempt cap lives in the service; this limiter additionally
 * blunts someone cycling through many numbers from one address.
 */
export const POST = withErrorHandling(async (request: Request) => {
    enforceRateLimit(request, RATE_LIMITS.otp);

    const { phone, code } = otpVerifySchema.parse(await request.json());
    await verifyCode(phone, code);

    return ok({ verified: true });
});
