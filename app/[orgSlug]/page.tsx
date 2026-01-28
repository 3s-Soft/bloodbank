"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Droplet, Search, Users, Heart, Share2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function OrganizationLanding() {
    const organization = useOrganization();
    const orgSlug = organization.slug;
    const primaryColor = organization.primaryColor || "#D32F2F";
    const [stats, setStats] = useState<any>({
        donorsCount: "...",
        livesHelped: "...",
        activeRequests: "...",
        villagesCovered: "..."
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/org/stats?orgSlug=${orgSlug}`);
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch stats", error);
            }
        };
        fetchStats();
    }, [orgSlug]);

    return (
        <div className="flex flex-col">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden bg-white">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-50 rounded-full mb-6" style={{ backgroundColor: `${primaryColor}10` }}>
                            < Droplet className="w-4 h-4" style={{ color: primaryColor }} />
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                                Community Driven Platform
                            </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-neutral-900 leading-tight mb-6">
                            Every Drop <span style={{ color: primaryColor }}>Saves a Life.</span>
                        </h1>
                        <p className="text-xl text-neutral-600 mb-10 leading-relaxed max-w-2xl">
                            Welcome to <span className="font-bold text-neutral-900">{organization.name}</span>. We connect blood donors with those in need across our rural communities, quickly and for free.
                        </p>
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                            <Link href={`/${orgSlug}/requests/new`}>
                                <Button size="lg" className="w-full sm:w-auto text-white" style={{ backgroundColor: primaryColor }}>
                                    Need Blood? Request Now
                                </Button>
                            </Link>
                            <Link href={`/${orgSlug}/register`}>
                                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                    Become a Donor
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Abstract Background Element */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-neutral-50 -z-10 skew-x-12 translate-x-1/4 hidden lg:block" />
            </section>

            {/* Stats Section */}
            <section className="py-12 bg-neutral-50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: "Donors Ready", value: stats.donorsCount, icon: Users },
                            { label: "Lives Helped", value: stats.livesHelped, icon: Heart },
                            { label: "Active Requests", value: stats.activeRequests, icon: Droplet },
                            { label: "Villages Covered", value: stats.villagesCovered, icon: Share2 },
                        ].map((stat, idx) => (
                            <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex flex-col items-center text-center">
                                    <div className="p-3 rounded-2xl mb-4" style={{ backgroundColor: `${primaryColor}10` }}>
                                        <stat.icon className="w-6 h-6" style={{ color: primaryColor }} />
                                    </div>
                                    <div className="text-2xl font-black text-neutral-900">{stat.value}</div>
                                    <div className="text-sm text-neutral-500 font-medium">{stat.label}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Quick Search CTA */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden" style={{ backgroundColor: primaryColor }}>
                        <h2 className="text-3xl md:text-5xl font-black mb-6">Find Donors Near You</h2>
                        <p className="text-lg opacity-90 max-w-xl mx-auto mb-10">
                            Search for specific blood groups in your village or upazila to find donors available right now.
                        </p>
                        <Link href={`/${orgSlug}/donors`}>
                            <Button size="lg" variant="secondary" className="bg-white text-red-600 hover:bg-neutral-50 border-none">
                                <Search className="w-5 h-5 mr-2" />
                                Start Searching
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
