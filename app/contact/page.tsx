import type { Metadata } from "next";

import LegalPage, { type LegalSection } from "@/components/LegalPage";
import JsonLd from "@/components/JsonLd";
import { BRAND } from "@/lib/config/brand";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
    title: `Contact ${BRAND.name}`,
    description:
        "How to reach the team behind the platform — support, privacy requests, reporting misuse, " +
        "and getting your blood bank listed.",
    path: "/contact",
});

const sections: LegalSection[] = [
    {
        heading: "If you need blood right now",
        body: [
            "Do not wait on an email. Go to the blood bank nearest you on this site, search its donor directory by blood group, and post a request on its request board — that reaches matching donors by push notification within seconds.",
            "Contact a hospital or licensed blood bank directly at the same time. This platform is one route to help, never the only one.",
        ],
    },
    {
        heading: "Reporting misuse",
        body: [
            "Tell us immediately if someone asks you for money in exchange for blood or for a donor's contact details, if a donor's number is being used for anything other than donation, or if you find a request you believe is fake.",
            "Include the organization, the page and, where you can, a screenshot. Reports of paid-blood solicitation are acted on first.",
        ],
    },
    {
        heading: "Getting your blood bank listed",
        body: [
            "Applications go through the form rather than by email, because it collects what the review actually needs. A person reviews each one before the organization appears publicly.",
        ],
    },
    {
        heading: "Response times",
        body: [
            "This is a non-profit project run by a small team, not a staffed support desk. Expect a few days for ordinary questions. Reports of misuse and privacy deletion requests are handled ahead of everything else.",
        ],
    },
];

export default function ContactPage() {
    return (
        <>
            <JsonLd
                data={[
                    breadcrumbJsonLd([
                        { name: "Home", path: "/" },
                        { name: "Contact", path: "/contact" },
                    ]),
                    {
                        "@context": "https://schema.org",
                        "@type": "ContactPage",
                        name: `Contact ${BRAND.name}`,
                        url: absoluteUrl("/contact"),
                        mainEntity: {
                            "@type": "Organization",
                            name: BRAND.name,
                            email: BRAND.supportEmail,
                            contactPoint: [
                                {
                                    "@type": "ContactPoint",
                                    contactType: "customer support",
                                    email: BRAND.supportEmail,
                                    availableLanguage: ["en", "bn"],
                                },
                                {
                                    "@type": "ContactPoint",
                                    contactType: "privacy",
                                    email: BRAND.privacyEmail,
                                    availableLanguage: ["en", "bn"],
                                },
                            ],
                        },
                    },
                ]}
            />
            <LegalPage
                eyebrow="Get in touch"
                title="Contact us"
                intro="Support, privacy requests, reports of misuse, or getting a blood bank onto the network — here is where each of those goes."
                sections={sections}
                links={[
                    {
                        label: BRAND.supportEmail,
                        href: `mailto:${BRAND.supportEmail}`,
                        description:
                            "General questions, problems with the site, and anything about an organization on the network.",
                    },
                    {
                        label: BRAND.privacyEmail,
                        href: `mailto:${BRAND.privacyEmail}`,
                        description:
                            "Deleting your account, correcting your details, or any question about what we hold on you.",
                    },
                    {
                        label: "Apply to list your blood bank",
                        href: "/organizations/new",
                        description:
                            "The application form for a blood bank, hospital donor cell, student group or volunteer network.",
                    },
                    {
                        label: `${BRAND.vendor.name} on GitHub`,
                        href: BRAND.vendor.url,
                        description:
                            "Bug reports, corrections and contributions from developers. The platform is built in the open.",
                    },
                ]}
                footNote="Each blood bank on the network publishes its own phone number and email on its About page — for anything specific to that organization's donors or requests, reach them directly."
            />
        </>
    );
}
