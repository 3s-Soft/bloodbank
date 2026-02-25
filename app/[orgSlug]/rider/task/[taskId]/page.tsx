"use client";

import { useState, useEffect } from "react";
import {
    MapPin,
    Clock,
    Phone,
    ArrowLeft,
    CheckCircle2,
    AlertCircle,
    Bike,
    Building2,
    MessageSquare,
    Navigation,
    Droplet,
    Package
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function TaskDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { orgSlug, taskId } = params;

    // In a real app, we'd fetch the task details here
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        // Mock fetch for demo
        const mockTask = {
            id: taskId,
            status: "pending",
            sourceName: "Dhaka Central Blood Bank",
            sourceAddress: "House 12, Road 5, Dhanmondi, Dhaka",
            destinationName: "United Hospital",
            destinationAddress: "Plot 15, Road 71, Gulshan, Dhaka",
            contactPhone: "01712345678",
            bloodGroup: "O-",
            urgency: "High",
            notes: "Please call upon arrival at Dhanmondi. Sample is already cross-matched."
        };
        setTimeout(() => {
            setTask(mockTask);
            setLoading(false);
        }, 800);
    }, [taskId]);

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            const res = await fetch("/api/deliveries", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskId, status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update status");

            setTask({ ...task, status: newStatus });
            toast.success(`Mission status: ${newStatus.replace("_", " ")}`);

            if (newStatus === "delivered") {
                router.push(`/${orgSlug}/rider`);
            }
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading mission details...</div>;
    if (!task) return <div className="p-8 text-center text-red-500 font-bold">Mission not found.</div>;

    const statusColors: any = {
        pending: "bg-amber-500/10 text-amber-500",
        accepted: "bg-blue-500/10 text-blue-500",
        picked_up: "bg-purple-500/10 text-purple-500",
        delivered: "bg-emerald-500/10 text-emerald-500",
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <header className="mb-8">
                <Link
                    href={`/${orgSlug}/rider`}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4 text-sm font-bold"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Task Feed
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Mission Details</h1>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[task.status]}`}>
                                {task.status.replace("_", " ")}
                            </span>
                            <span className="text-slate-500 text-xs font-bold border-l border-white/10 pl-3">TASK-ID: {taskId?.toString().slice(-6).toUpperCase()}</span>
                        </div>
                    </div>
                    {task.status === "pending" && (
                        <button
                            disabled={updating}
                            onClick={() => updateStatus("accepted")}
                            className="h-14 px-10 rounded-2xl bg-white text-black text-base font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-3 shadow-xl"
                        >
                            {updating ? "Accepting..." : <><CheckCircle2 className="w-5 h-5" /> Accept Mission</>}
                        </button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Mission Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 space-y-8">
                        {/* Route info */}
                        <div className="relative">
                            <div className="absolute left-6 top-8 bottom-8 w-px bg-dashed border-l border-white/10" />

                            <div className="flex gap-4 relative">
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
                                    <MapPin className="w-6 h-6 text-red-500" />
                                </div>
                                <div className="pt-1">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Pick up from</div>
                                    <h3 className="text-xl font-bold text-white mb-2">{task.sourceName}</h3>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">{task.sourceAddress}</p>
                                </div>
                            </div>

                            <div className="h-12" />

                            <div className="flex gap-4 relative">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <Navigation className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div className="pt-1">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Deliver to</div>
                                    <h3 className="text-xl font-bold text-white mb-2">{task.destinationName}</h3>
                                    <p className="text-slate-400 text-sm font-medium leading-relaxed">{task.destinationAddress}</p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info Grid */}
                        <div className="pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Blood Type</div>
                                <div className="flex items-center gap-2 text-white font-black">
                                    <Droplet className="w-4 h-4 text-red-500" />
                                    {task.bloodGroup}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Urgency</div>
                                <div className="text-orange-500 font-black">{task.urgency}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Est. Time</div>
                                <div className="text-white font-bold">45-60 min</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Distance</div>
                                <div className="text-white font-bold">12.4 km</div>
                            </div>
                        </div>

                        {/* Notes */}
                        {task.notes && (
                            <div className="p-6 rounded-2xl bg-slate-950/50 border border-white/5">
                                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs mb-3">
                                    <MessageSquare className="w-4 h-4" /> Dispatcher Notes
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed italic">{task.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-slate-900 border border-white/5">
                        <h4 className="text-sm font-bold text-white mb-4">Contact Person</h4>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                                <Phone className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <div className="text-white font-black">{task.contactPhone}</div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Immediate Hotline</div>
                            </div>
                        </div>
                        <button className="w-full h-12 rounded-xl bg-emerald-500/10 text-emerald-500 font-black hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2">
                            Call Dispatcher
                        </button>
                    </div>

                    {task.status !== "pending" && (
                        <div className="p-6 rounded-3xl bg-slate-900 border border-white/5 space-y-3">
                            <h4 className="text-sm font-bold text-white mb-4">Mission Actions</h4>

                            {task.status === "accepted" && (
                                <button
                                    onClick={() => updateStatus("picked_up")}
                                    className="w-full h-12 rounded-xl bg-blue-500 text-white font-black hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <Package className="w-4 h-4" /> Confirm Pickup
                                </button>
                            )}

                            {task.status === "picked_up" && (
                                <button
                                    onClick={() => updateStatus("delivered")}
                                    className="w-full h-14 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
                                >
                                    <CheckCircle2 className="w-5 h-5" /> Confirm Delivery
                                </button>
                            )}

                            <button className="w-full h-12 rounded-xl border border-white/5 text-slate-500 font-bold hover:bg-white/5 transition-all text-xs">
                                Having Trouble? Report Issue
                            </button>
                        </div>
                    )}

                    <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                        <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest mb-3">
                            <AlertCircle className="w-4 h-4" /> Safety Protocol
                        </div>
                        <ul className="space-y-2 text-[10px] text-slate-500 font-bold leading-relaxed">
                            <li>• Keep blood unit away from direct sunlight</li>
                            <li>• Maintain temperature (2-6°C if possible)</li>
                            <li>• Ensure the unit seal remains intact</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
