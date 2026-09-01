import type { Metadata } from "next";

import { absoluteUrl } from "@/lib/seo";

/**
 * The tenant documentation is the same text under every slug. Rather than let
 * N copies compete with each other, they all point their canonical at the
 * platform copy at `/docs`, which is the one the sitemap advertises.
 */
export const metadata: Metadata = {
    title: "Documentation",
    description:
        "How to use the platform: registering donors, posting blood requests, and running an organization.",
    alternates: { canonical: absoluteUrl("/docs") },
    robots: { index: false, follow: true },
};

export default function OrgDocsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
