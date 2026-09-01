import type { Metadata } from "next";

import LegalPage, { type LegalSection } from "@/components/LegalPage";
import JsonLd from "@/components/JsonLd";
import { BRAND } from "@/lib/config/brand";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
    title: `About ${BRAND.name}`,
    description:
        "A free, non-profit network connecting blood donors and patients across Bangladesh. " +
        `Who runs it, how it works, and why it costs nothing.`,
    path: "/about",
    keywords: [
        "about Bangladesh Blood Bank",
        "free blood donation network",
        "non-profit blood bank Bangladesh",
    ],
});

const sections: LegalSection[] = [
    {
        heading: "The problem",
        body: [
            "When someone needs blood in Bangladesh, the search usually happens over the phone. A family member calls everyone they know, then everyone those people know, while a clock runs. The information that would end that search quickly — who nearby has the right blood group and is willing to give — exists, but it is scattered across notebooks, Facebook groups and individual volunteers' contact lists.",
            "In a city that search sometimes works. In a rural upazila at two in the morning it often does not.",
        ],
    },
    {
        heading: "What we built",
        body: [
            "This platform gathers those scattered lists into one searchable place, organised the way people actually look: by blood group, by district, by upazila.",
            "Each blood bank or donor group on the network keeps its own space — its own donors, its own request board, its own administrators — while a patient can search across the whole thing. A blood bank does not lose control of its community by joining, and a patient does not have to know which group to ask first.",
        ],
        bullets: [
            "A donor directory filterable by blood group and location, with each donor's availability kept current by the donor.",
            "A public request board where anyone can post an urgent need, without creating an account first.",
            "Push notifications that reach matching donors within seconds of an emergency request being posted.",
            "Donation records and a leaderboard, so a regular donor's history is visible and verifiable.",
            "Full Bangla and English throughout.",
        ],
    },
    {
        heading: "It is free, and blood is never sold",
        body: [
            "There is no charge to donors, to patients, or to the blood banks that join. There is no advertising, no premium tier and no data sold to anyone.",
            "Asking for money in exchange for blood or for a donor introduction is the one thing that gets an account removed permanently. Blood in Bangladesh is given, not traded, and a platform that let that slip would do more harm than the problem it set out to solve.",
        ],
    },
    {
        heading: "How organizations join",
        body: [
            "Any blood bank, hospital donor cell, student group or volunteer network can apply. Applications are reviewed by a person before the organization appears publicly, which is what the verified badge means.",
            "Once approved, the organization gets its own address on the platform, a dashboard for managing donors and requests, an audit log of administrator actions, and control over its own branding.",
        ],
    },
    {
        heading: "Who runs it",
        body: [
            `${BRAND.name} is built and maintained by ${BRAND.vendor.name} as a non-profit initiative. The platform is developed in the open, and contributions, bug reports and corrections are welcome.`,
            "It is not affiliated with any government body, and it is not a licensed medical provider. Every donation happens at a hospital or blood bank, under their supervision.",
        ],
    },
];

export default function AboutPage() {
    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: "Home", path: "/" },
                    { name: "About", path: "/about" },
                ])}
            />
            <LegalPage
                eyebrow="About the platform"
                title="Every drop saves a life"
                intro={`${BRAND.name} is a free network that connects people who need blood with people willing to give it — searchable by blood group, district and upazila, across the whole country.`}
                sections={sections}
                footNote={`Want your blood bank on the network? Apply at /organizations/new. Anything else, write to ${BRAND.supportEmail}.`}
            />
        </>
    );
}
