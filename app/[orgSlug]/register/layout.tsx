import { composeTitle } from "@/lib/seo";
import { orgPageMetadata } from "@/lib/seoOrg";

/**
 * Indexable despite being a form: "how to become a blood donor" is a real
 * informational query, and this is the page that answers it.
 */
export const generateMetadata = orgPageMetadata({
    path: "/register",
    title: (name, where) => composeTitle(`Become a Blood Donor ${where}`, name),
    description: (name, where) =>
        `Register as a blood donor with ${name} ${where}. One minute, no cost — and patients ` +
        "searching for your blood group will find you.",
    keywords: (organization) => [
        `become a blood donor ${organization.district ?? "Bangladesh"}`,
        "blood donor registration",
        "রক্তদাতা নিবন্ধন",
    ],
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return children;
}
