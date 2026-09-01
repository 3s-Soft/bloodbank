import type { MetadataRoute } from "next";

import { isProductionSite, siteUrl } from "@/lib/siteUrl";

/**
 * robots.txt
 *
 * Nothing was served here before, so crawlers requesting it fell through to the
 * 404 page.
 */
export default function robots(): MetadataRoute.Robots {
    const base = siteUrl();

    // A preview deployment serves the same pages on a different hostname.
    // Indexing it would compete with the real site for the same content.
    if (!isProductionSite()) {
        return { rules: [{ userAgent: "*", disallow: "/" }] };
    }

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    // Authenticated surfaces. They redirect to /login for a
                    // crawler anyway, so indexing them yields nothing.
                    "/admin",
                    "/*/dashboard",
                    "/login",

                    // The API answers JSON and sends Cache-Control: no-store.
                    "/api/",
                ],

                // Individual donor profiles carry a person's name and phone
                // number and must stay out of search results. They used to be
                // listed above as `Disallow: /*/donors/*`, which is the weaker
                // control: a disallowed URL can still be indexed as a bare link
                // if something external points at it, and blocking the crawl is
                // precisely what stops a crawler from ever reading the noindex
                // that would have removed it. The page-level
                // `robots: { index: false }` in
                // `app/[orgSlug]/donors/[donorId]/layout.tsx` is what actually
                // guarantees exclusion, and it needs the page to be crawlable.
            },
        ],
        sitemap: `${base}/sitemap.xml`,
        host: base,
    };
}
