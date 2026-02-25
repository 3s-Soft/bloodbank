"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrganization } from "@/lib/context/OrganizationContext";
import { useSession } from "next-auth/react";
import {
    Calendar,
    MapPin,
    Clock,
    Users,
    Phone,
    Plus,
    Trash2,
    Edit2,
    X,
    Check,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";

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
}

export default function ManageEventsPage({
    params,
}: {
    params: Promise<{ orgSlug: string }>;
}) {
    const { orgSlug } = use(params);
    const org = useOrganization();
    const { data: session } = useSession();
    const primaryColor = org?.primaryColor || "#D32F2F";

    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        location: "",
        district: "",
        upazila: "",
        maxParticipants: "",
        contactNumber: "",
    });

    const fetchEvents = async () => {
        try {
            const res = await fetch(`/api/events?orgSlug=${orgSlug}`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [orgSlug]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user) return;

        const url = "/api/events";
        const method = editingId ? "PUT" : "POST";
        const body = {
            ...formData,
            orgSlug,
            createdBy: (session.user as any).id,
            eventId: editingId,
            maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined,
        };

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast.success(editingId ? "Event updated!" : "Event created!");
                setIsAdding(false);
                setEditingId(null);
                setFormData({
                    title: "",
                    description: "",
                    date: "",
                    location: "",
                    district: "",
                    upazila: "",
                    maxParticipants: "",
                    contactNumber: "",
                });
                fetchEvents();
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to save event");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    const handleDelete = async (eventId: string) => {
        if (!confirm("Are you sure you want to delete this event?")) return;

        try {
            const res = await fetch(`/api/events?eventId=${eventId}&performedBy=${(session?.user as any).id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                toast.success("Event deleted");
                fetchEvents();
            } else {
                toast.error("Failed to delete event");
            }
        } catch (error) {
            toast.error("An error occurred");
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Manage Events</h1>
                    <p className="text-slate-500 text-sm font-medium">Create and manage blood donation drives</p>
                </div>
                {!isAdding && !editingId && (
                    <Button
                        onClick={() => setIsAdding(true)}
                        style={{ backgroundColor: primaryColor }}
                        className="h-12 px-6 rounded-xl text-white font-bold hover:opacity-90 transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Event
                    </Button>
                )}
            </header>

            {(isAdding || editingId) && (
                <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                    <CardHeader className="border-b border-slate-800">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold text-white">
                                {editingId ? "Edit Event" : "New Event"}
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setIsAdding(false);
                                    setEditingId(null);
                                }}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Event Title</label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Annual Blood Drive 2024"
                                        required
                                        className="bg-slate-950 border-slate-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Date & Time</label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.date}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                        className="bg-slate-950 border-slate-800 text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the event, who can participate, etc."
                                    required
                                    className="w-full min-h-[100px] rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Location</label>
                                    <Input
                                        value={formData.location}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g. Dhaka Medical College"
                                        required
                                        className="bg-slate-950 border-slate-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">District</label>
                                    <Input
                                        value={formData.district}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, district: e.target.value })}
                                        placeholder="e.g. Dhaka"
                                        required
                                        className="bg-slate-950 border-slate-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Upazila (Optional)</label>
                                    <Input
                                        value={formData.upazila}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, upazila: e.target.value })}
                                        placeholder="e.g. Shahbagh"
                                        className="bg-slate-950 border-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Max Participants</label>
                                    <Input
                                        type="number"
                                        value={formData.maxParticipants}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, maxParticipants: e.target.value })}
                                        placeholder="e.g. 100"
                                        className="bg-slate-950 border-slate-800"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Contact Number</label>
                                    <Input
                                        value={formData.contactNumber}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, contactNumber: e.target.value })}
                                        placeholder="e.g. 01712345678"
                                        className="bg-slate-950 border-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsAdding(false);
                                        setEditingId(null);
                                    }}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    style={{ backgroundColor: primaryColor }}
                                    className="px-8 text-white font-bold"
                                >
                                    {editingId ? "Update Event" : "Create Event"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 gap-4">
                {events.length === 0 ? (
                    <div className="p-20 text-center rounded-3xl bg-slate-900/50 border border-slate-800 border-dashed">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-700" />
                        <p className="text-slate-500 font-medium">No events found. Start by creating your first drive.</p>
                    </div>
                ) : (
                    events.map((event) => (
                        <Card key={event._id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex gap-6">
                                        <div
                                            className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0"
                                            style={{ backgroundColor: `${primaryColor}15` }}
                                        >
                                            <span className="text-xl font-black text-white">
                                                {new Date(event.date).getDate()}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: primaryColor }}>
                                                {new Date(event.date).toLocaleString("default", { month: "short" })}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold text-white">{event.title}</h3>
                                                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase border border-blue-500/20">
                                                    {event.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 max-w-xl line-clamp-2">
                                                {event.description}
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    {event.location}, {event.district}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {event.maxParticipants && (
                                                    <span className="flex items-center gap-1.5">
                                                        <Users className="w-3.5 h-3.5" />
                                                        {event.maxParticipants} slots
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex md:flex-col justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setEditingId(event._id);
                                                setFormData({
                                                    title: event.title,
                                                    description: event.description,
                                                    date: new Date(event.date).toISOString().slice(0, 16),
                                                    location: event.location,
                                                    district: event.district,
                                                    upazila: event.upazila || "",
                                                    maxParticipants: event.maxParticipants?.toString() || "",
                                                    contactNumber: event.contactNumber || "",
                                                });
                                                window.scrollTo({ top: 0, behavior: "smooth" });
                                            }}
                                            className="border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                                        >
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(event._id)}
                                            className="text-red-500 hover:bg-red-500 hover:text-white"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
