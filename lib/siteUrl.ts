/**
 * The canonical origin, for absolute URLs in robots.txt and the sitemap.
 *
 * Resolved rather than hard-coded so the same build works on the production
 * domain, on a preview deployment and locally. `VERCEL_URL` is deliberately not
 * used for the canonical value: it is the per-deployment hostname, which would
 * put preview URLs into a sitemap.
 */
export function siteUrl(): string {
    const configured =
        process.env.NEXT_PUBLIC_SITE_URL ??
        process.env.NEXTAUTH_URL ??
        (process.env.VERCEL_PROJECT_PRODUCTION_URL
            ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
            : undefined) ??
        "http://localhost:3000";

    // Trailing slashes would double up when segments are appended.
    return configured.replace(/\/+$/, "");
}

/**
 * Whether this deployment is the real production site.
 *
 * Preview deployments serve the same pages on a different hostname, which is
 * duplicate content; they should not be indexed.
 */
export function isProductionSite(): boolean {
    // VERCEL_ENV is "production", "preview" or "development".
    if (process.env.VERCEL_ENV) return process.env.VERCEL_ENV === "production";
    return process.env.NODE_ENV === "production";
}
