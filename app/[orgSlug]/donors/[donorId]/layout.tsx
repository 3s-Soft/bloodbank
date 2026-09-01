import type { Metadata } from "next";

/**
 * A donor profile carries a real person's name and phone number.
 *
 * `robots.txt` already disallows the donor-profile URL pattern, but that only
 * stops a crawler that read robots.txt before following an inbound link; a
 * page-level noindex is what actually keeps the URL out of the index. Both are
 * deliberate.
 *
 * `follow` stays on so the links back to the directory still count.
 */
export const metadata: Metadata = {
    title: "Donor profile",
    robots: { index: false, follow: true, nocache: true },
};

export default function DonorProfileLayout({ children }: { children: React.ReactNode }) {
    return children;
}
