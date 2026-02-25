"use client";

import { useState, useEffect } from "react";
import {
    Bike,
    Truck,
    Navigation,
    Shield,
    CheckCircle2,
    ArrowLeft,
    Save,
    MapPin
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function RiderProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const orgSlug = params.orgSlug as string;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        vehicleType: "motorbike",
        vehiclePlate: "",
        coverageDistricts: ["Dhaka"],
        coverageUpazila: [""],
    });

    // In a real app, we'd fetch the existing profile here

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // We need the organizationId. In a real scenario, this would be in the session or context.
            // For now, let's assume the API can handle it or we fetch it.
            // This is a simplified version for the demo.
            const res = await fetch("/api/riders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizationId: "6798bdffae4757ca59424751", // Mock ID for demo
                    ...formData,
                    coverageUpazila: formData.coverageUpazila.filter(u => u !== "")
                }),
            });

            if (!res.ok) throw new Error("Failed to save profile");

            toast.success("Rider profile updated!");
            router.push(`/${orgSlug}/rider`);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <header className="mb-8">
                <Link
                    href={`/${orgSlug}/rider`}
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4 text-sm font-bold"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </Link>
                <h1 className="text-3xl font-black text-white tracking-tight">Rider Profile</h1>
                <p className="text-slate-500 font-medium">Configure your vehicle and transport coverage area.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Vehicle Section */}
                <div className="p-8 rounded-[2rem] bg-slate-900 border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <Bike className="w-5 h-5 text-red-500" />
                        </div>
                        <h2 className="text-xl font-black text-white">Vehicle Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Vehicle Type</label>
                            <select
                                value={formData.vehicleType}
                                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-slate-800 border-none text-sm text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all"
                            >
                                <option value="bicycle">Bicycle</option>
                                <option value="motorbike">Motorbike / Scooter</option>
                                <option value="rickshaw">Rickshaw</option>
                                <option value="car">Car</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Vehicle Plate (Optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. DHAKA-METRO-KA-1234"
                                value={formData.vehiclePlate}
                                onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-slate-800 border-none text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-red-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Coverage Section */}
                <div className="p-8 rounded-[2rem] bg-slate-900 border border-white/5 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Navigation className="w-5 h-5 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-black text-white">Coverage Area</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Primary District</label>
                            <input
                                type="text"
                                value={formData.coverageDistricts[0]}
                                onChange={(e) => setFormData({ ...formData, coverageDistricts: [e.target.value] })}
                                className="w-full h-12 px-4 rounded-xl bg-slate-800 border-none text-sm text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Primary Upazila / Areas</label>
                            <div className="grid grid-cols-1 gap-2">
                                {formData.coverageUpazila.map((up, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter Upazila name"
                                            value={up}
                                            onChange={(e) => {
                                                const newUp = [...formData.coverageUpazila];
                                                newUp[idx] = e.target.value;
                                                setFormData({ ...formData, coverageUpazila: newUp });
                                            }}
                                            className="flex-1 h-12 px-4 rounded-xl bg-slate-800 border-none text-sm text-white focus:ring-2 focus:ring-red-500/50 outline-none transition-all"
                                        />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, coverageUpazila: [...formData.coverageUpazila, ""] })}
                                    className="text-xs font-bold text-red-500 hover:text-red-400 mt-1 flex items-center gap-1 w-fit"
                                >
                                    + Add another area
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Section */}
                <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                    <Shield className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-white mb-1">Volunteer Verification</h4>
                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                            Once you save your profile, our team will review your details. Verified riders receive priority status and access to higher-urgency missions.
                        </p>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="h-14 w-full rounded-2xl bg-emerald-600 text-white text-base font-black hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : <><Save className="w-5 h-5" /> Save Rider Profile</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
