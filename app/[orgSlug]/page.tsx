"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Droplet,
    Search,
    Users,
    Heart,
    Share2,
    Zap,
    ShieldCheck,
    ArrowRight,
    MapPin,
    Calendar,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

export default function OrganizationLanding() {
    const organization = useOrganization();
    const orgSlug = organization.slug;
    const primaryColor = organization.primaryColor || "#dc2626";
    const { t } = useLanguage();

    const [stats, setStats] = useState<any>({
        donorsCount: "1.2k+",
        livesHelped: "800+",
        activeRequests: "12",
        villagesCovered: "45"
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/org/stats?orgSlug=${orgSlug}`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };
        fetchStats();
    }, [orgSlug]);

    return (
        <div className="flex flex-col bg-slate-950">
            {/* Hero Section - High Impact Dark Theme */}
            <section className="relative min-h-[90vh] flex items-center pt-20 pb-16 overflow-hidden">
                {/* Background Hero Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/assets/hero.png"
                        alt="Background"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Zap className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                                Powered by Bangladesh Bloodbank Ecosystem
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black text-white leading-[1.1] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                            {organization.name.split(' ')[0]} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-600">
                                {organization.name.split(' ').slice(1).join(' ')}
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                            Welcome to the official portal of <span className="font-bold text-white">{organization.name}</span>.
                            Connect with verified donors in your community in seconds, completely for free.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
                            <Link href={`/${orgSlug}/requests/new`} className="flex-1 sm:flex-none">
                                <Button
                                    size="lg"
                                    className="w-full sm:px-10 h-16 text-lg font-bold text-white shadow-2xl hover:scale-105 active:scale-95 transition-all"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Need Blood? Request Now
                                </Button>
                            </Link>
                            <Link href={`/${orgSlug}/register`} className="flex-1 sm:flex-none">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:px-10 h-16 text-lg font-bold border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all"
                                >
                                    Become a Donor
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Floating Elements on desktop */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden xl:block animate-in fade-in slide-in-from-right-20 duration-1000 delay-500">
                    <div className="relative mr-20">
                        {/* Mockup or Premium Card */}
                        <div className="w-[450px] p-6 rounded-[2rem] bg-slate-900/40 backdrop-blur-2xl border border-white/10 shadow-3xl rotate-3">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-white font-bold">Verified Network</div>
                                    <div className="text-slate-400 text-sm">4.8k+ Trusted Donors</div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-24 w-full rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
                                <div className="h-10 w-2/3 rounded-xl bg-white/5 border border-white/5" />
                            </div>
                        </div>
                        {/* Small overlap floating card */}
                        <div className="absolute -left-12 bottom-12 w-48 p-4 rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl -rotate-6">
                            <div className="text-red-400 font-black text-2xl mb-1">O+</div>
                            <div className="text-white text-xs font-bold uppercase tracking-wider">Urgent Request</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section with Glassmorphism */}
            <section className="py-20 relative z-10 bg-slate-900">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {[
                            { label: "Donors Ready", value: stats.donorsCount, icon: Users, color: "text-blue-400" },
                            { label: "Lives Helped", value: stats.livesHelped, icon: Heart, color: "text-rose-400" },
                            { label: "Active Requests", value: stats.activeRequests, icon: Droplet, color: "text-red-500" },
                            { label: "Villages Covered", value: stats.villagesCovered, icon: Share2, color: "text-emerald-400" },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className="group relative p-8 rounded-3xl bg-slate-950/50 border border-slate-800 hover:border-red-500/30 transition-all hover:-translate-y-2 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className={`p-4 rounded-2xl mb-6 w-fit bg-slate-900 group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                </div>
                                <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                                <div className="text-slate-400 font-semibold uppercase tracking-wider text-xs">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Community Impact Section */}
            <section className="py-24 bg-slate-950 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="relative rounded-[2.5rem] overflow-hidden shadow-3xl border border-white/5 group">
                                <img
                                    src="/assets/community.png"
                                    alt="Community Impact"
                                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
                                Building a <span className="text-red-500">Stronger Community</span> Together
                            </h2>
                            <p className="text-lg text-slate-400 mb-10 leading-relaxed italic border-l-4 border-red-500 pl-6">
                                "The best way to find yourself is to lose yourself in the service of others.
                                Bangladesh Bloodbank isn't just a platform; it's a lifeline for thousands."
                            </p>
                            <div className="space-y-6">
                                {[
                                    { title: "Localized Search", description: "Filter by District and Upazila to find donors right in your neighborhood." },
                                    { title: "Direct Contact", description: "No middleman. Call donors directly from the platform for immediate help." },
                                    { title: "Privacy First", description: "Your data is secure and used only for donation-related matching." }
                                ].map((feature, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mt-1">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white mb-1">{feature.title}</h4>
                                            <p className="text-slate-400 text-sm">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Search CTA with Gradient Mesh */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(220,38,38,0.3),transparent)]" />
                <div className="container mx-auto px-4 relative z-10">
                    <div
                        className="rounded-[3rem] p-8 md:p-20 text-center text-white relative overflow-hidden bg-slate-900 border border-white/10 shadow-3xl"
                    >
                        {/* Background glow wrap */}
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-500/20 blur-[100px]" />
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-red-600/20 blur-[100px]" />

                        <h2 className="text-4xl md:text-6xl font-black mb-8">Ready to Save a Life?</h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Join thousands of heroes already registered with Bangladesh Bloodbank.
                            Your one donation can save up to three lives.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <Link href={`/${orgSlug}/donors`}>
                                <Button size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl bg-white text-slate-950 hover:bg-slate-200 font-black text-lg transition-all">
                                    <Search className="w-5 h-5 mr-3" />
                                    Explore Donors
                                </Button>
                            </Link>
                            <Link href={`/${orgSlug}/requests/new`}>
                                <Button size="lg" className="w-full sm:w-auto h-16 px-10 rounded-2xl border-white/20 hover:bg-white/10 font-bold" variant="outline">
                                    Post a Request
                                    <ArrowRight className="w-5 h-5 ml-3" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer Placeholder for visual flow */}
            <footer className="py-12 border-t border-white/5 bg-slate-950">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg overflow-hidden grayscale group-hover:grayscale-0 transition-all">
                                <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-slate-400 font-bold text-lg">{organization.name}</span>
                        </div>
                        <div className="text-xs text-slate-600 uppercase tracking-widest font-bold">
                            Powered by <span className="text-slate-500">Bangladesh Bloodbank</span>
                        </div>
                    </div>
                    <p className="text-slate-700 text-xs text-center mx-auto">© 2026 A non-profit collective initiative. Connect, Donate, Save.</p>
                </div>
            </footer>
        </div>
    );
}
