"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    Droplet,
    CheckCircle,
    Clock,
    ArrowRight,
    UserPlus,
    TrendingUp,
    AlertTriangle,
    Activity,
    MapPin,
    Shield,
    Heart,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useOrganization } from "@/lib/context/OrganizationContext";

interface BloodGroupStat {
    group: string;
    count: number;
}

interface LocationStat {
    district?: string;
    upazila?: string;
    count: number;
}

interface RecentDonor {
    _id: string;
    bloodGroup: string;
    isVerified: boolean;
    createdAt: string;
    user: {
        name: string;
        phone: string;
    };
}

interface RecentRequest {
    _id: string;
    patientName: string;
    bloodGroup: string;
    urgency: string;
    status: string;
    createdAt: string;
}

interface AnalyticsData {
    organization: {
        name: string;
        slug: string;
        primaryColor: string;
    };
    overview: {
        totalDonors: number;
        verifiedDonors: number;
        unverifiedDonors: number;
        availableDonors: number;
        totalRequests: number;
        pendingRequests: number;
        fulfilledRequests: number;
        canceledRequests: number;
        fulfillmentRate: number;
        verificationRate: number;
    };
    bloodGroupStats: BloodGroupStat[];
    urgencyStats: {
        normal: number;
        urgent: number;
        emergency: number;
    };
    districtStats: LocationStat[];
    upazilaStats: LocationStat[];
    recentActivity: {
        newDonors: number;
        newRequests: number;
    };
    recentDonors: RecentDonor[];
    recentRequests: RecentRequest[];
}

// Bar Chart Component
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

    const gradientParts = segments.map(seg =>
        `${seg.color} ${seg.startPercent}% ${seg.startPercent + seg.percent}%`
    ).join(", ");

    return (
        <div className="flex items-center gap-6">
            <div
                className="w-28 h-28 rounded-full relative"
                style={{
                    background: total > 0
                        ? `conic-gradient(${gradientParts})`
                        : "#e5e5e5"
                }}
            >
                <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
                    <span className="text-lg font-black text-neutral-900">{total}</span>
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
function ProgressRing({ value, label, color = "#D32F2F", size = "md" }: { value: number; label: string; color?: string; size?: "sm" | "md" }) {
    const circumference = 2 * Math.PI * (size === "sm" ? 30 : 40);
    const strokeDashoffset = circumference - (value / 100) * circumference;
    const dimension = size === "sm" ? 72 : 96;
    const radius = size === "sm" ? 30 : 40;
    const center = dimension / 2;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: dimension, height: dimension }}>
                <svg className="transform -rotate-90" style={{ width: dimension, height: dimension }}>
                    <circle cx={center} cy={center} r={radius} stroke="#e5e5e5" strokeWidth="8" fill="none" />
                    <circle
                        cx={center} cy={center} r={radius}
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
                    <span className={`font-black text-neutral-900 ${size === "sm" ? "text-lg" : "text-xl"}`}>{value}%</span>
                </div>
            </div>
            <span className="text-sm font-medium text-neutral-600 mt-2 text-center">{label}</span>
        </div>
    );
}

export default function OrgDashboardPage({
    params,
}: {
    params: Promise<{ orgSlug: string }>;
}) {
    const { orgSlug } = use(params);
    const org = useOrganization();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const primaryColor = org?.primaryColor || "#D32F2F";

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/org/analytics?orgSlug=${orgSlug}`);
                const data = await res.json();
                setAnalytics(data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [orgSlug]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="animate-pulse space-y-8">
                    <div className="h-10 w-64 bg-neutral-200 rounded"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-neutral-200 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const overview = analytics?.overview;
    const bloodGroupData = analytics?.bloodGroupStats?.map(bg => ({ label: bg.group, value: bg.count })) || [];
    const maxBloodGroup = Math.max(...bloodGroupData.map(d => d.value), 1);

    const statCards = [
        { title: "Total Donors", value: overview?.totalDonors || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Verified", value: overview?.verifiedDonors || 0, icon: Shield, color: "text-green-600", bg: "bg-green-50" },
        { title: "Pending Requests", value: overview?.pendingRequests || 0, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
        { title: "Lives Helped", value: overview?.fulfilledRequests || 0, icon: Heart, color: "text-red-600", bg: "bg-red-50" },
    ];

    const urgencyCount = (analytics?.urgencyStats?.normal || 0) +
        (analytics?.urgencyStats?.urgent || 0) +
        (analytics?.urgencyStats?.emergency || 0);

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}20` }}>
                            <Activity className="w-6 h-6" style={{ color: primaryColor }} />
                        </div>
                        <h1 className="text-4xl font-black text-neutral-900">Dashboard</h1>
                    </div>
                    <p className="text-neutral-500 font-medium">
                        {org?.name || "Organization"} Analytics & Management
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href={`/${orgSlug}/donors`}>
                        <Button variant="outline">
                            <Users className="w-4 h-4 mr-2" />
                            View Donors
                        </Button>
                    </Link>
                    <Link href={`/${orgSlug}/request`}>
                        <Button style={{ backgroundColor: primaryColor }} className="text-white">
                            <Droplet className="w-4 h-4 mr-2" />
                            New Request
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Recent Activity Banner */}
            {analytics?.recentActivity && (
                <div
                    className="rounded-2xl p-6 mb-8 text-white"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-bold">Last 7 Days Activity</span>
                    </div>
                    <div className="flex gap-8">
                        <div>
                            <span className="text-3xl font-black">{analytics.recentActivity.newDonors}</span>
                            <span className="ml-2 opacity-80">new donors registered</span>
                        </div>
                        <div>
                            <span className="text-3xl font-black">{analytics.recentActivity.newRequests}</span>
                            <span className="ml-2 opacity-80">blood requests</span>
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
                            <Droplet className="w-5 h-5" style={{ color: primaryColor }} />
                            Blood Group Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChart data={bloodGroupData} maxValue={maxBloodGroup} color={primaryColor} />
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

            {/* Performance & Urgency Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Key Metrics */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Key Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-around">
                            <ProgressRing
                                value={overview?.fulfillmentRate || 0}
                                label="Fulfillment Rate"
                                color="#22c55e"
                            />
                            <ProgressRing
                                value={overview?.verificationRate || 0}
                                label="Verification Rate"
                                color={primaryColor}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Urgency Distribution */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            Pending by Urgency ({urgencyCount})
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

            {/* Location Stats */}
            {(analytics?.districtStats?.length || 0) > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-purple-600" />
                                Top Districts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BarChart
                                data={analytics?.districtStats?.map(d => ({ label: d.district || "", value: d.count })) || []}
                                maxValue={Math.max(...(analytics?.districtStats?.map(d => d.count) || [1]))}
                                color="#8b5cf6"
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-cyan-600" />
                                Top Upazilas
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BarChart
                                data={analytics?.upazilaStats?.map(u => ({ label: u.upazila || "", value: u.count })) || []}
                                maxValue={Math.max(...(analytics?.upazilaStats?.map(u => u.count) || [1]))}
                                color="#06b6d4"
                            />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Recent Activity Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Donors */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold">Recent Donors</CardTitle>
                        <Link
                            href={`/${orgSlug}/dashboard/donors`}
                            className="text-sm font-bold flex items-center hover:underline"
                            style={{ color: primaryColor }}
                        >
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {analytics?.recentDonors?.length === 0 ? (
                            <div className="text-center py-8 text-neutral-500">
                                <UserPlus className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                                <p className="text-sm">No donors yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {analytics?.recentDonors?.map((donor) => (
                                    <div key={donor._id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                {donor.bloodGroup}
                                            </div>
                                            <div>
                                                <div className="font-bold text-neutral-900">{donor.user?.name}</div>
                                                <div className="text-xs text-neutral-500">{donor.user?.phone}</div>
                                            </div>
                                        </div>
                                        {donor.isVerified ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Requests */}
                <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold">Recent Requests</CardTitle>
                        <Link
                            href={`/${orgSlug}/dashboard/requests`}
                            className="text-sm font-bold flex items-center hover:underline"
                            style={{ color: primaryColor }}
                        >
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {analytics?.recentRequests?.length === 0 ? (
                            <div className="text-center py-8 text-neutral-500">
                                <Droplet className="w-10 h-10 mx-auto mb-2 text-neutral-300" />
                                <p className="text-sm">No requests yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {analytics?.recentRequests?.map((request) => (
                                    <div key={request._id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${request.urgency === "emergency" ? "bg-red-600" :
                                                        request.urgency === "urgent" ? "bg-orange-500" : "bg-green-600"
                                                    }`}
                                            >
                                                {request.bloodGroup}
                                            </div>
                                            <div>
                                                <div className="font-bold text-neutral-900">{request.patientName}</div>
                                                <div className="text-xs text-neutral-500 capitalize">{request.urgency}</div>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${request.status === "fulfilled" ? "bg-green-100 text-green-700" :
                                                request.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                    "bg-neutral-100 text-neutral-600"
                                            }`}>
                                            {request.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
