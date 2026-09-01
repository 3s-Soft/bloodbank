"use client";

import { usePathname } from "next/navigation";
import { Building2, Droplet, Home, Users } from "lucide-react";

import { ErrorSurface } from "@/components/ErrorSurface";

/**
 * The application's only 404.
 *
 * A nested `app/[orgSlug]/not-found.tsx` looks like the natural place for the
 * organization-specific copy, but it never renders: an unmatched URL falls to
 * the root boundary, and `app/[orgSlug]/layout.tsx` calling `notFound()` for an
 * unknown slug escalates above the segment that threw. So the routing decision
 * is made here, from the path.
 */

/** Top-level paths that are real routes rather than organization slugs. */
const SYSTEM_SEGMENTS = new Set(["login", "docs", "admin", "organizations", "api"]);

/**
 * Whether a path segment could be an organization slug at all.
 *
 * Matching the pattern `slugSchema` enforces on real slugs, rather than
 * maintaining a blocklist of everything else. A blocklist misses the requests
 * that actually arrive most often: crawlers and browsers ask for /robots.txt,
 * /sitemap.xml, /favicon.ico and /.well-known/*, none of which are served here,
 * and telling a crawler that "nothing is registered under robots.txt" is
 * nonsense. Every one of those fails this test on the dot or the leading dot.
 */
function couldBeOrgSlug(segment: string | undefined): segment is string {
    if (!segment || segment.length < 2) return false;
    if (SYSTEM_SEGMENTS.has(segment)) return false;
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(segment);
}

export default function NotFound() {
    // `usePathname` can be null while this is rendered on the server, which is
    // how the page reaches crawlers and anyone without JavaScript. Falling back
    // to the generic variant means the markup is never empty; hydration then
    // swaps in the organization-specific wording where it applies.
    const pathname = usePathname() ?? "";
    const segments = pathname.split("/").filter(Boolean);
    const [first, ...rest] = segments;

    // `[orgSlug]` matches every single-segment path, so an unknown one shaped
    // like a slug can only be an organization that does not exist.
    const unknownOrganization = segments.length === 1 && couldBeOrgSlug(first);

    if (unknownOrganization) {
        return (
            <ErrorSurface
                code="404"
                title="No blood bank at this address."
                description={`Nothing is registered under "${first}". It may have been renamed, or it may not be active yet.`}
                actions={[
                    {
                        href: "/#organizations",
                        label: "Browse organizations",
                        hint: "Every verified blood bank on the platform",
                        icon: Building2,
                        primary: true,
                    },
                    {
                        href: "/",
                        label: "Home",
                        hint: "Search by district",
                        icon: Home,
                    },
                    {
                        href: "/organizations/new",
                        label: "Register this organization",
                        hint: "Claim the name and start accepting donors",
                        icon: Droplet,
                    },
                ]}
            />
        );
    }

    // Inside a known organization, its own pages are the useful destinations.
    if (rest.length > 0 && couldBeOrgSlug(first)) {
        return (
            <ErrorSurface
                code="404"
                title="That page does not exist."
                description="The organization is here, but this address is not. These are its working pages."
                actions={[
                    {
                        href: `/${first}/donors`,
                        label: "Find donors",
                        hint: "Search by blood group and area",
                        icon: Users,
                        primary: true,
                    },
                    {
                        href: `/${first}/requests/new`,
                        label: "Post a blood request",
                        hint: "Reach available donors nearby",
                        icon: Droplet,
                    },
                    {
                        href: `/${first}`,
                        label: "Organization home",
                        hint: "Back to the main page",
                        icon: Home,
                    },
                ]}
            />
        );
    }

    return (
        <ErrorSurface
            code="404"
            title="That page does not exist."
            description="The link may be out of date, or the address may have a typo. Everything below still works."
            actions={[
                {
                    href: "/",
                    label: "Home",
                    hint: "Find a blood bank near you",
                    icon: Home,
                    primary: true,
                },
                {
                    href: "/#organizations",
                    label: "Browse organizations",
                    hint: "Every verified blood bank on the platform",
                    icon: Building2,
                },
            ]}
        />
    );
}
