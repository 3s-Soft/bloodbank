/**
 * SMS delivery.
 *
 * Bangladeshi gateways (Alpha SMS, BulkSMSBD, SSL Wireless, REVE and others)
 * almost all expose the same shape: an HTTP endpoint taking an API key, a
 * recipient and a message. Rather than binding to one vendor, the endpoint and
 * parameter names are configured, so switching providers is an environment
 * change rather than a code change.
 *
 * With nothing configured, `send` logs the message and reports that it was not
 * delivered. That keeps local development and CI working without credentials,
 * and callers decide whether an undelivered message is fatal.
 */

export interface SmsResult {
    delivered: boolean;
    /** Present when delivery failed, for logging. Never shown to end users. */
    reason?: string;
}

function isConfigured(): boolean {
    return Boolean(process.env.SMS_API_URL && process.env.SMS_API_KEY);
}

export function smsProviderName(): string {
    return isConfigured() ? (process.env.SMS_PROVIDER ?? "http") : "console";
}

/**
 * Sends one message.
 *
 * Never throws: an SMS failure should degrade the flow that triggered it, not
 * break it, and the caller already handles `delivered: false`.
 */
export async function sendSms(to: string, message: string): Promise<SmsResult> {
    if (!isConfigured()) {
        // Visible in dev logs so the code can be read during local testing.
        console.info(`[sms:console] to=${to} message=${message}`);
        return { delivered: false, reason: "SMS provider is not configured" };
    }

    const url = process.env.SMS_API_URL as string;
    const apiKey = process.env.SMS_API_KEY as string;
    const senderId = process.env.SMS_SENDER_ID;

    // Parameter names differ per gateway; these defaults match the most common
    // Bangladeshi ones and can be overridden per deployment.
    const keyParam = process.env.SMS_PARAM_KEY ?? "api_key";
    const toParam = process.env.SMS_PARAM_TO ?? "msisdn";
    const messageParam = process.env.SMS_PARAM_MESSAGE ?? "message";
    const senderParam = process.env.SMS_PARAM_SENDER ?? "sender_id";

    const body = new URLSearchParams({
        [keyParam]: apiKey,
        [toParam]: to,
        [messageParam]: message,
    });
    if (senderId) body.set(senderParam, senderId);

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
            // A blocked gateway must not hold a serverless invocation open.
            signal: AbortSignal.timeout(10_000),
        });

        if (!response.ok) {
            return { delivered: false, reason: `Gateway responded ${response.status}` };
        }

        return { delivered: true };
    } catch (error) {
        return {
            delivered: false,
            reason: error instanceof Error ? error.message : "Unknown SMS error",
        };
    }
}

/** Wording kept short: gateways bill per 160-character segment. */
export function buildOtpMessage(code: string, minutes: number): string {
    return `Your verification code is ${code}. It expires in ${minutes} minutes. Do not share it with anyone.`;
}
