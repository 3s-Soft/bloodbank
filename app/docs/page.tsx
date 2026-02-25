"use client";

import {
    Globe,
    Heart,
    Users,
    Shield,
    Zap,
    ArrowRight,
    Droplet,
    Search,
    ChevronRight,
    MessageCircle,
    HandHeart,
    Building2,
    BookOpen,
    ArrowLeft,
    Activity,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const mainGuides = [
    {
        title: "Platform Vision",
        description: "Our mission to unify and digitize blood donation across Bangladesh.",
        icon: Globe,
        href: "#vision"
    },
    {
        title: "For Donors",
        description: "How to register, maintain your profile, and find organizations.",
        icon: HandHeart,
        href: "#donors"
    },
    {
        title: "For Organizations",
        description: "Setting up your blood bank and managing requests efficiently.",
        icon: Building2,
        href: "#organizations"
    },
    {
        title: "Trust & Safety",
        description: "Our verification protocols and data protection standards.",
        icon: Shield,
        href: "#safety"
    }
];

export default function GlobalDocs() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col text-slate-50 selection:bg-red-500/30">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 h-20">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center space-x-2.5 group hover:opacity-80 transition-opacity">
                            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                                <Droplet className="w-5 h-5 text-white fill-current" />
                            </div>
                            <span className="text-xl font-black text-white tracking-tight">
                                Blood<span className="text-red-500">Bank</span>
                            </span>
                        </Link>
                        <div className="h-6 w-px bg-slate-800 hidden sm:block" />
                        <div className="hidden sm:flex items-center gap-2 text-slate-400 font-bold text-sm tracking-tight">
                            <BookOpen className="w-4 h-4" />
                            Global Documentation
                        </div>
                    </div>

                    <div className="relative w-72 hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Type to search platform guides..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 rounded-2xl bg-slate-800 border-none text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500/50 outline-none transition-all"
                        />
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/5">
                    <div className="container mx-auto px-4 max-w-5xl text-center">
                        <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight">
                            Everything You Need <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">To Save Lives</span>
                        </h1 >
                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                            Welcome to the central knowledge hub of Bangladesh BloodBank. Whether you're a donor looking to give or a hospital managing requests, we've got you covered.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {mainGuides.map((guide, i) => (
                                <Link
                                    key={i}
                                    href={guide.href}
                                    className="p-6 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-red-500/30 hover:bg-slate-900 transition-all group text-left"
                                >
                                    <div className="p-3 w-fit rounded-xl bg-slate-800 mb-6 group-hover:scale-110 transition-transform">
                                        <guide.icon className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h3 className="font-black text-white mb-2 tracking-tight">{guide.title}</h3>
                                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                        {guide.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Content Sections */}
                <div className="container mx-auto px-4 py-24 max-w-4xl">
                    <section id="vision" className="mb-32 scroll-mt-32">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest">Platform Vision & Scale</span>
                            <div className="h-px flex-grow bg-slate-800" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">One Platform, Endless Impact</h2>
                        <div className="prose prose-invert max-w-none text-slate-400 font-medium leading-relaxed space-y-6">
                            <p>
                                Bangladesh BloodBank is more than just a website; it's a digital infrastructure designed to bridge the gap between those who can help and those who need it most. Our platform addresses the critical shortage of organized blood donation data in rural areas of Bangladesh.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                                <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 text-center">
                                    <div className="text-2xl font-black text-white mb-1">64</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Districts Covered</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 text-center">
                                    <div className="text-2xl font-black text-white mb-1">490+</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Upazilas</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 text-center">
                                    <div className="text-2xl font-black text-white mb-1">5m</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Matching Speed</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 text-center">
                                    <div className="text-2xl font-black text-white mb-1">0৳</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Always Free</div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="donors" className="mb-32 scroll-mt-32">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest">The Life-Saving Protocol</span>
                            <div className="h-px flex-grow bg-slate-800" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">Protocol for Emergency Response</h2>
                        <div className="space-y-8">
                            <div className="p-8 rounded-3xl bg-slate-900 border border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Droplet className="w-32 h-32 text-red-500 fill-current" />
                                </div>
                                <h4 className="text-xl font-bold text-white mb-4">Phase 1: Verification & Matching</h4>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                    When an emergency request is filed, our system immediately scans the local geographical hub for O-negative and specific compatible groups. We prioritize donors with high "reliability scores"—those who have fulfilled past requests promptly.
                                </p>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        LOCAL PRIORITY
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        AUTO-SCREENING
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 rounded-3xl bg-slate-900 border border-white/5 relative overflow-hidden group">
                                <h4 className="text-xl font-bold text-white mb-4">Phase 2: Direct Connection SLA</h4>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                    Our targeted Response SLA (Service Level Agreement) is 5 minutes from request validation.
                                </p>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-slate-400 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-red-500" />
                                        Instant Push & WhatsApp Notifications to compatible donors.
                                    </li>
                                    <li className="flex items-center gap-3 text-slate-400 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-red-500" />
                                        Automatic Handover to Regional Logistics Volunteer.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>

                {/* CTA */}
                <section className="bg-red-500 py-20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/20 rounded-full blur-[100px] -ml-36 -mb-36" />

                    <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight italic">
                            "Humanity first, technology always."
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/login"
                                className="h-14 px-10 rounded-2xl bg-white text-red-600 text-base font-black hover:bg-slate-100 transition-all flex items-center justify-center shadow-xl shadow-black/10"
                            >
                                Get Started Now
                            </Link>
                            <Link
                                href="/organizations/new"
                                className="h-14 px-10 rounded-2xl border-2 border-white/30 text-white text-base font-black hover:bg-white/10 transition-all flex items-center justify-center"
                            >
                                Setup an Organization
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Platform Footer */}
            <footer className="py-12 border-t border-white/5 bg-slate-950">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <Droplet className="w-5 h-5 text-slate-600" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">Bangladesh Bloodbank Infrastructure</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Link href="/" className="hover:text-white transition-colors">Home Page</Link>
                        <Link href="/admin" className="hover:text-white transition-colors">System Admin</Link>
                        <Link href="mailto:support@bloodbank.org.bd" className="hover:text-white transition-colors">Technical Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
