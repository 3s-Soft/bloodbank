import { notFound } from "next/navigation";
import { getOrganizationBySlug } from "@/lib/orgUtils";
import { OrganizationProvider } from "@/lib/context/OrganizationContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default async function OrganizationLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { orgSlug: string };
}) {
    const { orgSlug } = params;
    const organization = await getOrganizationBySlug(orgSlug);

    if (!organization) {
        notFound();
    }

    const orgData = {
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        primaryColor: organization.primaryColor,
    };

    return (
        <OrganizationProvider value={orgData}>
            <Navbar />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </OrganizationProvider>
    );
}
