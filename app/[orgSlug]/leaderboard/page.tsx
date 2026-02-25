"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganization } from "@/lib/context/OrganizationContext";
import { DonorBadge } from "@/components/features/DonorBadge";
import { Trophy, Medal, Crown, MapPin, Droplet, Filter } from "lucide-react";
import Link from "next/link";

interface LeaderboardEntry {
    _id: string;
    bloodGroup: string;
    district: string;
    upazila: string;
    totalDonations: number;
    points: number;
    badges: string[];
    isVerified: boolean;
    user: {
        name: string;
    };
}

export default function LeaderboardPage({
    params,
}: {
    params: Promise<{ orgSlug: string }>;
}) {
    const { orgSlug } = use(params);
    const org = useOrganization();
    const primaryColor = org?.primaryColor || "#D32F2F";

    const [donors, setDonors] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDistrict, setFilterDistrict] = useState("");

    useEffect(() => {
        async function fetchLeaderboard() {
            try {
                const res = await fetch(`/api/donors?orgSlug=${orgSlug}`);
                if (res.ok) {
                    const data = await res.json();
                    // Sort by points descending
                    const sorted = data.sort(
                        (a: LeaderboardEntry, b: LeaderboardEntry) =>
                            (b.points || 0) - (a.points || 0)
                    );
                    setDonors(sorted);
                }
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLeaderboard();
    }, [orgSlug]);

    const filteredDonors = filterDistrict
        ? donors.filter((d) =>
            d.district.toLowerCase().includes(filterDistrict.toLowerCase())
        )
        : donors;

    const getPositionIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Crown className="w-6 h-6 text-yellow-400" />;
            case 1:
                return <Medal className="w-6 h-6 text-slate-300" />;
            case 2:
                return <Medal className="w-6 h-6 text-amber-600" />;
            default:
                return (
                    <span className="w-6 h-6 flex items-center justify-center text-sm font-black text-slate-500">
                        {index + 1}
                    </span>
                );
        }
    };

    const getPositionBg = (index: number) => {
        switch (index) {
            case 0:
                return "bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40";
            case 1:
                return "bg-slate-400/5 border-slate-400/20 hover:border-slate-400/40";
            case 2:
                return "bg-amber-600/5 border-amber-600/20 hover:border-amber-600/40";
            default:
                return "bg-slate-800/50 border-slate-700 hover:border-slate-600";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 mx-auto">
                        <Trophy className="w-8 h-8 text-amber-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white">Donor Leaderboard</h1>
                    <p className="text-slate-400">
                        Top donors ranked by contributions and engagement
                    </p>
                </div>

                {/* Filter */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <Filter className="w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filter by district..."
                                value={filterDistrict}
                                onChange={(e) => setFilterDistrict(e.target.value)}
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                            />
                            {filterDistrict && (
                                <button
                                    onClick={() => setFilterDistrict("")}
                                    className="text-xs text-slate-400 hover:text-white"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Leaderboard */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-400" />
                            Rankings ({filteredDonors.length} donors)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredDonors.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-lg">No donors found</p>
                                <p className="text-sm mt-1">Donors will appear here once they register.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredDonors.map((donor, index) => (
                                    <Link
                                        key={donor._id}
                                        href={`/${orgSlug}/donors/${donor._id}`}
                                    >
                                        <div
                                            className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${getPositionBg(index)}`}
                                        >
                                            {/* Position */}
                                            <div className="flex-shrink-0 w-10 flex justify-center">
                                                {getPositionIcon(index)}
                                            </div>

                                            {/* Avatar */}
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0"
                                                style={{
                                                    backgroundColor:
                                                        index === 0 ? "#EAB308" : index === 1 ? "#94A3B8" : index === 2 ? "#D97706" : primaryColor,
                                                }}
                                            >
                                                {donor.user?.name?.charAt(0) || "?"}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white text-sm truncate">
                                                        {donor.user?.name || "Unknown"}
                                                    </span>
                                                    {donor.isVerified && (
                                                        <span className="text-emerald-400 text-xs">✓</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Droplet className="w-3 h-3" />
                                                        {donor.bloodGroup}
                                                    </span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {donor.district}
                                                    </span>
                                                </div>
                                                <div className="mt-1.5">
                                                    <DonorBadge badges={donor.badges || []} size="sm" showLabel={false} />
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-lg font-black text-amber-400">
                                                    {(donor.points || 0).toLocaleString()}
                                                </p>
                                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                                                    points
                                                </p>
                                                <p className="text-xs text-red-400 font-bold mt-1">
                                                    {donor.totalDonations || 0} donations
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
