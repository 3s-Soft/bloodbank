import { orgPageMetadata } from "@/lib/seoOrg";

// Identical for every tenant — see the note in ../privacy/layout.tsx.
export const generateMetadata = orgPageMetadata({
    path: "/terms",
    title: (name) => `Terms of Service — ${name}`,
    description: (name) => `The terms under which ${name} operates on this platform.`,
    noIndex: true,
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
