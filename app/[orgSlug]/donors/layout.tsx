import { composeTitle } from "@/lib/seo";
import { orgPageMetadata } from "@/lib/seoOrg";

/**
 * The donor directory is the page with genuine search demand: people type
 * "O negative blood donor <district>" into Google, not the organization's name.
 * The blood groups are spelled out in the description so the page has a chance
 * of matching those queries before anyone clicks a filter.
 */
export const generateMetadata = orgPageMetadata({
    path: "/donors",
    title: (name, where) => composeTitle(`Blood Donors ${where}`, name),
    description: (_name, where) =>
        `Search blood donors ${where} by group — A+, B+, O+, O- and the rest — and by upazila. ` +
        "Every donor verified and marked available. Free to contact.",
    keywords: (organization) => [
        `blood donor ${organization.district ?? "Bangladesh"}`,
        `blood donor list ${organization.upazila ?? organization.district ?? "Bangladesh"}`,
        "O negative donor",
        "blood group search",
        "রক্তদাতা তালিকা",
    ],
});

export default function DonorsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
