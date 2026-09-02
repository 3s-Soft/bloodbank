import type { Metadata } from "next";

import LegalPage, { type LegalSection } from "@/components/LegalPage";
import JsonLd from "@/components/JsonLd";
import { BRAND } from "@/lib/config/brand";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
    title: "Terms of Service",
    description:
        `The terms for using ${BRAND.name}: what the platform does, what it does not do, ` +
        "and the rules for donors, patients and blood banks.",
    path: "/terms",
});

const sections: LegalSection[] = [
    {
        heading: "What this platform is",
        body: [
            `${BRAND.name} is a free directory that helps someone who needs blood find someone willing to give it. It is run as a non-profit initiative and there is no charge to any donor, patient or organization.`,
            "We are not a hospital, a clinic, a laboratory or a licensed blood collection service. We do not collect, test, screen, store or transport blood. Every actual donation happens between you and a medical facility, under their supervision and their rules.",
        ],
    },
    {
        heading: "Blood is never for sale here",
        body: [
            "Nobody may ask for money in exchange for blood or for a donor introduction on this platform. This is the rule we enforce most strictly.",
            "Any user or organization found soliciting a fee for blood or for access to donors will be removed permanently, and where the conduct appears unlawful it will be reported to the relevant authorities.",
        ],
    },
    {
        heading: "What we cannot promise",
        body: [
            "Donor listings are entered by donors themselves and are only as current as the last time that person updated them. A donor shown as available may be unreachable, ineligible on the day, or no longer a match.",
            "Treat this platform as one way to find help, never as your only one. In an emergency, contact a hospital or a licensed blood bank directly and in parallel. We cannot guarantee that any request will be answered, or answered in time.",
            "We also do not verify anyone's medical fitness to donate. Eligibility, screening and testing are decided by the medical facility performing the donation.",
        ],
    },
    {
        heading: "Your responsibilities",
        body: [
            "Using the platform means agreeing to the following.",
        ],
        bullets: [
            "Give accurate information. A wrong blood group on a donor profile or a blood request is dangerous, not merely untidy.",
            "Keep your own profile current, and mark yourself unavailable when you cannot donate.",
            "Contact donors only about donation. Using a number from this platform for marketing, harassment, or anything unrelated is a misuse of it.",
            "Do not scrape, bulk-download or republish the donor directory. It exists so a patient can find a donor, not so anyone can build a contact list.",
            "Do not create false blood requests, impersonate another person, or register on someone's behalf without their knowledge.",
            "Keep your password to yourself. Activity under your account is treated as yours.",
        ],
    },
    {
        heading: "For organizations on the platform",
        body: [
            "A blood bank or donor group applying to join is reviewed by a human before it is marked verified and shown publicly. Verification means we checked that the organization appears to be genuine — it is not an endorsement of their medical practice.",
            "An organization administrator can see the donors and requests belonging to their own organization only, and is responsible for handling that information carefully and lawfully. Misuse of donor contact details ends the organization's access.",
        ],
    },
    {
        heading: "Suspension and removal",
        body: [
            "We may remove a profile, a request or an entire organization that breaks these terms, that endangers users, or that appears fraudulent. Where circumstances allow we will say why; where a delay would put someone at risk, we will act first.",
            "You can stop using the platform at any time and ask for your account to be deleted.",
        ],
    },
    {
        heading: "Liability",
        body: [
            "The platform is provided as it is. To the extent the law allows, we are not liable for what happens between users who found each other through it, for the accuracy of anything a user entered, or for a request that goes unanswered.",
            "Nothing here limits liability that cannot lawfully be limited.",
        ],
    },
    {
        heading: "Changes and governing law",
        body: [
            "These terms may change as the platform does; the date at the top shows when they last did. Continuing to use the platform after a change means accepting it.",
            "These terms are governed by the laws of Bangladesh.",
        ],
    },
];

export default function PlatformTerms() {
    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: "Home", path: "/" },
                    { name: "Terms of Service", path: "/terms" },
                ])}
            />
            <LegalPage
                title="Terms of Service"
                intro={`The short version: ${BRAND.name} is free, blood is never sold through it, and it is a directory rather than a medical service. The rest of this page is the detail.`}
                sections={sections}
                footNote={`Questions about these terms can go to ${BRAND.supportEmail}.`}
            />
        </>
    );
}
