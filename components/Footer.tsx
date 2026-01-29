"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function Footer() {
    const organization = useOrganization();
    const orgSlug = organization.slug;
    const { t } = useLanguage();

    return (
        <footer className="w-full border-t border-slate-800 bg-slate-900 py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    <div className="space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden grayscale opacity-50">
                                <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">{organization.name}</h3>
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                            {t.footer.nonprofit}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Quick Links</h4>
                        <ul className="space-y-3 text-sm font-medium">
                            <li><Link href={`/${orgSlug}/donors`} className="text-slate-400 hover:text-white transition-colors">{t.nav.findDonors}</Link></li>
                            <li><Link href={`/${orgSlug}/requests`} className="text-slate-400 hover:text-white transition-colors">{t.nav.bloodRequests}</Link></li>
                            <li><Link href={`/${orgSlug}/register`} className="text-slate-400 hover:text-white transition-colors">{t.register.title}</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Platform</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            {organization.contactEmail || "Connecting life-savers across Bangladesh."}
                        </p>
                        <div className="pt-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                            Powered by Bangladesh Bloodbank
                        </div>
                    </div>
                </div>

                <div className="pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-slate-500 font-medium">
                        © {new Date().getFullYear()} {organization.name}. {t.footer.allRightsReserved}.
                    </p>
                    <div className="flex space-x-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <Link href="#" className="hover:text-white transition-colors">{t.footer.privacyPolicy}</Link>
                        <Link href="#" className="hover:text-white transition-colors">{t.footer.termsOfService}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
