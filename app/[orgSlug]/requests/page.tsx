"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import {
    Droplet,
    Calendar,
    MapPin,
    Phone,
    AlertTriangle,
    Plus,
    Loader2,
    Heart,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function BloodRequestsListing() {
    const organization = useOrganization();
    const orgSlug = organization.slug;
    const primaryColor = organization.primaryColor || "#dc2626";

    const [requests, setRequests] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/requests?orgSlug=${orgSlug}`);
                const data = await res.json();
                setRequests(data);
            } catch (error) {
                console.error("Failed to fetch requests", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRequests();
    }, [orgSlug]);

    const urgencyConfig: Record<string, { bg: string; border: string; badge: string; glow?: string }> = {
        emergency: {
            bg: "bg-red-500/5",
            border: "border-red-500/30",
            badge: "bg-red-500 text-white",
            glow: "shadow-[0_0_30px_rgba(239,68,68,0.12)]",
        },
        urgent: {
            bg: "bg-amber-500/5",
            border: "border-amber-500/20",
            badge: "bg-amber-500 text-white",
        },
        normal: {
            bg: "bg-slate-900/50",
            border: "border-slate-800",
            badge: "bg-slate-700 text-slate-300",
        },
    };

    const emergencyCount = requests.filter(r => r.urgency === "emergency").length;
    const urgentCount = requests.filter(r => r.urgency === "urgent").length;

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="container mx-auto px-4 py-10 md:py-14">
                {/* Hero Header */}
                <div className="mb-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${primaryColor}15` }}>
                                    <Heart className="w-6 h-6" style={{ color: primaryColor }} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                    {organization.name}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
                                Blood Requests
                            </h1>
                            <p className="text-slate-400 font-medium leading-relaxed text-lg">
                                Active requests in your community. Your small act of kindness can save a life.
                            </p>
                        </div>
                        <Link href={`/${orgSlug}/requests/new`}>
                            <Button
                                size="lg"
                                className="text-white shadow-lg hover:opacity-90 transition-opacity px-8 h-12 text-base font-bold"
                                style={{ backgroundColor: primaryColor }}
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Post New Request
                            </Button>
                        </Link>
                    </div>

                    {/* Quick Stats Bar */}
                    {!isLoading && requests.length > 0 && (
                        <div className="flex gap-3 mt-8">
                            <div className="px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                                <span className="text-2xl font-black text-white">{requests.length}</span>
                                <span className="text-xs text-slate-500 ml-2 font-bold">Active</span>
                            </div>
                            {emergencyCount > 0 && (
                                <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <span className="text-2xl font-black text-red-400">{emergencyCount}</span>
                                    <span className="text-xs text-red-400/70 ml-2 font-bold">Emergency</span>
                                </div>
                            )}
                            {urgentCount > 0 && (
                                <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                    <span className="text-2xl font-black text-amber-400">{urgentCount}</span>
                                    <span className="text-xs text-amber-400/70 ml-2 font-bold">Urgent</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Request Cards Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-28 text-slate-500">
                        <div className="relative mb-6">
                            <Loader2 className="w-10 h-10 animate-spin text-slate-600" />
                        </div>
                        <p className="font-bold text-xs uppercase tracking-widest">Finding active requests nearby...</p>
                    </div>
                ) : requests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {requests.map((request) => {
                            const uConfig = urgencyConfig[request.urgency] || urgencyConfig.normal;
                            const isEmergency = request.urgency === "emergency";

                            return (
                                <div
                                    key={request._id}
                                    className={`rounded-2xl border overflow-hidden transition-all hover:border-slate-600 group ${uConfig.bg} ${uConfig.border} ${uConfig.glow || ""}`}
                                >
                                    {/* Color top bar */}
                                    <div className="h-1 w-full" style={{
                                        backgroundColor: isEmergency ? "#ef4444" : request.urgency === "urgent" ? "#f59e0b" : primaryColor
                                    }} />

                                    <div className="p-5">
                                        {/* Emergency Badge */}
                                        {isEmergency && (
                                            <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 w-fit">
                                                <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />
                                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">Critical</span>
                                            </div>
                                        )}

                                        {/* Blood Group + Patient Name */}
                                        <div className="flex items-center gap-3.5 mb-4">
                                            <div
                                                className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg shrink-0"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                {request.bloodGroup}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-lg font-black text-white tracking-tight truncate">
                                                    {request.patientName}
                                                </h3>
                                                <div className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mt-0.5 ${uConfig.badge}`}>
                                                    {request.urgency}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-2 mb-5">
                                            <div className="flex items-center text-sm text-slate-500">
                                                <MapPin className="w-3.5 h-3.5 mr-2 opacity-50 shrink-0" />
                                                <span className="truncate">{request.location}, {request.upazila}</span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-500">
                                                <Calendar className="w-3.5 h-3.5 mr-2 opacity-50 shrink-0" />
                                                Needed: {new Date(request.requiredDate).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            <a href={`tel:${request.contactNumber}`} className="flex-grow">
                                                <Button
                                                    className="w-full text-white font-bold hover:opacity-90 transition-opacity"
                                                    style={{ backgroundColor: primaryColor }}
                                                >
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    Contact
                                                </Button>
                                            </a>
                                            <a href={`tel:${request.contactNumber}`}>
                                                <Button
                                                    variant="outline"
                                                    className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white px-3"
                                                >
                                                    <Phone className="w-4 h-4" />
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-24 border-2 border-dashed border-slate-800 rounded-2xl">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Droplet className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">No Active Requests</h3>
                        <p className="text-sm text-slate-500 max-w-sm mx-auto">
                            Everything looks calm in {organization.name} right now. Check back later.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
