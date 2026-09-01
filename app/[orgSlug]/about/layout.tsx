import { orgPageMetadata } from "@/lib/seoOrg";

export const generateMetadata = orgPageMetadata({
    path: "/about",
    title: (name) => `About ${name}`,
    description: (name, where) =>
        `${name} is a verified blood bank ${where}. Contact details, coverage area, ` +
        "and how to reach the team.",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return children;
}
