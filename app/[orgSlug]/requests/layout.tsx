import { composeTitle } from "@/lib/seo";
import { orgPageMetadata } from "@/lib/seoOrg";

export const generateMetadata = orgPageMetadata({
    path: "/requests",
    title: (name, where) => composeTitle(`Live Blood Requests ${where}`, name),
    description: (_name, where) =>
        `Open and emergency blood requests ${where}, by blood group and urgency. ` +
        "Answer one or post your own — free, no account needed to ask.",
    keywords: (organization) => [
        `emergency blood request ${organization.district ?? "Bangladesh"}`,
        "blood needed",
        "urgent blood donor",
        "জরুরি রক্ত প্রয়োজন",
    ],
});

export default function RequestsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
