import { orgPageMetadata } from "@/lib/seoOrg";

// Canonicalises to the platform terms — see the note in ../privacy/layout.tsx.
export const generateMetadata = orgPageMetadata({
    path: "/terms",
    canonicalPath: "/terms",
    title: (name) => `Terms of Service — ${name}`,
    description: (name) => `The terms under which ${name} operates on this platform.`,
});

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
