"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { Droplet, Menu, X } from "lucide-react";
import { useState } from "react";
import { useOrganization } from "@/lib/context/OrganizationContext";
import { LanguageToggle } from "./ui/language-toggle";
import { useLanguage } from "@/lib/i18n";

export default function Navbar() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const organization = useOrganization();
    const { t } = useLanguage();

    const orgSlug = organization.slug;
    const primaryColor = organization.primaryColor || "#dc2626";

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href={`/${orgSlug}`} className="flex items-center space-x-3 group">
                    <div className="relative w-10 h-10 overflow-hidden rounded-xl transition-all group-hover:scale-105">
                        <img
                            src="/assets/logo.png"
                            alt="Bangladesh Bloodbank Logo"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {organization.name.split(' ')[0]}<span style={{ color: primaryColor }}>{organization.name.split(' ').slice(1).join(' ')}</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1">
                    <Link
                        href={`/${orgSlug}/donors`}
                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        {t.nav.findDonors}
                    </Link>
                    <Link
                        href={`/${orgSlug}/requests`}
                        className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        {t.nav.bloodRequests}
                    </Link>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

                    {/* Language Toggle */}
                    <LanguageToggle variant="icon" />

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />

                    {session ? (
                        <div className="flex items-center space-x-2">
                            <Link href={`/${orgSlug}/dashboard`}>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                                >
                                    {t.nav.dashboard}
                                </Button>
                            </Link>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => signOut()}
                                className="border-slate-200 dark:border-slate-700"
                            >
                                {t.nav.logout}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                            <Link href={`/login?org=${orgSlug}`}>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-slate-600 dark:text-slate-300"
                                >
                                    {t.nav.login}
                                </Button>
                            </Link>
                            <Link href={`/${orgSlug}/register`}>
                                <Button
                                    size="sm"
                                    style={{ backgroundColor: primaryColor }}
                                    className="text-white hover:opacity-90 shadow-lg"
                                >
                                    {t.nav.becomeDonor}
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-1">
                    <LanguageToggle variant="icon" />
                    <button
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-xl">
                    <Link
                        href={`/${orgSlug}/donors`}
                        className="block px-4 py-3 text-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {t.nav.findDonors}
                    </Link>
                    <Link
                        href={`/${orgSlug}/requests`}
                        className="block px-4 py-3 text-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {t.nav.bloodRequests}
                    </Link>
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col space-y-2">
                        {session ? (
                            <>
                                <Link href={`/${orgSlug}/dashboard`} onClick={() => setIsMenuOpen(false)}>
                                    <Button
                                        className="w-full text-white shadow-lg"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {t.nav.dashboard}
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="w-full border-slate-200 dark:border-slate-700"
                                    onClick={() => signOut()}
                                >
                                    {t.nav.logout}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href={`/login?org=${orgSlug}`} onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="outline" className="w-full border-slate-200 dark:border-slate-700">
                                        {t.nav.login}
                                    </Button>
                                </Link>
                                <Link href={`/${orgSlug}/register`} onClick={() => setIsMenuOpen(false)}>
                                    <Button
                                        className="w-full text-white shadow-lg"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {t.nav.becomeDonor}
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
