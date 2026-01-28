"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    Droplet,
    CheckCircle,
    Clock,
    ArrowRight,
    BarChart3,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function OrgDashboard() {
    const organization = useOrganization();
    const orgSlug = organization.slug;
    const primaryColor = organization.primaryColor || "#D32F2F";
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/org/stats?orgSlug=${orgSlug}`);
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            }
        };
        fetchStats();
    }, [orgSlug]);

    const statCards = [
        { title: "Total Donors", value: stats?.donorsCount || "0", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Active Requests", value: stats?.activeRequests || "0", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
        { title: "Lives Saved", value: stats?.livesHelped || "0", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
        { title: "Pending Verification", value: "8", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 mb-2">Dashboard</h1>
                    <p className="text-neutral-500 font-medium">Manage {organization.name}'s mission and network.</p>
                </div>
                <div className="flex space-x-3">
                    <Link href={`/${orgSlug}/dashboard/requests`}>
                        <Button variant="outline">Manage Requests</Button>
                    </Link>
                    <Link href={`/${orgSlug}/dashboard/donors`}>
                        <Button style={{ backgroundColor: primaryColor }} className="text-white">
                            Verify Donors
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {statCards.map((stat, idx) => (
                    <Card key={idx} className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${stat.bg}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                                <BarChart3 className="w-4 h-4 text-neutral-300" />
                            </div>
                            <div className="text-3xl font-black text-neutral-900 mb-1">{stat.value}</div>
                            <div className="text-sm text-neutral-500 font-bold uppercase tracking-wider">{stat.title}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-bold">Recent Blood Requests</CardTitle>
                        <Link href={`/${orgSlug}/dashboard/requests`} className="text-sm font-bold flex items-center" style={{ color: primaryColor }}>
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center font-bold text-red-600 border border-neutral-100 shadow-sm">
                                            O+
                                        </div>
                                        <div>
                                            <div className="font-bold text-neutral-900 text-sm">Patient: Rahim Uddin</div>
                                            <div className="text-xs text-neutral-500">Savar, Oct 27</div>
                                        </div>
                                    </div>
                                    <div className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-full">
                                        Emergency
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Volunteer Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-start py-6 rounded-2xl">
                            <Users className="w-5 h-5 mr-3 text-blue-500" />
                            <div className="text-left">
                                <div className="font-bold text-sm">Verify 5 New Donors</div>
                                <div className="text-xs text-neutral-500">Manual verification needed</div>
                            </div>
                        </Button>
                        <Button variant="outline" className="w-full justify-start py-6 rounded-2xl">
                            <Clock className="w-5 h-5 mr-3 text-orange-500" />
                            <div className="text-left">
                                <div className="font-bold text-sm">Update 3 Requests</div>
                                <div className="text-xs text-neutral-500">Requests older than 48h</div>
                            </div>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
