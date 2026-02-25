"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DonorBadge, DonorPoints, EligibilityBadge } from "@/components/features/DonorBadge";
import { checkDonorEligibility } from "@/lib/gamification";
import { useOrganization } from "@/lib/context/OrganizationContext";
import {
    ArrowLeft,
    Phone,
    MapPin,
    Droplet,
    Calendar,
    Clock,
    Shield,
} from "lucide-react";
import Link from "next/link";

interface DonorData {
    _id: string;
    bloodGroup: string;
    district: string;
    upazila: string;
    village?: string;
    lastDonationDate?: string;
    isAvailable: boolean;
    isVerified: boolean;
    totalDonations: number;
    points: number;
    badges: string[];
    user: {
        name: string;
        phone: string;
    };
}

interface DonationRecord {
    _id: string;
    donationDate: string;
    bloodGroup: string;
    location?: string;
    recipientName?: string;
    notes?: string;
    pointsAwarded: number;
}

export default function DonorProfilePage({
    params,
}: {
    params: Promise<{ orgSlug: string; donorId: string }>;
}) {
    const { orgSlug, donorId } = use(params);
    const org = useOrganization();
    const primaryColor = org?.primaryColor || "#D32F2F";

    const [donor, setDonor] = useState<DonorData | null>(null);
    const [donations, setDonations] = useState<DonationRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch donor profile
                const donorRes = await fetch(`/api/donors?orgSlug=${orgSlug}&donorId=${donorId}`);
                if (donorRes.ok) {
                    const donorData = await donorRes.json();
                    const found = Array.isArray(donorData)
                        ? donorData.find((d: DonorData) => d._id === donorId)
                        : donorData;
                    setDonor(found || null);
                }

                // Fetch donation history
                const donationsRes = await fetch(`/api/donations?donorId=${donorId}`);
                if (donationsRes.ok) {
                    const donationData = await donationsRes.json();
                    setDonations(donationData);
                }
            } catch (error) {
                console.error("Error fetching donor data:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [orgSlug, donorId]);

    const eligibility = donor?.lastDonationDate
        ? checkDonorEligibility(new Date(donor.lastDonationDate))
        : checkDonorEligibility(null);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!donor) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Card className="bg-slate-900 border-slate-800 p-8 text-center">
                    <p className="text-slate-400 text-lg">Donor not found</p>
                    <Link href={`/${orgSlug}/donors`}>
                        <Button className="mt-4">Back to Donors</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Back button */}
                <Link
                    href={`/${orgSlug}/donors`}
                    className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-bold">Back to Donors</span>
                </Link>

                {/* Profile Header */}
                <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                    <div
                        className="h-2"
                        style={{ backgroundColor: primaryColor }}
                    />
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start gap-6">
                            {/* Avatar */}
                            <div
                                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {donor.user.name.charAt(0)}
                            </div>

                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-black text-white">{donor.user.name}</h1>
                                    {donor.isVerified && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                            <Shield className="w-3 h-3" /> Verified
                                        </span>
                                    )}
                                </div>

                                {/* Badges */}
                                <DonorBadge badges={donor.badges || []} size="md" />

                                {/* Stats */}
                                <DonorPoints
                                    points={donor.points || 0}
                                    totalDonations={donor.totalDonations || 0}
                                />
                            </div>

                            {/* Blood Group */}
                            <div
                                className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl text-white"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <Droplet className="w-6 h-6 mb-1" />
                                <span className="text-2xl font-black">{donor.bloodGroup}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contact & Location */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white text-sm flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                Contact & Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-300 text-sm">{donor.user.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-300 text-sm">
                                    {donor.upazila}, {donor.district}
                                    {donor.village ? `, ${donor.village}` : ""}
                                </span>
                            </div>
                            {donor.lastDonationDate && (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-300 text-sm">
                                        Last donated: {new Date(donor.lastDonationDate).toLocaleDateString()}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Eligibility */}
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                Donation Eligibility
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <EligibilityBadge
                                eligible={eligibility.eligible}
                                daysRemaining={eligibility.daysRemaining}
                                message={eligibility.message}
                            />
                            <p className="text-xs text-slate-500">{eligibility.message}</p>
                            {eligibility.nextEligibleDate && (
                                <p className="text-xs text-slate-500">
                                    Next eligible date: {eligibility.nextEligibleDate.toLocaleDateString()}
                                </p>
                            )}
                            <div className="p-3 rounded-xl bg-slate-800/50 text-xs text-slate-500">
                                <p className="font-bold text-slate-400 mb-1">ℹ️ Eligibility Rules</p>
                                <p>Minimum 56 days (8 weeks) between whole blood donations.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Donation History */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            🩸 Donation History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {donations.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <p className="text-lg">No donations recorded yet</p>
                                <p className="text-sm mt-1">Donations will appear here once recorded by an admin.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {donations.map((donation) => (
                                    <div
                                        key={donation._id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                                <Droplet className="w-5 h-5 text-red-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">
                                                    {donation.bloodGroup} Donation
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(donation.donationDate).toLocaleDateString()}
                                                    {donation.location ? ` • ${donation.location}` : ""}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-amber-400 font-black text-sm">
                                                +{donation.pointsAwarded} pts
                                            </span>
                                        </div>
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
