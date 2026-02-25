"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import {
    Droplet,
    Search,
    Users,
    Heart,
    ShieldCheck,
    ArrowRight,
    Trophy,
    Calendar,
    Clock,
    Phone,
    Zap,
    CheckCircle,
    MessageSquare,
    ChevronRight,
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
        donorsCount: "—",
        livesHelped: "—",
        activeRequests: "—",
        villagesCovered: "—",
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

    const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    return (
        <div className="flex flex-col bg-slate-950">
            {/* ===== HERO SECTION ===== */}
            <section className="relative min-h-[92vh] flex items-center pt-20 pb-16 overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 z-0">
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{
                            backgroundImage: `
                                radial-gradient(ellipse 80% 60% at 20% 40%, ${primaryColor}44, transparent),
                                radial-gradient(ellipse 60% 50% at 80% 70%, #7c3aed33, transparent),
                                radial-gradient(ellipse 50% 40% at 50% 10%, ${primaryColor}22, transparent)
                            `,
                        }}
                    />
                    {/* Grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                            backgroundSize: "60px 60px",
                        }}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 to-transparent" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Content */}
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full mb-8">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                                    Live Platform • Always Free
                                </span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6">
                                Every Drop{" "}
                                <span
                                    className="text-transparent bg-clip-text"
                                    style={{
                                        backgroundImage: `linear-gradient(135deg, ${primaryColor}, #f97316)`,
                                        WebkitBackgroundClip: "text",
                                    }}
                                >
                                    Saves
                                </span>
                                <br />
                                a Life
                            </h1>

                            <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed max-w-xl">
                                {organization.name} connects verified blood donors with patients in need.
                                Find donors instantly, request blood in seconds — all completely free.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link href={`/${orgSlug}/requests/new`}>
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto px-8 h-14 text-base font-bold text-white shadow-2xl hover:shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-2xl"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <Droplet className="w-5 h-5 mr-2" />
                                        Request Blood Now
                                    </Button>
                                </Link>
                                <Link href={`/${orgSlug}/donors`}>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full sm:w-auto px-8 h-14 text-base font-bold border-white/15 text-white hover:bg-white/5 rounded-2xl transition-all"
                                    >
                                        <Search className="w-5 h-5 mr-2" />
                                        Find Donors
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust indicators */}
                            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span className="text-xs text-slate-500 font-bold">Verified Donors</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs text-slate-500 font-bold">24/7 Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-red-400" />
                                    <span className="text-xs text-slate-500 font-bold">100% Free</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Blood Group Quick Access */}
                        <div className="hidden lg:block">
                            <div className="relative">
                                <div className="relative p-8 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl">
                                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">
                                        Quick Search by Blood Group
                                    </h3>
                                    <div className="grid grid-cols-4 gap-3">
                                        {bloodGroups.map((bg) => (
                                            <Link key={bg} href={`/${orgSlug}/donors?bloodGroup=${encodeURIComponent(bg)}`}>
                                                <div className="group relative p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-red-500/40 text-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/5">
                                                    <div className="text-2xl font-black text-white group-hover:text-red-400 transition-colors">
                                                        {bg}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-wider">
                                                        Find
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>

                                    {/* CTA inside card */}
                                    <div className="mt-6 pt-6 border-t border-slate-800">
                                        <Link href={`/${orgSlug}/register`}>
                                            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 hover:border-red-500/40 cursor-pointer transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                                        <Heart className="w-5 h-5 text-red-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">Become a Donor</p>
                                                        <p className="text-xs text-slate-500">Register in 30 seconds</p>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </Link>
                                    </div>
                                </div>

                                {/* Floating accent elements */}
                                <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-3xl opacity-30" style={{ backgroundColor: primaryColor }} />
                                <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-purple-500/10 blur-3xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== STATS SECTION ===== */}
            <section className="py-16 relative z-10 bg-slate-900/50 border-y border-slate-800/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { label: "Registered Donors", value: stats.donorsCount, icon: Users, accent: "from-blue-500/20 to-transparent", iconColor: "text-blue-400" },
                            { label: "Lives Helped", value: stats.livesHelped, icon: Heart, accent: "from-rose-500/20 to-transparent", iconColor: "text-rose-400" },
                            { label: "Active Requests", value: stats.activeRequests, icon: Droplet, accent: "from-red-500/20 to-transparent", iconColor: "text-red-400" },
                            { label: "Areas Covered", value: stats.villagesCovered, icon: ShieldCheck, accent: "from-emerald-500/20 to-transparent", iconColor: "text-emerald-400" },
                        ].map((stat, idx) => (
                            <div
                                key={idx}
                                className="group relative p-6 md:p-8 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${stat.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                <div className="relative">
                                    <stat.icon className={`w-6 h-6 ${stat.iconColor} mb-4`} />
                                    <div className="text-3xl md:text-4xl font-black text-white mb-1">
                                        {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                                    </div>
                                    <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="py-24 bg-slate-950">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-4 block">
                            Simple Process
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                            How It Works
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            Getting help is quick and simple. Follow these three easy steps.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {[
                            {
                                step: "01",
                                title: "Search Donors",
                                description: "Filter by blood group, district, and upazila to find verified donors near you.",
                                icon: Search,
                                color: "text-blue-400",
                                bg: "bg-blue-500/10",
                                borderHover: "hover:border-blue-500/30",
                            },
                            {
                                step: "02",
                                title: "Contact Directly",
                                description: "Call donors directly from the platform. No middlemen, no delays.",
                                icon: Phone,
                                color: "text-emerald-400",
                                bg: "bg-emerald-500/10",
                                borderHover: "hover:border-emerald-500/30",
                            },
                            {
                                step: "03",
                                title: "Save a Life",
                                description: "Complete the donation and help someone in their moment of greatest need.",
                                icon: Heart,
                                color: "text-red-400",
                                bg: "bg-red-500/10",
                                borderHover: "hover:border-red-500/30",
                            },
                        ].map((item, idx) => (
                            <div
                                key={idx}
                                className={`group relative p-8 rounded-2xl bg-slate-900/50 border border-slate-800 ${item.borderHover} transition-all hover:-translate-y-1`}
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <item.icon className={`w-6 h-6 ${item.color}`} />
                                    </div>
                                    <span className="text-5xl font-black text-slate-800 group-hover:text-slate-700 transition-colors">
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-white mb-3">{item.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURES SHOWCASE ===== */}
            <section className="py-24 bg-slate-900/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-4 block">
                            Platform Features
                        </span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            A comprehensive blood donation management platform built for communities.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                        {[
                            {
                                icon: Search,
                                title: "Smart Donor Search",
                                desc: "Find compatible donors by blood group, location, and availability",
                                href: `/${orgSlug}/donors`,
                                color: "text-blue-400",
                                bg: "bg-blue-500/10",
                            },
                            {
                                icon: Droplet,
                                title: "Blood Requests",
                                desc: "Post urgent requests and get matched with donors automatically",
                                href: `/${orgSlug}/requests`,
                                color: "text-red-400",
                                bg: "bg-red-500/10",
                            },
                            {
                                icon: Trophy,
                                title: "Donor Leaderboard",
                                desc: "Recognize top contributors with points, badges, and rankings",
                                href: `/${orgSlug}/leaderboard`,
                                color: "text-amber-400",
                                bg: "bg-amber-500/10",
                            },
                            {
                                icon: Calendar,
                                title: "Donation Events",
                                desc: "Join community blood drives and organized donation campaigns",
                                href: `/${orgSlug}/events`,
                                color: "text-emerald-400",
                                bg: "bg-emerald-500/10",
                            },
                            {
                                icon: ShieldCheck,
                                title: "Verified Profiles",
                                desc: "All donors are verified by admin for trust and reliability",
                                href: `/${orgSlug}/donors`,
                                color: "text-cyan-400",
                                bg: "bg-cyan-500/10",
                            },
                            {
                                icon: MessageSquare,
                                title: "Community Feedback",
                                desc: "Share suggestions, report issues, and help us improve",
                                href: `/${orgSlug}/feedback`,
                                color: "text-purple-400",
                                bg: "bg-purple-500/10",
                            },
                        ].map((feature, idx) => (
                            <Link key={idx} href={feature.href}>
                                <div className="group h-full p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 cursor-pointer">
                                    <div className={`w-11 h-11 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className={`w-5 h-5 ${feature.color}`} />
                                    </div>
                                    <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                                    <div className="flex items-center gap-1 mt-4 text-xs font-bold text-slate-600 group-hover:text-slate-400 transition-colors">
                                        Explore <ChevronRight className="w-3 h-3" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== COMMUNITY IMPACT ===== */}
            <section className="py-24 bg-slate-950">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/5 group">
                                <img
                                    src="/assets/community.png"
                                    alt="Community Impact"
                                    className="w-full h-auto transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-500 mb-4 block">
                                Our Mission
                            </span>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
                                Building a{" "}
                                <span className="text-transparent bg-clip-text" style={{
                                    backgroundImage: `linear-gradient(135deg, ${primaryColor}, #f97316)`,
                                    WebkitBackgroundClip: "text",
                                }}>
                                    Stronger Community
                                </span>
                            </h2>
                            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                                Every donation matters. Our platform empowers communities to organize,
                                connect, and save lives through accessible blood donation networks.
                            </p>
                            <div className="space-y-4">
                                {[
                                    { title: "Localized Search", description: "Filter by District and Upazila to find donors in your neighborhood." },
                                    { title: "Direct Contact", description: "Call donors directly from the platform for immediate help." },
                                    { title: "Privacy First", description: "Your data is secure and used only for donation matching." },
                                ].map((feature, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mt-0.5">
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-sm mb-1">{feature.title}</h4>
                                            <p className="text-slate-500 text-sm">{feature.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FINAL CTA ===== */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 opacity-30" style={{
                        backgroundImage: `radial-gradient(ellipse at 50% 100%, ${primaryColor}44, transparent 70%)`,
                    }} />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="rounded-3xl p-10 md:p-16 text-center relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl">
                        <div className="absolute -top-20 -left-20 w-56 h-56 rounded-full blur-[100px] opacity-40" style={{ backgroundColor: primaryColor }} />
                        <div className="absolute -bottom-20 -right-20 w-56 h-56 bg-purple-500/20 rounded-full blur-[100px]" />

                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl mx-auto mb-8 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                                <Heart className="w-8 h-8" style={{ color: primaryColor }} />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                                Ready to Save a Life?
                            </h2>
                            <p className="text-lg text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
                                Join our growing community of donors. Your one donation can save up to three lives.
                            </p>

                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link href={`/${orgSlug}/register`}>
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto h-14 px-10 rounded-2xl text-white font-bold text-base shadow-2xl hover:scale-[1.02] transition-all"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <Heart className="w-5 h-5 mr-2" />
                                        Become a Donor
                                    </Button>
                                </Link>
                                <Link href={`/${orgSlug}/donors`}>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="w-full sm:w-auto h-14 px-10 rounded-2xl border-white/15 text-white hover:bg-white/5 font-bold text-base transition-all"
                                    >
                                        Explore Donors
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
