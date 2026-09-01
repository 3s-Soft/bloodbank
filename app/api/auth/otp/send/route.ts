import { created, withErrorHandling } from "@/lib/api/responses";
import { RATE_LIMITS, enforceRateLimit } from "@/lib/api/rateLimit";
import { requestCode } from "@/lib/services/otpService";
import { otpSendSchema } from "@/lib/validation/schemas";

/**
 * POST /api/auth/otp/send — issue a verification code for a phone number.
 *
 * Public, because it runs before an account exists. Rate limited more tightly
 * than other public writes: every call costs money at the SMS gateway.
 */
export const POST = withErrorHandling(async (request: Request) => {
    enforceRateLimit(request, RATE_LIMITS.otp);

    const { phone } = otpSendSchema.parse(await request.json());
    const result = await requestCode(phone);

    // The response never reveals whether the number is already registered, nor
    // whether the gateway actually accepted the message.
    return created({
        message: "If that number can receive SMS, a code is on its way.",
        expiresInMinutes: result.expiresInMinutes,
    });
});
