import type { Metadata } from "next";

import { BRAND } from "@/lib/config/brand";
import { isProductionSite, siteUrl } from "@/lib/siteUrl";

/**
 * Shared SEO vocabulary.
 *
 * Before this existed, `app/layout.tsx` carried the only `metadata` object in
 * the app, so all 28 pages shared one title and one description. Every
 * organization's landing page, donor directory and request board answered as
 * "Bangladesh Bloodbank - Every Drop Saves a Life", which is exactly the shape
 * of duplicate-title cluster a search engine collapses down to a single result.
 *
 * Route segments now build their own metadata through `buildMetadata`, which
 * also fills in the canonical URL and the OpenGraph/Twitter cards that were
 * missing site-wide.
 */

export const SITE_NAME = BRAND.name;
export const SITE_SHORT_NAME = BRAND.shortName;

export const SITE_DESCRIPTION =
    "Find verified blood donors across Bangladesh in minutes. A free, community-run network connecting donors and patients by blood group, district and upazila.";

/**
 * The default social card. Generated from the platform logo at the 1.91:1 ratio
 * both Facebook and X crop to, so neither has to guess.
 */
export const OG_IMAGE = {
    url: "/assets/og-image.jpg",
    width: 1200,
    height: 630,
    type: "image/jpeg",
} as const;

/**
 * Terms this platform can realistically compete for: the searches are in
 * English and Bangla, and they are overwhelmingly local ("blood donor in
 * Savar"), which is why district and upazila are threaded into per-tenant
 * titles rather than left to the generic homepage.
 */
export const SITE_KEYWORDS = [
    "blood bank Bangladesh",
    "blood donor Bangladesh",
    "find blood donor",
    "emergency blood request",
    "blood donation",
    "রক্তদাতা",
    "রক্তদান",
    "ব্লাড ব্যাংক",
    "O negative blood donor",
    "blood group search",
];

/**
 * Joins a page title to a brand or organization suffix, dropping the suffix
 * when the result would be too long to render in a search result.
 *
 * Tenant names here run from "Savar Blood Bank" to
 * "Mirpur Life Savers Foundation", so a fixed template is either wasteful for
 * the short ones or truncated for the long ones.
 */
export function composeTitle(main: string, suffix?: string | null, limit = 60): string {
    if (!suffix) return main;
    const full = `${main} — ${suffix}`;
    return full.length <= limit ? full : main;
}

export function absoluteUrl(path = "/"): string {
    const base = siteUrl();
    if (!path || path === "/") return base;
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

interface BuildMetadataOptions {
    title: string;
    description: string;
    /** Route path, used for the canonical URL. Leading slash, no origin. */
    path: string;
    /**
     * Canonical target, when it is not this page. Used by the per-tenant copies
     * of pages whose text is identical across every organization, so the
     * platform copy accumulates the signals instead of N near-duplicates
     * splitting them.
     */
    canonicalPath?: string;
    keywords?: string[];
    /** Set on pages that exist to be used, not found: forms, auth, dashboards. */
    noIndex?: boolean;
    type?: "website" | "article" | "profile";
}

/**
 * One metadata object per route segment, with the pieces that are easy to
 * forget filled in: a self-referencing canonical, an OpenGraph card, a Twitter
 * summary card, and the `max-image-preview`/`max-snippet` hints that let Google
 * show a large thumbnail instead of a text-only result.
 */
export function buildMetadata({
    title,
    description,
    path,
    canonicalPath,
    keywords,
    noIndex = false,
    type = "website",
}: BuildMetadataOptions): Metadata {
    const url = absoluteUrl(path);
    const canonical = absoluteUrl(canonicalPath ?? path);

    // A preview deployment serves identical pages on a different hostname.
    // robots.txt already blocks it, but a page-level noindex survives a crawler
    // that reached the URL from a link rather than from the root.
    const index = !noIndex && isProductionSite();

    return {
        // `absolute` opts out of the root layout's "%s | Bangladesh Blood Bank"
        // template. Every caller here writes a self-contained title that
        // already carries the brand or the organization name, and appending 24
        // more characters only pushed them past what a SERP renders.
        title: { absolute: title },
        description,
        keywords: keywords ?? undefined,
        alternates: { canonical },
        robots: {
            index,
            // `noindex, follow` rather than `noindex, nofollow`: a page kept out
            // of the index should still pass link equity to the public pages it
            // links back to. Routes that must not be crawled at all — the admin
            // panel — set `follow: false` themselves.
            follow: true,
            googleBot: {
                index,
                follow: true,
                "max-image-preview": "large",
                "max-snippet": -1,
                "max-video-preview": -1,
            },
        },
        openGraph: {
            type,
            url,
            siteName: SITE_NAME,
            title,
            description,
            locale: "en_US",
            alternateLocale: ["bn_BD"],
            images: [OG_IMAGE],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [OG_IMAGE.url],
        },
    };
}

/* -------------------------------------------------------------------------- */
/* Structured data                                                            */
/* -------------------------------------------------------------------------- */

/**
 * JSON-LD is rendered as an inline `<script type="application/ld+json">`. The
 * CSP in `next.config.ts` already allows `'unsafe-inline'` for scripts, so no
 * header change is needed; if that is ever tightened to a nonce, these tags
 * need the nonce too.
 */
export type JsonLd = Record<string, unknown>;

export function organizationJsonLd(): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "NGO",
        "@id": `${absoluteUrl()}/#organization`,
        name: SITE_NAME,
        alternateName: SITE_SHORT_NAME,
        url: absoluteUrl(),
        logo: absoluteUrl("/icons/icon-512x512.png"),
        description: SITE_DESCRIPTION,
        areaServed: { "@type": "Country", name: "Bangladesh" },
        knowsLanguage: ["en", "bn"],
    };
}

export function websiteJsonLd(): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${absoluteUrl()}/#website`,
        name: SITE_NAME,
        url: absoluteUrl(),
        description: SITE_DESCRIPTION,
        inLanguage: ["en", "bn"],
        publisher: { "@id": `${absoluteUrl()}/#organization` },
    };
}

/**
 * A tenant is a real blood bank with a street address and a phone number, which
 * is what `LocalBusiness`-family markup is for. `MedicalOrganization` is the
 * closest type; the address is only emitted when the tenant actually recorded
 * one, since a half-filled PostalAddress is worse than none.
 */
export function medicalOrganizationJsonLd(organization: {
    name: string;
    slug: string;
    logo?: string | null;
    address?: string | null;
    district?: string | null;
    upazila?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
}): JsonLd {
    const url = absoluteUrl(`/${organization.slug}`);

    const hasAddress =
        Boolean(organization.address) ||
        Boolean(organization.district) ||
        Boolean(organization.upazila);

    return {
        "@context": "https://schema.org",
        "@type": "MedicalOrganization",
        "@id": `${url}#organization`,
        name: organization.name,
        url,
        ...(organization.logo ? { logo: organization.logo } : {}),
        medicalSpecialty: "Hematologic",
        ...(hasAddress
            ? {
                  address: {
                      "@type": "PostalAddress",
                      ...(organization.address ? { streetAddress: organization.address } : {}),
                      ...(organization.upazila ? { addressLocality: organization.upazila } : {}),
                      ...(organization.district ? { addressRegion: organization.district } : {}),
                      addressCountry: "BD",
                  },
              }
            : {}),
        ...(organization.contactPhone ? { telephone: organization.contactPhone } : {}),
        ...(organization.contactEmail ? { email: organization.contactEmail } : {}),
        parentOrganization: { "@id": `${absoluteUrl()}/#organization` },
    };
}

/**
 * Breadcrumb markup replaces the bare URL in a search result with a readable
 * trail, which matters here because tenant URLs are three segments deep.
 */
export function breadcrumbJsonLd(trail: Array<{ name: string; path: string }>): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.name,
            item: absoluteUrl(crumb.path),
        })),
    };
}

export function itemListJsonLd(
    name: string,
    items: Array<{ name: string; path: string }>,
): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        numberOfItems: items.length,
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: absoluteUrl(item.path),
        })),
    };
}

export function faqJsonLd(entries: Array<{ question: string; answer: string }>): JsonLd {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: entries.map((entry) => ({
            "@type": "Question",
            name: entry.question,
            acceptedAnswer: { "@type": "Answer", text: entry.answer },
        })),
    };
}
