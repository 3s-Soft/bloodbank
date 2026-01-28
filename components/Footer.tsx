"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import Link from "next/link";

export default function Footer() {
    const organization = useOrganization();
    const orgSlug = organization.slug;

    return (
        <footer className="w-full border-t border-neutral-100 bg-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-neutral-900">{organization.name}</h3>
                        <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
                            A community-driven platform aimed at saving lives by connecting blood donors with those in need, quickly and for free.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-neutral-600">
                            <li><Link href={`/${orgSlug}/donors`} className="hover:text-red-600 transition-colors">Find Donors</Link></li>
                            <li><Link href={`/${orgSlug}/requests`} className="hover:text-red-600 transition-colors">Blood Requests</Link></li>
                            <li><Link href={`/${orgSlug}/register`} className="hover:text-red-600 transition-colors">Become a Donor</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">Contact</h4>
                        <p className="text-sm text-neutral-600">
                            {organization.contactEmail || "For emergency support or volunteer inquiries, please contact your local coordinator."}
                        </p>
                        <p className="text-xs text-neutral-400">
                            © {new Date().getFullYear()} {organization.name}. Focused on saving lives.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
