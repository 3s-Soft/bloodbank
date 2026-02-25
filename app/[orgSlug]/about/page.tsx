"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganization } from "@/lib/context/OrganizationContext";
import {
    Building2,
    MapPin,
    Phone,
    Mail,
    Users,
    Droplet,
    Heart,
    Shield,
    TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface OrgStats {
    donorsCount: number;
    livesHelped: number;
    activeRequests: number;
    villagesCovered: number;
}

export default function AboutPage({
    params,
}: {
    params: Promise<{ orgSlug: string }>;
}) {
    const { orgSlug } = use(params);
    const org = useOrganization();
    const primaryColor = org?.primaryColor || "#D32F2F";

    const [stats, setStats] = useState<OrgStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch(`/api/org/stats?orgSlug=${orgSlug}`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, [orgSlug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const statCards = [
        {
            label: "Registered Donors",
            value: stats?.donorsCount || 0,
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
        },
        {
            label: "Lives Helped",
            value: stats?.livesHelped || 0,
            icon: Heart,
            color: "text-red-400",
            bg: "bg-red-500/10",
        },
        {
            label: "Active Requests",
            value: stats?.activeRequests || 0,
            icon: Droplet,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
        },
        {
            label: "Villages Covered",
            value: stats?.villagesCovered || 0,
            icon: MapPin,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Hero */}
                <div className="relative overflow-hidden rounded-3xl p-8 lg:p-12" style={{ backgroundColor: `${primaryColor}10` }}>
                    <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: `radial-gradient(circle at 20% 80%, ${primaryColor} 0%, transparent 50%), radial-gradient(circle at 80% 20%, ${primaryColor} 0%, transparent 50%)`
                    }} />
                    <div className="relative space-y-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {org?.name?.charAt(0) || "O"}
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black text-white">
                                    {org?.name || "Organization"}
                                </h1>
                                {org?.isVerified && (
                                    <span className="inline-flex items-center gap-1 text-sm text-emerald-400 font-bold">
                                        <Shield className="w-4 h-4" /> Verified Organization
                                    </span>
                                )}
                            </div>
                        </div>
                        <p className="text-slate-400 text-lg max-w-2xl">
                            A community-powered blood bank connecting donors with patients in need.
                            Every donation counts, every drop saves lives.
                        </p>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <Link href={`/${orgSlug}/register`}>
                                <Button className="text-white font-bold" style={{ backgroundColor: primaryColor }}>
                                    Become a Donor
                                </Button>
                            </Link>
                            <Link href={`/${orgSlug}/donors`}>
                                <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
                                    Find Donors
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.label} className="bg-slate-900 border-slate-800">
                                <CardContent className="p-5 text-center">
                                    <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-3`}>
                                        <Icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    <p className="text-2xl font-black text-white">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">
                                        {stat.label}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Contact Info */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-slate-400" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {org?.contactPhone && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                    <Phone className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Phone</p>
                                        <p className="text-white font-bold">{org.contactPhone}</p>
                                    </div>
                                </div>
                            )}
                            {org?.contactEmail && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Email</p>
                                        <p className="text-white font-bold">{org.contactEmail}</p>
                                    </div>
                                </div>
                            )}
                            {org?.address && (
                                <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700 md:col-span-2">
                                    <MapPin className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Address</p>
                                        <p className="text-white font-bold">{org.address}</p>
                                    </div>
                                </div>
                            )}
                            {!org?.contactPhone && !org?.contactEmail && !org?.address && (
                                <p className="text-slate-500 col-span-2">
                                    No contact information provided yet.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-slate-400" />
                            Quick Links
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[
                                { href: `/${orgSlug}/donors`, label: "Find Donors", icon: Users, desc: "Search available donors" },
                                { href: `/${orgSlug}/requests`, label: "Blood Requests", icon: Droplet, desc: "View active requests" },
                                { href: `/${orgSlug}/register`, label: "Register as Donor", icon: Heart, desc: "Join our community" },
                                { href: `/${orgSlug}/leaderboard`, label: "Leaderboard", icon: TrendingUp, desc: "Top contributors" },
                                { href: `/${orgSlug}/events`, label: "Events", icon: Building2, desc: "Donation drives" },
                                { href: `/${orgSlug}/feedback`, label: "Feedback", icon: Mail, desc: "Share suggestions" },
                            ].map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link key={link.href} href={link.href}>
                                        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer">
                                            <Icon className="w-5 h-5 text-slate-400" />
                                            <div>
                                                <p className="text-sm font-bold text-white">{link.label}</p>
                                                <p className="text-xs text-slate-500">{link.desc}</p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
