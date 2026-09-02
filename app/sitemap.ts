import type { MetadataRoute } from "next";

import * as organizationsRepo from "@/lib/repositories/organizations";
import { siteUrl } from "@/lib/siteUrl";

/**
 * sitemap.xml
 *
 * Regenerated at most once an hour rather than on every request. Each rebuild
 * costs a database query, and crawlers fetch this far more often than the
 * organization list actually changes; on a single-connection pool against
 * shared hosting that is worth avoiding.
 */
export const revalidate = 3600;

/**
 * Public pages that exist under every organization.
 *
 * Deliberately excluded:
 *   - `donors/[donorId]`, which carries a person's name and phone number
 *   - `requests/new` and `feedback`, which are forms with nothing to index
 *   - `docs`, `privacy` and `terms`, which are identical for every tenant. The
 *     platform copies of those are listed below instead, and the tenant copies
 *     canonicalise to them.
 */
const ORG_PAGES = [
    { path: "", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/donors", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/requests", priority: 0.8, changeFrequency: "hourly" as const },
    { path: "/events", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/leaderboard", priority: 0.5, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/register", priority: 0.7, changeFrequency: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = siteUrl();
    const now = new Date();

    const staticEntries: MetadataRoute.Sitemap = [
        { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
        {
            url: `${base}/organizations/new`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${base}/docs`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.4,
        },
        {
            url: `${base}/register`,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 0.8,
        },
        {
            url: `${base}/about`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${base}/contact`,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 0.5,
        },
        // The platform policies. These are the canonical target for the
        // per-tenant copies, so they belong here even though nobody searches
        // for them directly.
        {
            url: `${base}/privacy`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${base}/terms`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${base}/cookies`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.2,
        },
    ];

    let organizations: Awaited<ReturnType<typeof organizationsRepo.listActive>> = [];

    try {
        organizations = await organizationsRepo.listActive();
    } catch (error) {
        // A sitemap that omits the organizations is still a valid sitemap. It
        // is not worth failing the response, and therefore the crawl, because
        // the database was briefly unreachable.
        console.error("Sitemap could not load organizations:", error);
    }

    // Only verified organizations, matching what the public directory lists.
    // An organization awaiting review should not be advertised to search
    // engines before a human has approved it.
    const orgEntries: MetadataRoute.Sitemap = organizations
        .filter((organization) => organization.isVerified)
        .flatMap((organization) =>
            ORG_PAGES.map((page) => ({
                url: `${base}/${organization.slug}${page.path}`,
                lastModified: organization.updatedAt ?? now,
                changeFrequency: page.changeFrequency,
                priority: page.priority,
            })),
        );

    return [...staticEntries, ...orgEntries];
}
