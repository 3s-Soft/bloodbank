import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrganizationBySlug } from "@/lib/orgUtils";
import { OrganizationProvider } from "@/lib/context/OrganizationContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import {
    breadcrumbJsonLd,
    buildMetadata,
    composeTitle,
    medicalOrganizationJsonLd,
} from "@/lib/seo";

/**
 * Per-tenant metadata.
 *
 * Every organization used to inherit the platform title, so a hundred tenants
 * shipped a hundred pages titled "Bangladesh Bloodbank - Every Drop Saves a
 * Life". The searches this platform can actually win are local — "blood donor
 * in Savar", "ব্লাড ব্যাংক সাভার" — so the district and upazila go in the title
 * and description, which is the only place a crawler sees them before the
 * client components hydrate.
 */
export async function generateMetadata({
    params,
}: {
    params: Promise<{ orgSlug: string }>;
}): Promise<Metadata> {
    const { orgSlug } = await params;
    const organization = await getOrganizationBySlug(orgSlug);

    if (!organization) {
        // The layout below calls notFound(); metadata for a page that will 404
        // only needs to avoid being indexed.
        return { title: "Organization not found", robots: { index: false, follow: false } };
    }

    const area = [organization.upazila, organization.district].filter(Boolean).join(", ");
    const where = area ? ` in ${area}` : " in Bangladesh";

    // The title uses the district alone, not the full upazila+district pair the
    // description carries: on a tenant with a long name the pair pushed the
    // title past the width a search result renders, and the district is the
    // half people actually type.
    const titleArea = organization.district ?? "Bangladesh";

    return buildMetadata({
        title: composeTitle(organization.name, `Blood Donors in ${titleArea}`),
        description:
            `Verified blood donors at ${organization.name}${where}. Search by blood group, ` +
            "post an emergency request, or register — free.",
        path: `/${organization.slug}`,
        keywords: [
            `blood bank ${organization.district ?? "Bangladesh"}`,
            `blood donor ${organization.upazila ?? organization.district ?? "Bangladesh"}`,
            organization.name,
            "emergency blood request",
        ],
        // An organization awaiting review should not be advertised in search
        // before a human has approved it — the same rule the sitemap applies.
        noIndex: !organization.isVerified,
    });
}

export default async function OrganizationLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ orgSlug: string }>;
}) {
    const { orgSlug } = await params;
    const organization = await getOrganizationBySlug(orgSlug);

    if (!organization) {
        notFound();
    }

    const orgData = {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        primaryColor: organization.primaryColor,
        contactEmail: organization.contactEmail,
        contactPhone: organization.contactPhone,
        address: organization.address,
        isVerified: organization.isVerified,
    };

    return (
        <OrganizationProvider value={orgData}>
            {organization.isVerified && (
                <JsonLd
                    data={[
                        medicalOrganizationJsonLd(organization),
                        breadcrumbJsonLd([
                            { name: "Home", path: "/" },
                            { name: organization.name, path: `/${organization.slug}` },
                        ]),
                    ]}
                />
            )}
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </OrganizationProvider>
    );
}
