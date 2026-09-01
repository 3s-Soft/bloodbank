import { orgPageMetadata } from "@/lib/seoOrg";

export const generateMetadata = orgPageMetadata({
    path: "/feedback",
    title: (name) => `Send Feedback — ${name}`,
    description: (name) => `Report a problem or suggest an improvement to ${name}.`,
    noIndex: true,
});

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
    return children;
}
