import type { Metadata } from "next";

import LegalPage, { type LegalSection } from "@/components/LegalPage";
import JsonLd from "@/components/JsonLd";
import { BRAND } from "@/lib/config/brand";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
    title: "Cookie Policy",
    description:
        `${BRAND.name} sets one sign-in cookie and stores your language and theme choice in your browser. ` +
        "No advertising or tracking cookies.",
    path: "/cookies",
});

/**
 * This page is short because the app genuinely stores very little: a NextAuth
 * session cookie, two `localStorage` keys set by the language and theme
 * providers, and an FCM token for anyone who opted into notifications. There is
 * no analytics or advertising script anywhere in the codebase, and the CSP in
 * `next.config.ts` would block one if it were added without a deliberate
 * change.
 */
const sections: LegalSection[] = [
    {
        heading: "The one cookie we set",
        body: [
            "Signing in sets a session cookie. It is what keeps you signed in as you move between pages, and it is strictly necessary — without it there is no way to stay logged in. It is removed when you sign out.",
            "Browsing the public parts of the site — the donor directories, blood requests, events — sets no cookie at all. You do not need an account to look, and we do not make you accept anything to do it.",
        ],
    },
    {
        heading: "What we keep in your browser instead",
        body: [
            "Two small preferences are stored in your browser's local storage rather than in a cookie. They never leave your device and are never sent to us.",
        ],
        bullets: [
            "Your language choice, English or বাংলা, so the site opens in the language you picked last time.",
            "Your display preference, so the interface looks the same on your next visit.",
            "If you allowed notifications, the browser also holds a Firebase Cloud Messaging token so urgent requests can reach you. Revoking the notification permission for this site removes it.",
        ],
    },
    {
        heading: "What we do not set",
        body: [
            "There are no advertising cookies, no analytics cookies, no third-party trackers and no cross-site profiling on this platform. We do not use Google Analytics, advertising pixels, or any similar service.",
            "That is also why you are not being shown a cookie consent banner: there is nothing here to consent to beyond what is required to sign you in.",
        ],
    },
    {
        heading: "Controlling this",
        body: [
            "You can clear cookies and site data for this domain from your browser's settings at any time. Doing so signs you out and resets your language and display preferences; nothing else is affected, and your donor profile is unchanged.",
            "Blocking cookies entirely still lets you browse donors, requests and events. It only prevents signing in.",
        ],
    },
];

export default function CookiePolicy() {
    return (
        <>
            <JsonLd
                data={breadcrumbJsonLd([
                    { name: "Home", path: "/" },
                    { name: "Cookie Policy", path: "/cookies" },
                ])}
            />
            <LegalPage
                title="Cookie Policy"
                intro="This is a short page because there is not much to say: one cookie to keep you signed in, two preferences saved in your own browser, and no tracking of any kind."
                sections={sections}
                footNote={`This page sits alongside our Privacy Policy, which covers everything we hold on our own servers rather than in your browser. Questions can go to ${BRAND.privacyEmail}.`}
            />
        </>
    );
}
