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

                    // Individual donor profiles carry a person's name and phone
                    // number. The donor directory is meant to be searched from
                    // inside the site by someone who needs blood, which is not
                    // the same as having each donor's contact details indexed
                    // and surfaced by a search engine.
                    "/*/donors/*",
                ],
            },
        ],
        sitemap: `${base}/sitemap.xml`,
        host: base,
    };
}
