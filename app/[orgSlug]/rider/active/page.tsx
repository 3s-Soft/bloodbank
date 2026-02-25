import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/lib/db/mongodb";
import { DeliveryTask, TaskStatus } from "@/lib/models/DeliveryTask";
import {
    Bike,
    MapPin,
    Navigation,
    Phone,
    Clock,
    Droplet,
    AlertCircle,
    ArrowRight,
    Search
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ActiveDeliveryPage({
    params,
}: {
    params: Promise<{ orgSlug: string }>;
}) {
    const { orgSlug } = await params;
    const session = (await getServerSession(authOptions as any)) as any;

    if (!session) redirect("/login");

    await connectToDatabase();

    // Find any task assigned to this rider that is NOT delivered or cancelled
    const activeTask = await DeliveryTask.findOne({
        rider: (session.user as any)?.id,
        status: { $in: [TaskStatus.ACCEPTED, TaskStatus.PICKED_UP, TaskStatus.IN_TRANSIT] }
    }).populate("bloodRequest").lean();

    if (!activeTask) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center">
                <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
                    <Search className="w-10 h-10 text-slate-700" />
                </div>
                <h1 className="text-3xl font-black text-white mb-4">No Active Missions</h1>
                <p className="text-slate-400 font-medium mb-12 leading-relaxed">
                    You aren't currently transporting any blood units.
                    Check the task feed to find new missions.
                </p>
                <Link
                    href={`/${orgSlug}/rider`}
                    className="h-14 px-10 rounded-2xl bg-white text-black font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-3 inline-flex"
                >
                    Find Missions <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Active Delivery</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-500 text-xs font-black uppercase tracking-widest leading-none">In Progress</span>
                    </div>
                </div>
                <Link
                    href={`/${orgSlug}/rider/task/${activeTask._id}`}
                    className="h-12 px-6 rounded-xl bg-slate-900 border border-white/10 text-white font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                    Update Status <ArrowRight className="w-4 h-4" />
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Route Information */}
                <div className="p-8 rounded-[2.5rem] bg-slate-900 border border-white/5 space-y-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Route Tracking</div>
                        <div className="px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase">Alpha V1</div>
                    </div>

                    <div className="relative pl-12 space-y-16">
                        <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-800 border-l border-dashed border-slate-700" />

                        <div className="relative">
                            <div className="absolute -left-[2.15rem] top-0 w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-red-500" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Pickup</div>
                                <h3 className="text-lg font-black text-white leading-tight">{(activeTask as any).sourceName}</h3>
                                <p className="text-xs text-slate-500 font-medium mt-1">{(activeTask as any).sourceAddress}</p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -left-[2.15rem] top-0 w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                                <Navigation className="w-4 h-4 text-emerald-500" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Destination</div>
                                <h3 className="text-lg font-black text-white leading-tight">{(activeTask as any).destinationName}</h3>
                                <p className="text-xs text-slate-500 font-medium mt-1">{(activeTask as any).destinationAddress}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mission Status Widget */}
                <div className="space-y-6">
                    <div className="p-8 rounded-[2rem] bg-slate-950 border border-white/5 flex flex-col justify-between aspect-square md:aspect-auto">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                    <Droplet className="w-8 h-8 text-red-500 fill-current" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Transporting Unit</div>
                                    <div className="text-2xl font-black text-white tracking-tighter">O Negative (High Priority)</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                                    <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">Est. Remaining</div>
                                    <div className="text-lg font-black text-white flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-500" /> 18 min
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5">
                                    <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">Distance</div>
                                    <div className="text-lg font-black text-white flex items-center gap-2">
                                        <Bike className="w-4 h-4 text-blue-500" /> 4.2 km
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5">
                            <a
                                href={`tel:${(activeTask as any).contactPhone}`}
                                className="h-14 w-full rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20"
                            >
                                <Phone className="w-5 h-5" /> Call Hospital Hotline
                            </a>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-amber-500/70 text-[10px] font-bold leading-relaxed">
                            Remember to keep the blood unit upright and shielded from heat.
                            If you encounter any delays, notify the dispatcher immediately.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
