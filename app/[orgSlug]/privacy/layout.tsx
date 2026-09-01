import { orgPageMetadata } from "@/lib/seoOrg";

/**
 * The policy text is identical for every tenant, so N copies of it under N
 * slugs is duplicate content with no upside — nobody arrives here from search.
 * `noIndex` keeps them out of the index while still passing link equity, which
 * is the same call `app/sitemap.ts` makes by excluding these paths.
 */
export const generateMetadata = orgPageMetadata({
    path: "/privacy",
    title: (name) => `Privacy Policy — ${name}`,
    description: (name) =>
        `How ${name} collects, stores and shares donor and patient information on this platform.`,
    noIndex: true,
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
