/**
 * Logging for the App Router error boundaries.
 *
 * `error.tsx` and `global-error.tsx` are client components, so anything logged
 * here runs in the visitor's browser, not on the server. That has two
 * consequences worth being explicit about:
 *
 *   - It is not a route to the server logs. Next.js already reports the
 *     underlying failure server-side; the `digest` is the handle that
 *     correlates this page with that report.
 *   - In production the full error object is noise at best. For a failure
 *     thrown in a server component Next.js has already redacted the message
 *     down to a digest, and for one thrown on the client it only repeats what
 *     is in the console anyway.
 *
 * So: full detail while developing, digest only in production.
 */
export function reportClientError(context: string, error: Error & { digest?: string }): void {
    if (process.env.NODE_ENV === "production") {
        console.error(`${context} (reference ${error.digest ?? "none"})`);
        return;
    }

    console.error(`${context}:`, error);
}
