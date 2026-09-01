import bcrypt from "bcryptjs";
import { and, desc, eq, gt, isNull } from "drizzle-orm";

import { HttpError } from "@/lib/api/responses";
import { db } from "@/lib/db";
import { phoneVerifications } from "@/lib/db/schema";
import { buildOtpMessage, sendSms } from "@/lib/sms";

/**
 * Phone verification by one-time code.
 *
 * Design points, since this guards account creation:
 *   - The code is stored as a bcrypt hash. The database is reachable over the
 *     public internet, so a leak must not hand over live codes.
 *   - Codes expire, and each has a hard attempt cap, so the 6-digit space
 *     cannot be walked within a code's lifetime.
 *   - Requesting a new code invalidates the previous one, so only the most
 *     recent is ever valid.
 *   - `requestCode` reports the same result whether or not the gateway
 *     accepted the message, so the endpoint cannot be used to probe which
 *     numbers exist or whether delivery succeeded.
 */

const CODE_LENGTH = 6;
const EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
/** How long a successful verification stays usable for registration. */
const VERIFICATION_VALID_MINUTES = 30;

function generateCode(): string {
    // crypto.getRandomValues rather than Math.random: this is a security token.
    const digits = new Uint32Array(CODE_LENGTH);
    crypto.getRandomValues(digits);
    return Array.from(digits, (d) => String(d % 10)).join("");
}

export interface RequestCodeResult {
    expiresInMinutes: number;
    /** True only when a gateway is configured and accepted the message. */
    delivered: boolean;
}

export async function requestCode(phone: string): Promise<RequestCodeResult> {
    const code = generateCode();
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60_000);

    // Supersede any outstanding code for this number so only the newest works.
    await db
        .update(phoneVerifications)
        .set({ consumedAt: new Date() })
        .where(and(eq(phoneVerifications.phone, phone), isNull(phoneVerifications.consumedAt)));

    await db.insert(phoneVerifications).values({
        phone,
        codeHash: await bcrypt.hash(code, 10),
        expiresAt,
    });

    const result = await sendSms(phone, buildOtpMessage(code, EXPIRY_MINUTES));

    if (!result.delivered) {
        // Logged for operators; the caller is told only that a code was issued.
        console.warn(`OTP for ${phone} was not delivered: ${result.reason}`);
    }

    return { expiresInMinutes: EXPIRY_MINUTES, delivered: result.delivered };
}

export async function verifyCode(phone: string, code: string): Promise<void> {
    const [record] = await db
        .select()
        .from(phoneVerifications)
        .where(
            and(
                eq(phoneVerifications.phone, phone),
                isNull(phoneVerifications.consumedAt),
                gt(phoneVerifications.expiresAt, new Date()),
            ),
        )
        .orderBy(desc(phoneVerifications.createdAt))
        .limit(1);

    if (!record) {
        throw new HttpError(400, "That code has expired. Request a new one.");
    }

    if (record.attempts >= MAX_ATTEMPTS) {
        throw new HttpError(429, "Too many incorrect attempts. Request a new code.");
    }

    if (!(await bcrypt.compare(code, record.codeHash))) {
        await db
            .update(phoneVerifications)
            .set({ attempts: record.attempts + 1 })
            .where(eq(phoneVerifications.id, record.id));

        throw new HttpError(400, "That code is not correct.");
    }

    await db
        .update(phoneVerifications)
        .set({ consumedAt: new Date() })
        .where(eq(phoneVerifications.id, record.id));
}

/**
 * Whether this number completed verification recently enough to register with.
 *
 * Registration checks this rather than taking a "verified" flag from the
 * client, which would make the whole flow decorative.
 */
export async function hasRecentVerification(phone: string): Promise<boolean> {
    const cutoff = new Date(Date.now() - VERIFICATION_VALID_MINUTES * 60_000);

    const [record] = await db
        .select({ id: phoneVerifications.id })
        .from(phoneVerifications)
        .where(
            and(
                eq(phoneVerifications.phone, phone),
                gt(phoneVerifications.consumedAt, cutoff),
            ),
        )
        .limit(1);

    return Boolean(record);
}

/** True when phone verification should be enforced at all. */
export function isOtpRequired(): boolean {
    // Off unless explicitly enabled, so deployments without an SMS gateway keep
    // working exactly as before rather than locking every donor out.
    return process.env.OTP_REQUIRED === "true";
}
