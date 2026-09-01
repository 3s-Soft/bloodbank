import { orgPageMetadata } from "@/lib/seoOrg";

/**
 * A form with nothing to index. Left crawlable (`follow`) so link equity still
 * flows back to the request board it posts to.
 */
export const generateMetadata = orgPageMetadata({
    path: "/requests/new",
    title: (name) => `Post a Blood Request — ${name}`,
    description: (name, where) =>
        `Submit an urgent blood request to donors registered with ${name} ${where}.`,
    noIndex: true,
});

export default function NewRequestLayout({ children }: { children: React.ReactNode }) {
    return children;
}
