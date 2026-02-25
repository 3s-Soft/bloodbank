"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/lib/context/OrganizationContext";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
    Calendar,
    MapPin,
    Clock,
    Users,
    Phone,
    Plus,
    Filter,
    ChevronRight,
    Settings,
} from "lucide-react";

interface EventData {
    _id: string;
    title: string;
    description: string;
    date: string;
    endDate?: string;
    location: string;
    district: string;
    upazila?: string;
    status: string;
    maxParticipants?: number;
    contactNumber?: string;
    createdBy?: { name: string };
}

export default function EventsPage({
    params,
}: {
    params: Promise<{ orgSlug: string }>;
}) {
    const { orgSlug } = use(params);
    const org = useOrganization();
    const { data: session } = useSession();
    const primaryColor = org?.primaryColor || "#D32F2F";

    const userRole = (session?.user as any)?.role;
    const canManage = userRole === "admin" || userRole === "super_admin" || userRole === "volunteer";

    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("upcoming");

    useEffect(() => {
        async function fetchEvents() {
            try {
                const upcoming = filter === "upcoming" ? "&upcoming=true" : "";
                const status = filter === "completed" ? "&status=completed" : "";
                const res = await fetch(
                    `/api/events?orgSlug=${orgSlug}${upcoming}${status}`
                );
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data);
                }
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, [orgSlug, filter]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case "upcoming":
                return "bg-blue-500/20 text-blue-400 border-blue-500/30";
            case "ongoing":
                return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
            case "completed":
                return "bg-slate-500/20 text-slate-400 border-slate-500/30";
            case "canceled":
                return "bg-red-500/20 text-red-400 border-red-500/30";
            default:
                return "bg-slate-500/20 text-slate-400 border-slate-500/30";
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return {
            day: date.getDate(),
            month: date.toLocaleString("default", { month: "short" }),
            year: date.getFullYear(),
            time: date.toLocaleTimeString("default", { hour: "2-digit", minute: "2-digit" }),
            full: date.toLocaleDateString("default", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        };
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
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-3 relative">
                    {canManage && (
                        <div className="absolute top-0 right-0">
                            <Link href={`/${orgSlug}/dashboard/events`}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Manage Events
                                </Button>
                            </Link>
                        </div>
                    )}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 mx-auto">
                        <Calendar className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white">Blood Donation Events</h1>
                    <p className="text-slate-400">
                        Join upcoming blood donation drives and save lives
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 justify-center">
                    {(["upcoming", "all", "completed"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f
                                ? "text-white shadow-lg"
                                : "bg-slate-800 text-slate-400 hover:text-white"
                                }`}
                            style={filter === f ? { backgroundColor: primaryColor } : {}}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Events List */}
                {events.length === 0 ? (
                    <Card className="bg-slate-900 border-slate-800">
                        <CardContent className="py-16 text-center">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                            <h3 className="text-xl font-bold text-slate-400 mb-2">
                                No {filter !== "all" ? filter : ""} events
                            </h3>
                            <p className="text-slate-500">
                                Check back later for upcoming blood donation drives.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {events.map((event) => {
                            const dateInfo = formatDate(event.date);
                            return (
                                <Card
                                    key={event._id}
                                    className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
                                >
                                    <CardContent className="p-0">
                                        <div className="flex">
                                            {/* Date sidebar */}
                                            <div
                                                className="flex flex-col items-center justify-center px-6 py-4 min-w-[100px]"
                                                style={{ backgroundColor: `${primaryColor}15` }}
                                            >
                                                <span className="text-3xl font-black text-white">
                                                    {dateInfo.day}
                                                </span>
                                                <span className="text-sm font-bold uppercase tracking-widest" style={{ color: primaryColor }}>
                                                    {dateInfo.month}
                                                </span>
                                                <span className="text-xs text-slate-500">{dateInfo.year}</span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-lg font-black text-white">
                                                                {event.title}
                                                            </h3>
                                                            <span
                                                                className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(event.status)}`}
                                                            >
                                                                {event.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-400 line-clamp-2">
                                                            {event.description}
                                                        </p>
                                                        <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {event.location}, {event.district}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {dateInfo.time}
                                                            </span>
                                                            {event.maxParticipants && (
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="w-3 h-3" />
                                                                    Max {event.maxParticipants}
                                                                </span>
                                                            )}
                                                            {event.contactNumber && (
                                                                <span className="flex items-center gap-1">
                                                                    <Phone className="w-3 h-3" />
                                                                    {event.contactNumber}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
