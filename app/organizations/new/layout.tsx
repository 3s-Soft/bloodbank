import type { Metadata } from "next";

import { buildMetadata } from "@/lib/seo";

/**
 * Indexable, unlike the other forms on the site: "register a blood bank" is the
 * query that brings new tenants in, and this page is the answer to it.
 */
export const metadata: Metadata = buildMetadata({
    title: "List Your Blood Bank on the Network",
    description:
        "Apply to add your blood bank or donor group to the Bangladesh Blood Bank network. " +
        "You get a public donor directory, a request board and donation records — free, on your own subdomain path.",
    path: "/organizations/new",
    keywords: [
        "register blood bank",
        "add blood donation organization",
        "blood bank software Bangladesh",
        "ব্লাড ব্যাংক নিবন্ধন",
    ],
});

export default function NewOrganizationLayout({ children }: { children: React.ReactNode }) {
    return children;
}
