"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Building2,
    Users,
    Droplet,
    CheckCircle,
    Clock,
    ArrowRight,
    Plus,
    ExternalLink,
    TrendingUp,
    AlertTriangle,
    Activity,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

interface BloodGroupStat {
    group: string;
    count: number;
}

interface OrgStat {
    _id: string;
    name: string;
    slug: string;
    primaryColor: string;
    isActive: boolean;
    donorCount: number;
    verifiedCount: number;
    requestCount: number;
    pendingCount: number;
    fulfilledCount: number;
    fulfillmentRate: number;
}

interface DistrictStat {
    district: string;
    count: number;
}

interface AnalyticsData {
    overview: {
        totalOrganizations: number;
        activeOrganizations: number;
        totalDonors: number;
        verifiedDonors: number;
        availableDonors: number;
        totalUsers: number;
        totalRequests: number;
        pendingRequests: number;
        fulfilledRequests: number;
        canceledRequests: number;
        fulfillmentRate: number;
    };
    bloodGroupStats: BloodGroupStat[];
    urgencyStats: {
        normal: number;
        urgent: number;
        emergency: number;
    };
    orgStats: OrgStat[];
    districtStats: DistrictStat[];
    recentActivity: {
        newDonors: number;
        newRequests: number;
    };
}

// Simple Bar Chart Component
function BarChart({ data, maxValue, color = "#D32F2F" }: { data: { label: string; value: number }[]; maxValue: number; color?: string }) {
    return (
        <div className="space-y-3">
            {data.map((item, idx) => (
                <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-neutral-700">{item.label}</span>
                        <span className="font-bold text-neutral-900">{item.value}</span>
                    </div>
                    <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                                backgroundColor: color
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Donut Chart Component
function DonutChart({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercent = 0;

    const segments = data.map((item, idx) => {
        const percent = total > 0 ? (item.value / total) * 100 : 0;
        const startPercent = cumulativePercent;
        cumulativePercent += percent;
        return { ...item, percent, startPercent, color: colors[idx % colors.length] };
    });

    // Create conic gradient
    const gradientParts = segments.map(seg =>
        `${seg.color} ${seg.startPercent}% ${seg.startPercent + seg.percent}%`
    ).join(", ");

    return (
        <div className="flex items-center gap-6">
            <div
                className="w-32 h-32 rounded-full relative"
                style={{
                    background: total > 0
                        ? `conic-gradient(${gradientParts})`
                        : "#e5e5e5"
                }}
            >
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                    <span className="text-xl font-black text-neutral-900">{total}</span>
                </div>
            </div>
            <div className="space-y-2">
                {segments.map((seg, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                        <span className="text-neutral-600">{seg.label}</span>
                        <span className="font-bold text-neutral-900">{seg.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Progress Ring Component
function ProgressRing({ value, max, label, color = "#D32F2F" }: { value: number; max: number; label: string; color?: string }) {
    const percent = max > 0 ? Math.round((value / max) * 100) : 0;
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="#e5e5e5" strokeWidth="8" fill="none" />
                    <circle
                        cx="48" cy="48" r="40"
                        stroke={color}
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-500"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black text-neutral-900">{percent}%</span>
                </div>
            </div>
            <span className="text-sm font-medium text-neutral-600 mt-2">{label}</span>
        </div>
    );
}

export default function SuperAdminDashboard() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/admin/analytics");
                const data = await res.json();
                setAnalytics(data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="animate-pulse space-y-8">
                    <div className="h-10 w-64 bg-neutral-200 rounded"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-neutral-200 rounded-2xl"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="h-80 bg-neutral-200 rounded-2xl"></div>
                        <div className="h-80 bg-neutral-200 rounded-2xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    const overview = analytics?.overview;
    const bloodGroupData = analytics?.bloodGroupStats?.map(bg => ({ label: bg.group, value: bg.count })) || [];
    const maxBloodGroup = Math.max(...bloodGroupData.map(d => d.value), 1);

    const statCards = [
        { title: "Organizations", value: overview?.totalOrganizations || 0, icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
        { title: "Total Donors", value: overview?.totalDonors || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Pending Requests", value: overview?.pendingRequests || 0, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
        { title: "Fulfilled", value: overview?.fulfilledRequests || 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-xl">
                            <Activity className="w-6 h-6 text-red-600" />
                        </div>
                        <h1 className="text-4xl font-black text-neutral-900">Super Admin Dashboard</h1>
                    </div>
                    <p className="text-neutral-500 font-medium">
                        Platform-wide analytics and organization management.
                    </p>
                </div>
                <Link href="/admin/organizations/new">
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                        <Plus className="w-5 h-5 mr-2" />
                        New Organization
                    </Button>
                </Link>
            </div>

            {/* Recent Activity Banner */}
            {analytics?.recentActivity && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-bold">Last 7 Days Activity</span>
                    </div>
                    <div className="flex gap-8">
                        <div>
                            <span className="text-3xl font-black">{analytics.recentActivity.newDonors}</span>
                            <span className="ml-2 opacity-80">new donors</span>
                        </div>
                        <div>
                            <span className="text-3xl font-black">{analytics.recentActivity.newRequests}</span>
                            <span className="ml-2 opacity-80">new requests</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, idx) => (
                    <Card key={idx} className="border-none shadow-sm">
                        <CardContent className="p-5">
                            <div className={`inline-flex p-2.5 rounded-xl ${stat.bg} mb-3`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div className="text-3xl font-black text-neutral-900">{stat.value}</div>
                            <div className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
                                {stat.title}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Blood Group Distribution */}
                <Card className="border-none shadow-sm lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Droplet className="w-5 h-5 text-red-600" />
                            Blood Group Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChart data={bloodGroupData} maxValue={maxBloodGroup} color="#D32F2F" />
                    </CardContent>
                </Card>

                {/* Request Status */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Request Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DonutChart
                            data={[
                                { label: "Pending", value: overview?.pendingRequests || 0 },
                                { label: "Fulfilled", value: overview?.fulfilledRequests || 0 },
                                { label: "Canceled", value: overview?.canceledRequests || 0 },
                            ]}
                            colors={["#f59e0b", "#22c55e", "#6b7280"]}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Progress Rings & Urgency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Key Metrics */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Key Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-around">
                            <ProgressRing
                                value={overview?.fulfilledRequests || 0}
                                max={overview?.totalRequests || 1}
                                label="Fulfillment Rate"
                                color="#22c55e"
                            />
                            <ProgressRing
                                value={overview?.verifiedDonors || 0}
                                max={overview?.totalDonors || 1}
                                label="Verified Donors"
                                color="#3b82f6"
                            />
                            <ProgressRing
                                value={overview?.availableDonors || 0}
                                max={overview?.totalDonors || 1}
                                label="Available Donors"
                                color="#8b5cf6"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Urgency Distribution */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            Pending by Urgency
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-green-50 rounded-xl">
                                <div className="text-3xl font-black text-green-600">{analytics?.urgencyStats?.normal || 0}</div>
                                <div className="text-sm font-medium text-green-700">Normal</div>
                            </div>
                            <div className="text-center p-4 bg-orange-50 rounded-xl">
                                <div className="text-3xl font-black text-orange-600">{analytics?.urgencyStats?.urgent || 0}</div>
                                <div className="text-sm font-medium text-orange-700">Urgent</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-xl">
                                <div className="text-3xl font-black text-red-600">{analytics?.urgencyStats?.emergency || 0}</div>
                                <div className="text-sm font-medium text-red-700">Emergency</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Organizations Table */}
            <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-bold">Organization Performance</CardTitle>
                    <Link
                        href="/admin/organizations"
                        className="text-sm font-bold text-red-600 flex items-center hover:underline"
                    >
                        Manage All <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                </CardHeader>
                <CardContent>
                    {analytics?.orgStats?.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                            <Building2 className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                            <p className="font-medium">No organizations yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-100">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-neutral-500 uppercase">Organization</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-neutral-500 uppercase">Donors</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-neutral-500 uppercase">Verified</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-neutral-500 uppercase">Requests</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-neutral-500 uppercase">Pending</th>
                                        <th className="text-center py-3 px-4 text-xs font-bold text-neutral-500 uppercase">Fulfillment</th>
                                        <th className="text-right py-3 px-4 text-xs font-bold text-neutral-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {analytics?.orgStats?.map((org) => (
                                        <tr key={org._id} className="hover:bg-neutral-50">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <div
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                                                        style={{ backgroundColor: org.primaryColor || "#D32F2F" }}
                                                    >
                                                        {org.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-neutral-900">{org.name}</div>
                                                        <code className="text-xs text-neutral-500">/{org.slug}</code>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center font-bold text-blue-600">{org.donorCount}</td>
                                            <td className="py-4 px-4 text-center font-bold text-green-600">{org.verifiedCount}</td>
                                            <td className="py-4 px-4 text-center font-bold text-neutral-900">{org.requestCount}</td>
                                            <td className="py-4 px-4 text-center font-bold text-orange-600">{org.pendingCount}</td>
                                            <td className="py-4 px-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-16 h-2 bg-neutral-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500 rounded-full"
                                                            style={{ width: `${org.fulfillmentRate}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-bold text-neutral-700">{org.fulfillmentRate}%</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link href={`/${org.slug}`} target="_blank">
                                                        <Button size="sm" variant="ghost">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={`/admin/organizations/${org._id}`}>
                                                        <Button size="sm" variant="outline">Edit</Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
