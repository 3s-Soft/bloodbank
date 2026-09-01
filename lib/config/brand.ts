/**
 * Brand constants.
 *
 * The platform name had drifted into three spellings — "Rural Blood Bank" in
 * the admin footer and the README, "Bangladesh Bloodbank" in the i18n strings
 * and the tenant footer, "Bangladesh BloodBank" in the documentation — which is
 * both a trust problem for a site asking strangers for their phone number and a
 * brand-signal problem for search. One constant, imported everywhere.
 */

export const BRAND = {
    /** The full name, as it should appear in prose and in a page title. */
    name: "Bangladesh Blood Bank",
    /** For tight spaces: the PWA short name, the navbar wordmark. */
    shortName: "BloodBank",
    /** Straight from the logo lockup. */
    tagline: "Donate Blood • Save Life",

    /**
     * Who builds and runs the platform. Rendered in every footer.
     */
    vendor: {
        name: "3s-Soft",
        url: "https://github.com/3s-Soft",
    },

    /**
     * Platform-level contact, distinct from a tenant's own contactEmail.
     *
     * ASSUMPTION: a mailbox on the domain the site already runs on. If support
     * is handled somewhere else, this is the one line to change — the legal
     * pages and the contact page all read it from here.
     */
    supportEmail: "support@blood.3s-soft.net",
    privacyEmail: "privacy@blood.3s-soft.net",

    /**
     * The date the legal pages were last substantively changed. Shown on each
     * of them, because a policy without a date tells a reader nothing about
     * whether it still describes the service.
     */
    policiesUpdated: "2 September 2026",
} as const;
