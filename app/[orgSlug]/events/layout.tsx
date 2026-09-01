import { composeTitle } from "@/lib/seo";
import { orgPageMetadata } from "@/lib/seoOrg";

export const generateMetadata = orgPageMetadata({
    path: "/events",
    title: (name, where) => composeTitle(`Blood Donation Camps ${where}`, name),
    description: (name, where) =>
        `Upcoming blood donation camps and drives ${where} — dates, venues and contact numbers, ` +
        `organised by ${name}.`,
    keywords: (organization) => [
        `blood donation camp ${organization.district ?? "Bangladesh"}`,
        "blood drive near me",
        "রক্তদান কর্মসূচি",
    ],
});

export default function EventsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
