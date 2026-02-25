import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getRiderProfile, getAvailableTasks } from "@/lib/riderUtils";
import {
    Bike,
    Package,
    MapPin,
    Droplet,
    Clock,
    ChevronRight,
    Search,
    Filter,
    ArrowRight,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RiderDashboard({
    params,
}: {
    params: Promise<{ orgSlug: string }>;
}) {
    const { orgSlug } = await params;
    const session = (await getServerSession(authOptions as any)) as any;

    if (!session) redirect("/login");

    const profile = await getRiderProfile((session.user as any)?.id);
    const availableTasks = await getAvailableTasks();

    if (!profile) {
        // Show registration / onboarding for riders
        return (
            <div className="max-w-xl mx-auto py-12 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-red-500/20">
                    <Bike className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-white mb-4">Become a Blood Rider</h1>
                <p className="text-slate-400 font-medium mb-12 leading-relaxed">
                    Join our transport network and help move life-saving blood units to hospitals.
                    You'll choose your own areas and availability.
                </p>
                <Link
                    href={`/${orgSlug}/rider/profile`}
                    className="h-14 px-10 rounded-2xl bg-red-500 text-white font-black hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-500/20"
                >
                    Complete Rider Profile <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 rounded-3xl bg-slate-900 border border-white/5">
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Total Deliveries</div>
                    <div className="text-4xl font-black text-white">{(profile as any).totalDeliveries || 0}</div>
                </div>
                <div className="p-6 rounded-3xl bg-slate-900 border border-white/5">
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Reliability Score</div>
                    <div className="text-4xl font-black text-emerald-500">{(profile as any).reliabilityScore || 100}%</div>
                </div>
                <div className="p-6 rounded-3xl bg-slate-900 border border-white/5">
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Status</div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="text-xl font-black text-white capitalize">{(profile as any).availabilityStatus}</div>
                    </div>
                </div>
            </div>

            {/* Tasks Feed Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Available Missions</h2>
                    <p className="text-slate-500 text-sm font-medium">Blood units waiting for transport near you.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {availableTasks.length === 0 ? (
                <div className="p-12 text-center rounded-[3rem] border-2 border-dashed border-white/5 bg-slate-900/30">
                    <Droplet className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-400">No active requests currently</h3>
                    <p className="text-slate-600 text-sm">We'll notify you when a transport mission is available.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {availableTasks.map((task: any) => (
                        <div key={task._id} className="p-6 rounded-3xl bg-slate-900 border border-white/5 hover:border-red-500/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Package className="w-24 h-24" />
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                                            <Droplet className="w-5 h-5 text-red-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white">Emergency Blood Transport</h4>
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                <Clock className="w-3.5 h-3.5" /> Post 15 mins ago
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Pickup From</div>
                                            <div className="flex items-start gap-2 text-sm font-bold text-slate-300">
                                                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                                {task.sourceName}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Deliver To</div>
                                            <div className="flex items-start gap-2 text-sm font-bold text-slate-300">
                                                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                {task.destinationName}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 min-w-[160px]">
                                    <Link
                                        href={`/${orgSlug}/rider/task/${task._id}`}
                                        className="h-12 w-full rounded-xl bg-white text-black font-black hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        Accept Task <ChevronRight className="w-4 h-4" />
                                    </Link>
                                    <button className="h-12 w-full rounded-xl border border-white/10 text-slate-400 font-bold hover:bg-white/5 transition-all">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Location Alert */}
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-blue-500/80 text-xs font-medium leading-relaxed">
                    Showing tasks within **25km** of your primary coverage area. You can update your coverage settings in the Profile tab.
                </p>
            </div>
        </div>
    );
}
