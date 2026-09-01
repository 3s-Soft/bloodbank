import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Building2, Droplet, MapPin, Shield } from "lucide-react";

import JsonLd from "@/components/JsonLd";
import { BRAND } from "@/lib/config/brand";
import * as organizationsRepo from "@/lib/repositories/organizations";
import { breadcrumbJsonLd, buildMetadata, itemListJsonLd } from "@/lib/seo";

/**
 * Donor registration is tenant-scoped — `donor_profiles.organization_id` is NOT
 * NULL, so a donor always belongs to one blood bank — which meant `/register`
 * did not exist at all. It fell through to `[orgSlug]`, resolved "register" as
 * a slug, found nothing and 404'd.
 *
 * That is the URL people type, and it is where the "Become a Donor" call to
 * action on the homepage should have pointed (it pointed at `/login`, which is
 * no use to someone without an account). This page is the missing step: pick
 * the blood bank, then register with it.
 */
export const metadata: Metadata = buildMetadata({
    title: "Become a Blood Donor in Bangladesh",
    description:
        "Register as a blood donor in under a minute. Choose your local blood bank, add your blood " +
        "group and district, and patients searching for your group will find you. Free.",
    path: "/register",
    keywords: [
        "become a blood donor",
        "blood donor registration Bangladesh",
        "register as blood donor",
        "রক্তদাতা নিবন্ধন",
    ],
});

// The organization list changes a few times a month and this page is one a
// crawler will fetch often; there is no reason to query MySQL on every hit.
export const revalidate = 300;

export default async function ChooseOrganizationToRegister() {
    const organizations = (await organizationsRepo.listActive()).filter(
        (organization) => organization.isVerified,
    );

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <JsonLd
                data={[
                    breadcrumbJsonLd([
                        { name: "Home", path: "/" },
                        { name: "Become a Donor", path: "/register" },
                    ]),
                    itemListJsonLd(
                        "Blood banks accepting donor registrations",
                        organizations.map((organization) => ({
                            name: organization.name,
                            path: `/${organization.slug}/register`,
                        })),
                    ),
                ]}
            />

            <header className="border-b border-white/5 bg-slate-900/50">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between max-w-5xl">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden">
                            <Image
                                src="/assets/logo-mark.png"
                                alt={`${BRAND.name} logo`}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-lg font-black text-white tracking-tight">
                            Bangladesh <span className="text-red-500">Blood</span>
                            <span className="text-emerald-500"> Bank</span>
                        </span>
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to site
                    </Link>
                </div>
            </header>

            <main className="flex-grow container mx-auto px-4 py-16 md:py-24 max-w-5xl">
                <div className="max-w-2xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                        Step 1 of 2
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mt-6 mb-6 tracking-tight">
                        Become a blood donor
                    </h1>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed">
                        Donors register with a local blood bank, so pick the one nearest you. It takes
                        a minute, it costs nothing, and it puts you on the list patients search when
                        they need your blood group.
                    </p>
                </div>

                {organizations.length > 0 ? (
                    <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {organizations.map((organization) => {
                            const area = [organization.upazila, organization.district]
                                .filter(Boolean)
                                .join(", ");

                            return (
                                <Link
                                    key={organization.id}
                                    href={`/${organization.slug}/register`}
                                    className="group relative rounded-3xl bg-slate-900/50 border border-white/5 p-8 hover:bg-slate-900 hover:border-red-500/20 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-8">
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                            style={{ backgroundColor: `${organization.primaryColor}20` }}
                                        >
                                            <Droplet
                                                className="w-6 h-6"
                                                style={{ color: organization.primaryColor }}
                                            />
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center gap-1.5">
                                            <Shield className="w-3 h-3 text-blue-500" />
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                                Verified
                                            </span>
                                        </div>
                                    </div>

                                    <h2 className="text-xl font-black text-white tracking-tight group-hover:text-red-500 transition-colors">
                                        {organization.name}
                                    </h2>

                                    {area && (
                                        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                                            {area}
                                        </p>
                                    )}

                                    <span className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                                        Register here
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    /* No verified organization has joined yet. Sending someone to a
                       registration form that cannot exist would be worse than saying so. */
                    <div className="mt-16 rounded-3xl border border-dashed border-white/10 p-12 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-6">
                            <Building2 className="w-7 h-7 text-slate-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight mb-3">
                            No blood banks on the network yet
                        </h2>
                        <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
                            Donor registration opens as soon as the first blood bank is verified. If
                            you run one, or know one that should be here, put it forward.
                        </p>
                        <Link
                            href="/organizations/new"
                            className="mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all"
                        >
                            List a blood bank
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                <p className="mt-12 text-sm text-slate-500 font-medium">
                    Run a blood bank that is not listed?{" "}
                    <Link href="/organizations/new" className="text-red-500 font-bold hover:text-red-400">
                        Apply to join the network
                    </Link>
                    .
                </p>
            </main>
        </div>
    );
}
