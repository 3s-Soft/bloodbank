"use client";

import { Button } from "@/components/ui/button";
import {
    Users,
    Droplet,
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

interface BloodGroupStat { group: string; count: number; }
interface LocationStat { district?: string; upazila?: string; count: number; }
interface RecentDonor {
    _id: string; bloodGroup: string; isVerified: boolean; createdAt: string;
    user: { name: string; phone: string; };
}
interface RecentRequest {
    _id: string; patientName: string; bloodGroup: string; urgency: string; status: string; createdAt: string;
}
interface AnalyticsData {
    organization: { name: string; slug: string; primaryColor: string; };
    overview: {
        totalDonors: number; verifiedDonors: number; unverifiedDonors: number; availableDonors: number;
        totalRequests: number; pendingRequests: number; fulfilledRequests: number; canceledRequests: number;
        fulfillmentRate: number; verificationRate: number;
    };
    bloodGroupStats: BloodGroupStat[];
    urgencyStats: { normal: number; urgent: number; emergency: number; };
    districtStats: LocationStat[];
    upazilaStats: LocationStat[];
    recentActivity: { newDonors: number; newRequests: number; };
    recentDonors: RecentDonor[];
    recentRequests: RecentRequest[];
}

// Dark Bar Chart
function BarChart({ data, maxValue, color = "#dc2626" }: { data: { label: string; value: number }[]; maxValue: number; color?: string }) {
    return (
        <div className="space-y-3">
            {data.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-400">{item.label}</span>
                        <span className="font-bold text-white">{item.value}</span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                                backgroundColor: color,
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}

// Dark Donut Chart
function DonutChart({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercent = 0;
    const segments = data.map((item, idx) => {
        const percent = total > 0 ? (item.value / total) * 100 : 0;
        const startPercent = cumulativePercent;
        cumulativePercent += percent;
        return { ...item, percent, startPercent, color: colors[idx % colors.length] };
    });
    const gradientParts = segments.map(seg => `${seg.color} ${seg.startPercent}% ${seg.startPercent + seg.percent}%`).join(", ");

    return (
        <div className="flex items-center gap-6">
            <div
                className="w-28 h-28 rounded-full relative flex-shrink-0"
                style={{ background: total > 0 ? `conic-gradient(${gradientParts})` : "#1e293b" }}
            >
                <div className="absolute inset-3 bg-slate-900 rounded-full flex items-center justify-center">
                    <span className="text-lg font-black text-white">{total}</span>
                </div>
            </div>
            <div className="space-y-2">
                {segments.map((seg, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                        <span className="text-slate-400">{seg.label}</span>
                        <span className="font-bold text-white">{seg.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Dark Progress Ring
function ProgressRing({ value, label, color = "#dc2626" }: { value: number; label: string; color?: string }) {
    const r = 40, dim = 96, c = dim / 2;
    const circumference = 2 * Math.PI * r;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: dim, height: dim }}>
                <svg className="transform -rotate-90" style={{ width: dim, height: dim }}>
                    <circle cx={c} cy={c} r={r} stroke="#1e293b" strokeWidth="8" fill="none" />
                    <circle
                        cx={c} cy={c} r={r} stroke={color} strokeWidth="8" fill="none"
                        strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-700"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-black text-xl text-white">{value}%</span>
                </div>
            </div>
            <span className="text-sm font-medium text-slate-400 mt-2 text-center">{label}</span>
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
    const primaryColor = org?.primaryColor || "#dc2626";

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
            <div className="p-6 lg:p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 w-64 bg-slate-800 rounded-xl" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-32 bg-slate-800/50 rounded-2xl" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="h-64 bg-slate-800/50 rounded-2xl lg:col-span-2" />
                        <div className="h-64 bg-slate-800/50 rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    const overview = analytics?.overview;
    const bloodGroupData = analytics?.bloodGroupStats?.map(bg => ({ label: bg.group, value: bg.count })) || [];
    const maxBloodGroup = Math.max(...bloodGroupData.map(d => d.value), 1);
    const urgencyCount = (analytics?.urgencyStats?.normal || 0) + (analytics?.urgencyStats?.urgent || 0) + (analytics?.urgencyStats?.emergency || 0);

    const statCards = [
        { title: "Total Donors", value: overview?.totalDonors || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
        { title: "Verified", value: overview?.verifiedDonors || 0, icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        { title: "Pending Requests", value: overview?.pendingRequests || 0, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
        { title: "Lives Helped", value: overview?.fulfilledRequests || 0, icon: Heart, color: "text-red-400", bg: "bg-red-500/10" },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}15` }}>
                            <Activity className="w-5 h-5" style={{ color: primaryColor }} />
                        </div>
                        <h1 className="text-3xl font-black text-white">Dashboard</h1>
                    </div>
                    <p className="text-sm text-slate-500 font-medium ml-12">
                        {org?.name} — Analytics & Management
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href={`/${orgSlug}/donors`}>
                        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                            <Users className="w-4 h-4 mr-2" />
                            View Donors
                        </Button>
                    </Link>
                    <Link href={`/${orgSlug}/requests/new`}>
                        <Button style={{ backgroundColor: primaryColor }} className="text-white hover:opacity-90">
                            <Droplet className="w-4 h-4 mr-2" />
                            New Request
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Activity Banner */}
            {analytics?.recentActivity && (
                <div
                    className="rounded-2xl p-5 text-white relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
                >
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00di0yaDJ2MmgtMnptLTQgNHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            <span className="font-bold text-sm uppercase tracking-wider">Last 7 Days</span>
                        </div>
                        <div className="flex gap-6">
                            <div>
                                <span className="text-3xl font-black">{analytics.recentActivity.newDonors}</span>
                                <span className="ml-2 text-sm opacity-80">new donors</span>
                            </div>
                            <div>
                                <span className="text-3xl font-black">{analytics.recentActivity.newRequests}</span>
                                <span className="ml-2 text-sm opacity-80">blood requests</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {statCards.map((stat, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all group">
                        <div className={`inline-flex p-2.5 rounded-xl ${stat.bg} mb-3 group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div className="text-3xl font-black text-white">{stat.value}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.title}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center gap-2 mb-5">
                        <Droplet className="w-5 h-5" style={{ color: primaryColor }} />
                        <h3 className="text-base font-bold text-white">Blood Group Distribution</h3>
                    </div>
                    <BarChart data={bloodGroupData} maxValue={maxBloodGroup} color={primaryColor} />
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <h3 className="text-base font-bold text-white mb-5">Request Status</h3>
                    <DonutChart
                        data={[
                            { label: "Pending", value: overview?.pendingRequests || 0 },
                            { label: "Fulfilled", value: overview?.fulfilledRequests || 0 },
                            { label: "Canceled", value: overview?.canceledRequests || 0 },
                        ]}
                        colors={["#f59e0b", "#22c55e", "#64748b"]}
                    />
                </div>
            </div>

            {/* Performance & Urgency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <h3 className="text-base font-bold text-white mb-6">Key Performance</h3>
                    <div className="flex justify-around">
                        <ProgressRing value={overview?.fulfillmentRate || 0} label="Fulfillment Rate" color="#22c55e" />
                        <ProgressRing value={overview?.verificationRate || 0} label="Verification Rate" color={primaryColor} />
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center gap-2 mb-5">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <h3 className="text-base font-bold text-white">Pending by Urgency ({urgencyCount})</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <div className="text-3xl font-black text-emerald-400">{analytics?.urgencyStats?.normal || 0}</div>
                            <div className="text-xs font-bold text-emerald-400/70 mt-1">Normal</div>
                        </div>
                        <div className="text-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                            <div className="text-3xl font-black text-amber-400">{analytics?.urgencyStats?.urgent || 0}</div>
                            <div className="text-xs font-bold text-amber-400/70 mt-1">Urgent</div>
                        </div>
                        <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <div className="text-3xl font-black text-red-400">{analytics?.urgencyStats?.emergency || 0}</div>
                            <div className="text-xs font-bold text-red-400/70 mt-1">Emergency</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Location Stats */}
            {(analytics?.districtStats?.length || 0) > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                        <div className="flex items-center gap-2 mb-5">
                            <MapPin className="w-5 h-5 text-purple-400" />
                            <h3 className="text-base font-bold text-white">Top Districts</h3>
                        </div>
                        <BarChart
                            data={analytics?.districtStats?.map(d => ({ label: d.district || "", value: d.count })) || []}
                            maxValue={Math.max(...(analytics?.districtStats?.map(d => d.count) || [1]))}
                            color="#a78bfa"
                        />
                    </div>
                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                        <div className="flex items-center gap-2 mb-5">
                            <MapPin className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-base font-bold text-white">Top Upazilas</h3>
                        </div>
                        <BarChart
                            data={analytics?.upazilaStats?.map(u => ({ label: u.upazila || "", value: u.count })) || []}
                            maxValue={Math.max(...(analytics?.upazilaStats?.map(u => u.count) || [1]))}
                            color="#22d3ee"
                        />
                    </div>
                </div>
            )}

            {/* Recent Activity Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recent Donors */}
                <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-slate-800">
                        <h3 className="text-base font-bold text-white">Recent Donors</h3>
                        <Link href={`/${orgSlug}/dashboard/donors`} className="text-sm font-bold flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: primaryColor }}>
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="p-4">
                        {analytics?.recentDonors?.length === 0 ? (
                            <div className="text-center py-8">
                                <UserPlus className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                                <p className="text-sm text-slate-500">No donors yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {analytics?.recentDonors?.map((donor) => (
                                    <div key={donor._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                {donor.bloodGroup}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{donor.user?.name}</div>
                                                <div className="text-xs text-slate-500">{donor.user?.phone}</div>
                                            </div>
                                        </div>
                                        {donor.isVerified ? (
                                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20 uppercase tracking-wider">
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/20 uppercase tracking-wider">
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Requests */}
                <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-slate-800">
                        <h3 className="text-base font-bold text-white">Recent Requests</h3>
                        <Link href={`/${orgSlug}/dashboard/requests`} className="text-sm font-bold flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: primaryColor }}>
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="p-4">
                        {analytics?.recentRequests?.length === 0 ? (
                            <div className="text-center py-8">
                                <Droplet className="w-10 h-10 mx-auto mb-2 text-slate-700" />
                                <p className="text-sm text-slate-500">No requests yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {analytics?.recentRequests?.map((request) => (
                                    <div key={request._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${request.urgency === "emergency" ? "bg-red-500" :
                                                    request.urgency === "urgent" ? "bg-amber-500" : "bg-emerald-500"
                                                }`}>
                                                {request.bloodGroup}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{request.patientName}</div>
                                                <div className="text-xs text-slate-500 capitalize">{request.urgency}</div>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider border ${request.status === "fulfilled" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                request.status === "pending" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                                                    "bg-slate-700/50 text-slate-400 border-slate-600"
                                            }`}>
                                            {request.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
