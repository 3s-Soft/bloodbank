import { composeTitle } from "@/lib/seo";
import { orgPageMetadata } from "@/lib/seoOrg";

export const generateMetadata = orgPageMetadata({
    path: "/leaderboard",
    title: (name) => composeTitle("Top Blood Donors", name),
    description: (name, where) =>
        `The most active blood donors ${where}, ranked by donations made through ${name}.`,
});

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
    return children;
}
