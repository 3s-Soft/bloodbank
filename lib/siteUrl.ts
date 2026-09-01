/**
 * The canonical origin, for absolute URLs in robots.txt and the sitemap.
 *
 * Resolved rather than hard-coded so the same build works on the production
 * domain, on a preview deployment and locally.
 *
 * Order matters. `NEXTAUTH_URL` is consulted late and never trusted in
 * production if it points at localhost: it shipped that way once, and the
 * result was a live robots.txt advertising
 * `Sitemap: http://localhost:3000/sitemap.xml`, which no crawler can follow.
 * `VERCEL_URL` is deliberately unused for the canonical value, being the
 * per-deployment hostname that would put preview URLs into a sitemap.
 */

function isLocalhost(url: string): boolean {
    return /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/i.test(url);
}

function normalise(url: string): string {
    // Trailing slashes would double up when segments are appended.
    return url.replace(/\/+$/, "");
}

export function siteUrl(): string {
    const production = isProductionSite();

    // Set this to the domain visitors actually use. On a project with a custom
    // domain it is the only source that knows the real hostname.
    const explicit = process.env.NEXT_PUBLIC_SITE_URL;
    if (explicit) return normalise(explicit);

    // Vercel's canonical production domain for the project.
    const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (vercelProduction) return normalise(`https://${vercelProduction}`);

    // Last resort. In production a localhost value is certainly a
    // misconfiguration rather than an intention, so it is not used.
    const authUrl = process.env.NEXTAUTH_URL;
    if (authUrl && !(production && isLocalhost(authUrl))) {
        return normalise(authUrl);
    }

    return "http://localhost:3000";
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
