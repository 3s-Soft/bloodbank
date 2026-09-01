import { HttpError } from "./responses";

/**
 * Fixed-window rate limiting for public write endpoints.
 *
 * Scope and honest limitations: counters live in the memory of a single
 * serverless instance. Vercel runs many instances and recycles them, so the
 * effective allowance is higher than the configured limit and resets on cold
 * start. This is a speed bump against casual abuse and accidental double
 * submits, not a defence against a determined distributed attacker. Enforcing a
 * real global limit needs shared state (Upstash Redis or similar); doing it in
 * MySQL would add a round trip to every request against a 50-connection cap.
 *
 * Authenticated admin routes are deliberately not limited: they are already
 * behind a session and a role check.
 */

interface Window {
    count: number;
    resetAt: number;
}

const windows = new Map<string, Window>();

/** Bounds memory if an instance lives long enough to accumulate many keys. */
const MAX_TRACKED_KEYS = 10_000;

function sweep(now: number) {
    for (const [key, window] of windows) {
        if (window.resetAt <= now) windows.delete(key);
    }
}

/**
 * Best-effort client identity.
 *
 * `x-forwarded-for` is set by Vercel's proxy. It is spoofable when the app is
 * reached directly, which is another reason this is a speed bump rather than a
 * security control.
 */
export function clientKey(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    return request.headers.get("x-real-ip") ?? "unknown";
}

export interface RateLimitOptions {
    /** Requests allowed per window. */
    limit: number;
    /** Window length in milliseconds. */
    windowMs: number;
    /** Distinguishes counters for different endpoints. */
    bucket: string;
}

/** Throws HttpError 429 when the caller has exceeded the window. */
export function enforceRateLimit(request: Request, options: RateLimitOptions): void {
    const now = Date.now();

    if (windows.size > MAX_TRACKED_KEYS) sweep(now);

    const key = `${options.bucket}:${clientKey(request)}`;
    const existing = windows.get(key);

    if (!existing || existing.resetAt <= now) {
        windows.set(key, { count: 1, resetAt: now + options.windowMs });
        return;
    }

    existing.count += 1;

    if (existing.count > options.limit) {
        const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
        throw new HttpError(429, "Too many requests. Please wait and try again.", {
            retryAfter,
        });
    }
}

/** Shared budgets, kept generous enough not to affect ordinary use. */
export const RATE_LIMITS = {
    /** Donor sign-up: a person registers once, occasionally twice. */
    registration: { limit: 5, windowMs: 60_000, bucket: "registration" },
    /** Blood requests: urgent situations may mean a few in a row. */
    bloodRequest: { limit: 10, windowMs: 60_000, bucket: "blood-request" },
    /** Feedback and organization applications. */
    submission: { limit: 5, windowMs: 60_000, bucket: "submission" },
    /** Push subscription changes, which a client may retry. */
    pushSubscribe: { limit: 20, windowMs: 60_000, bucket: "push" },
} as const satisfies Record<string, RateLimitOptions>;
