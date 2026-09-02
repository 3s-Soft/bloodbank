import { orgPageMetadata } from "@/lib/seoOrg";

/**
 * The tenant copy of the policy is the same text under every slug, differing
 * only by the organization's name. Rather than keep N near-duplicates out of
 * the index entirely, they now canonicalise to the platform policy at
 * `/privacy` — the signals consolidate there instead of being discarded, and
 * the page a searcher lands on is the authoritative one.
 */
export const generateMetadata = orgPageMetadata({
    path: "/privacy",
    canonicalPath: "/privacy",
    title: (name) => `Privacy Policy — ${name}`,
    description: (name) =>
        `How ${name} collects, stores and shares donor and patient information on this platform.`,
});

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return children;
}
