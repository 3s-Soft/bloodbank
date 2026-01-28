"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { Droplet, Menu, X, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useOrganization } from "@/lib/context/OrganizationContext";

export default function Navbar() {
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const organization = useOrganization();

    const orgSlug = organization.slug;
    const primaryColor = organization.primaryColor || "#D32F2F";

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-neutral-100 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href={`/${orgSlug}`} className="flex items-center space-x-2 group">
                    <div className="bg-red-50 p-1.5 rounded-lg group-hover:bg-red-100 transition-colors" style={{ backgroundColor: `${primaryColor}10` }}>
                        <Droplet className="w-6 h-6 fill-current" style={{ color: primaryColor }} />
                    </div>
                    <span className="text-xl font-bold text-neutral-900 tracking-tight">
                        {organization.name.split(' ')[0]}<span style={{ color: primaryColor }}>{organization.name.split(' ').slice(1).join(' ')}</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link href={`/${orgSlug}/donors`} className="text-sm font-medium text-neutral-600 hover:text-red-600 transition-colors">
                        Find Donors
                    </Link>
                    <Link href={`/${orgSlug}/requests`} className="text-sm font-medium text-neutral-600 hover:text-red-600 transition-colors">
                        Blood Requests
                    </Link>
                    {session ? (
                        <div className="flex items-center space-x-4">
                            <Link href={`/${orgSlug}/dashboard`} className="text-sm font-medium text-neutral-600 hover:text-red-600 transition-colors">
                                Dashboard
                            </Link>
                            <Button size="sm" variant="ghost" onClick={() => signOut()}>
                                Logout
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link href={`/login?org=${orgSlug}`}>
                                <Button size="sm" variant="ghost">Login</Button>
                            </Link>
                            <Link href={`/${orgSlug}/register`}>
                                <Button size="sm" style={{ backgroundColor: primaryColor }} className="text-white hover:opacity-90">Become a Donor</Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-neutral-600"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-neutral-100 p-4 space-y-4 shadow-lg animate-in fade-in slide-in-from-top-2">
                    <Link
                        href={`/${orgSlug}/donors`}
                        className="block text-lg font-medium text-neutral-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Find Donors
                    </Link>
                    <Link
                        href={`/${orgSlug}/requests`}
                        className="block text-lg font-medium text-neutral-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Blood Requests
                    </Link>
                    <div className="pt-4 border-t border-neutral-100 flex flex-col space-y-3">
                        {session ? (
                            <>
                                <Link href={`/${orgSlug}/dashboard`} onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full text-white" style={{ backgroundColor: primaryColor }}>Dashboard</Button>
                                </Link>
                                <Button variant="ghost" className="w-full" onClick={() => signOut()}>
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href={`/login?org=${orgSlug}`} onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="outline" className="w-full">Login</Button>
                                </Link>
                                <Link href={`/${orgSlug}/register`} onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full text-white" style={{ backgroundColor: primaryColor }}>Become a Donor</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
