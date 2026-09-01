import type { Metadata } from "next";

import { getOrganizationBySlug } from "@/lib/orgUtils";
import { breadcrumbJsonLd, buildMetadata, type JsonLd } from "@/lib/seo";

type OrgParams = { params: Promise<{ orgSlug: string }> };

interface OrgPageSeo {
    /** Route suffix under the tenant, e.g. "/donors". Empty for the landing page. */
    path: string;
    /** Receives the organization name and the "in Upazila, District" fragment. */
    title: (name: string, where: string) => string;
    description: (name: string, where: string) => string;
    keywords?: (organization: {
        name: string;
        district: string | null;
        upazila: string | null;
    }) => string[];
    noIndex?: boolean;
}

/**
 * Builds a `generateMetadata` for one page inside a tenant.
 *
 * Every public tenant page needs the same three things — a title that names the
 * organization and its area, a self-referencing canonical, and a noindex when
 * the organization is unverified — and there are nine of them. Writing that out
 * nine times invites the ninth to drift.
 */
export function orgPageMetadata(config: OrgPageSeo) {
    return async function generateMetadata({ params }: OrgParams): Promise<Metadata> {
        const { orgSlug } = await params;
        const organization = await getOrganizationBySlug(orgSlug);

        if (!organization) {
            return { title: "Organization not found", robots: { index: false, follow: false } };
        }

        const area = [organization.upazila, organization.district].filter(Boolean).join(", ");
        const where = area ? `in ${area}` : "in Bangladesh";

        return buildMetadata({
            title: config.title(organization.name, where),
            description: config.description(organization.name, where),
            path: `/${organization.slug}${config.path}`,
            keywords: config.keywords?.(organization),
            noIndex: config.noIndex || !organization.isVerified,
        });
    };
}

/**
 * The breadcrumb trail for a page inside a tenant. Returned as data rather than
 * markup so the caller decides whether to render it — an unverified tenant
 * should emit no structured data at all.
 */
export async function orgBreadcrumb(
    orgSlug: string,
    crumb: { name: string; path: string },
): Promise<JsonLd | null> {
    const organization = await getOrganizationBySlug(orgSlug);
    if (!organization || !organization.isVerified) return null;

    return breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: organization.name, path: `/${organization.slug}` },
        { name: crumb.name, path: `/${organization.slug}${crumb.path}` },
    ]);
}
