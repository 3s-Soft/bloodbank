import type { Metadata } from "next";

import LegalPage, { type LegalSection } from "@/components/LegalPage";
import JsonLd from "@/components/JsonLd";
import { BRAND } from "@/lib/config/brand";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
    title: "Privacy Policy",
    description:
        `What ${BRAND.name} collects from donors and patients, who can see it, how long it is kept, ` +
        "and how to have it removed.",
    path: "/privacy",
});

/**
 * Written against what the application actually does, not against a template:
 * the fields listed below are the columns in `donor_profiles`, `users` and
 * `blood_requests`, and the third parties named are the only ones the app talks
 * to. If a schema column or an integration is added, this page is part of that
 * change.
 */
const sections: LegalSection[] = [
    {
        heading: "What we collect",
        body: [
            "We collect only what is needed to put a patient in touch with someone who can donate to them. There is no advertising on this platform and no profile is built for any purpose beyond that.",
        ],
        bullets: [
            "Account details: your name, and a phone number or email address. If you sign in with Google we receive your name, email address and profile picture from Google.",
            "Donor details: blood group, district, upazila and village, your last donation date, your donation history on this platform, and whether you have marked yourself available.",
            "Blood requests: the patient name, blood group, location, urgency, required date and contact number entered on the request, plus any notes added to it.",
            "Notification tokens: if you allow browser notifications, a Firebase Cloud Messaging token so urgent requests matching your blood group and district can reach you.",
            "Nothing else. We do not collect your precise location, we do not track you across other websites, and we run no advertising or analytics trackers.",
        ],
    },
    {
        heading: "Who can see it",
        body: [
            "This platform is organised into separate organizations, and your data stays inside the one you registered with. An administrator of one blood bank cannot see the donors or requests of another.",
        ],
        bullets: [
            "Administrators of the organization you registered with can see your donor profile, including your contact number, so they can reach you about a matching request.",
            "Visitors to your organization's donor directory can see donors listed there. Individual donor profile pages are excluded from search engines, so your name and number are not indexed by Google.",
            "Anyone viewing a blood request sees the contact number entered on that request. Do not post a number you are unwilling to be called on.",
            "We do not sell personal data, and we do not share it with advertisers or data brokers. There is no such arrangement and there will not be one.",
        ],
    },
    {
        heading: "Where it is stored, and how",
        body: [
            "Data is held in a MySQL database and reached over an encrypted connection. Passwords are never stored as text — they are hashed with bcrypt, which means nobody, including us, can read your password back out of the database.",
            "The application runs on Vercel and the database is hosted on shared hosting infrastructure. Both are outside Bangladesh, so your information is processed abroad.",
        ],
    },
    {
        heading: "Third parties",
        body: [
            "The platform talks to a small, fixed set of services, and only for the purposes below.",
        ],
        bullets: [
            "Google — sign-in, if you choose to use it. Google's own privacy policy governs what Google does with that.",
            "Firebase Cloud Messaging — delivering push notifications about urgent requests to browsers that opted in.",
            "Vercel and our database host — running the application and storing its data.",
        ],
    },
    {
        heading: "How long we keep it",
        body: [
            "Your donor profile is kept for as long as you want to be reachable as a donor. Blood requests and donation records are kept as the organization's own record of what happened, since a donation history is what makes a donor verifiable to the next patient.",
            "Ask us to delete your account and we will remove your profile and contact details. Donation records may be retained without your name attached, so the organization's totals stay correct.",
        ],
    },
    {
        heading: "Your rights",
        body: [
            "You can see, correct or remove what we hold about you.",
        ],
        bullets: [
            "Mark yourself unavailable at any time from your profile, which takes you out of matching without deleting anything.",
            "Ask your organization's administrator to correct any detail on your profile.",
            `Ask for your account and personal details to be deleted, by writing to ${BRAND.privacyEmail}.`,
            "Turn off push notifications in your browser settings, or by revoking the permission for this site.",
        ],
    },
    {
        heading: "Children",
        body: [
            "This platform is not intended for children. Blood donation has minimum age requirements set by medical guidance and by the collecting organization, and registration should be made by someone who meets them. If you believe a child has registered, tell us and we will remove the profile.",
        ],
    },
    {
        heading: "Changes to this policy",
        body: [
            "If we change what we collect or who can see it, this page changes with it and the date at the top moves. Material changes will also be announced on the platform rather than made quietly.",
        ],
    },
];

export default function PlatformPrivacyPolicy() {
    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: "Home", path: "/" },
                    { name: "Privacy Policy", path: "/privacy" },
                ])}
            />
            <LegalPage
                title="Privacy Policy"
                intro={`${BRAND.name} asks people for their name, their phone number and their blood group at the moment someone else urgently needs it. This page says exactly what happens to that information.`}
                sections={sections}
                footNote={`Questions about anything on this page can go to ${BRAND.privacyEmail}. Individual blood banks on this platform may publish their own supplementary policy; where the two differ, this one describes what the platform itself does.`}
            />
        </>
    );
}
