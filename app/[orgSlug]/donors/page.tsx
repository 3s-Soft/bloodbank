"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { LocationSelect, BloodGroupSelect } from "@/components/ui/location-select";
import {
    Search,
    Droplet,
    MapPin,
    Phone,
    CheckCircle2,
    Loader2,
    Users,
    Filter,
    SortAsc,
    Clock,
    Calendar,
    X,
    Sparkles,
    Navigation,
    ChevronDown,
    ChevronUp,
    Shield,
} from "lucide-react";
import { useState, useEffect } from "react";

interface Donor {
    _id: string;
    bloodGroup: string;
    isVerified: boolean;
    isAvailable: boolean;
    village?: string;
    upazila: string;
    district: string;
    lastDonationDate?: string;
    createdAt: string;
    user?: { _id: string; name: string; phone: string };
}

type SortOption = "relevance" | "newest" | "lastDonation" | "name" | "location";

export default function DonorDiscovery() {
    const organization = useOrganization();
    const primaryColor = organization.primaryColor || "#dc2626";

    const [bloodGroup, setBloodGroup] = useState("");
    const [district, setDistrict] = useState("");
    const [upazila, setUpazila] = useState("");
    const [onlyAvailable, setOnlyAvailable] = useState(true);
    const [onlyVerified, setOnlyVerified] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>("relevance");
    const [donors, setDonors] = useState<Donor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const fetchDonors = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ orgSlug: organization.slug });
            if (bloodGroup) params.append("bloodGroup", bloodGroup);
            if (district) params.append("district", district);
            if (upazila) params.append("upazila", upazila);
            const res = await fetch(`/api/donors?${params.toString()}`);
            const data = await res.json();
            setDonors(data);
        } catch (error) {
            console.error("Failed to fetch donors", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDonors(); }, [bloodGroup, district, upazila, organization.slug]);

    const getLocationScore = (donor: Donor): number => {
        let score = 0;
        if (upazila && donor.upazila === upazila) score += 100;
        if (district && donor.district === district) score += 50;
        if (!district && !upazila) {
            if (donor.isVerified) score += 20;
            if (donor.isAvailable) score += 30;
        }
        return score;
    };

    const filteredAndSortedDonors = donors
        .filter(d => {
            if (onlyAvailable && !d.isAvailable) return false;
            if (onlyVerified && !d.isVerified) return false;
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "location": {
                    const diff = getLocationScore(b) - getLocationScore(a);
                    return diff !== 0 ? diff : (b.isVerified ? 1 : 0) - (a.isVerified ? 1 : 0);
                }
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "lastDonation": {
                    const aD = a.lastDonationDate ? new Date(a.lastDonationDate).getTime() : 0;
                    const bD = b.lastDonationDate ? new Date(b.lastDonationDate).getTime() : 0;
                    return aD - bD;
                }
                case "name":
                    return (a.user?.name || "").localeCompare(b.user?.name || "");
                default:
                    if (a.isVerified !== b.isVerified) return b.isVerified ? 1 : -1;
                    if (a.isAvailable !== b.isAvailable) return b.isAvailable ? 1 : -1;
                    return getLocationScore(b) - getLocationScore(a);
            }
        });

    const clearAllFilters = () => {
        setBloodGroup(""); setDistrict(""); setUpazila("");
        setOnlyAvailable(true); setOnlyVerified(false); setSortBy("relevance");
    };

    const activeFilterCount = [bloodGroup, district, upazila, !onlyAvailable ? "a" : "", onlyVerified ? "v" : ""].filter(Boolean).length;
    const availableCount = donors.filter(d => d.isAvailable).length;
    const verifiedCount = donors.filter(d => d.isVerified).length;

    const sortOptions: { value: SortOption; label: string }[] = [
        { value: "relevance", label: "Best Match" },
        { value: "location", label: "Nearest First" },
        { value: "newest", label: "Newest First" },
        { value: "lastDonation", label: "Donation Eligibility" },
        { value: "name", label: "Name A-Z" },
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="container mx-auto px-4 py-10 md:py-14">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${primaryColor}15` }}>
                                <Users className="w-6 h-6" style={{ color: primaryColor }} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                {organization.name}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                            Find Blood Donors
                        </h1>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-2xl">
                            Search our network of {donors.length} registered donors. Use filters to find the perfect match.
                        </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-3 shrink-0">
                        <div className="px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-center min-w-[80px]">
                            <div className="text-2xl font-black text-white">{donors.length}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total</div>
                        </div>
                        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center min-w-[80px]">
                            <div className="text-2xl font-black text-emerald-400">{availableCount}</div>
                            <div className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest">Available</div>
                        </div>
                        <div className="px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center min-w-[80px]">
                            <div className="text-2xl font-black text-blue-400">{verifiedCount}</div>
                            <div className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest">Verified</div>
                        </div>
                    </div>
                </div>

                {/* Blood Group Selection — Full Width */}
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
                        Select Blood Group
                    </label>
                    <BloodGroupSelect value={bloodGroup} onChange={setBloodGroup} />
                </div>

                {/* Filters Bar — Horizontal */}
                <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-4 mb-6">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Sort */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="h-10 pl-4 pr-10 rounded-xl border border-slate-700 bg-slate-800 text-sm font-medium appearance-none cursor-pointer text-white outline-none focus:border-slate-600"
                            >
                                {sortOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <SortAsc className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                        </div>

                        {/* Toggles */}
                        <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:border-slate-600 transition-colors">
                            <input
                                type="checkbox"
                                checked={onlyAvailable}
                                onChange={(e) => setOnlyAvailable(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-700"
                            />
                            <span className="text-xs font-bold text-slate-300">Available Only</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:border-slate-600 transition-colors">
                            <input
                                type="checkbox"
                                checked={onlyVerified}
                                onChange={(e) => setOnlyVerified(e.target.checked)}
                                className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-700"
                            />
                            <span className="text-xs font-bold text-slate-300">Verified Only</span>
                        </label>

                        {/* Advanced Toggle */}
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:border-slate-600 transition-colors text-xs font-bold text-slate-400"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Location
                            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {activeFilterCount > 0 && (
                            <button onClick={clearAllFilters} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-white transition-colors ml-auto">
                                <X className="w-3.5 h-3.5" /> Clear All
                            </button>
                        )}
                    </div>

                    {/* Location Filters — Expandable */}
                    {showAdvanced && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">District</label>
                                <LocationSelect type="district" value={district} onChange={(val) => { setDistrict(val); setUpazila(""); }} placeholder="Any District" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Upazila</label>
                                <LocationSelect type="upazila" value={upazila} onChange={setUpazila} district={district} placeholder="Any Upazila" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-5 text-sm text-slate-500">
                    Showing <span className="font-bold text-white">{filteredAndSortedDonors.length}</span> donors
                    {bloodGroup && <span> with blood group <span className="font-bold" style={{ color: primaryColor }}>{bloodGroup}</span></span>}
                    {district && <span> in <span className="font-bold text-white">{district}</span></span>}
                    {upazila && <span>, <span className="font-bold text-white">{upazila}</span></span>}
                    {sortBy === "location" && (district || upazila) && (
                        <span className="ml-2 text-emerald-400">
                            <Navigation className="w-3 h-3 inline mr-1" /> Sorted by proximity
                        </span>
                    )}
                </div>

                {/* Donor Grid — Full Width */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-slate-600" />
                        <p className="font-bold text-xs uppercase tracking-widest">Finding potential life savers...</p>
                    </div>
                ) : filteredAndSortedDonors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredAndSortedDonors.map((donor) => (
                            <div
                                key={donor._id}
                                className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden hover:border-slate-600 transition-all group"
                            >
                                {/* Color bar */}
                                <div className="h-1 w-full" style={{ backgroundColor: donor.isAvailable ? primaryColor : "#475569" }} />

                                <div className="p-5">
                                    {/* Top: Blood Group + Name */}
                                    <div className="flex items-start gap-3 mb-3">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-base text-white shadow-lg shrink-0"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            {donor.bloodGroup}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="font-bold text-white text-sm truncate">{donor.user?.name}</h3>
                                                {donor.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                                            </div>
                                            <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                                {donor.lastDonationDate
                                                    ? `Last: ${new Date(donor.lastDonationDate).toLocaleDateString()}`
                                                    : "First time donor"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${donor.isAvailable
                                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                : "bg-slate-700/50 text-slate-500 border border-slate-600"
                                            }`}>
                                            {donor.isAvailable ? "Available" : "Unavailable"}
                                        </div>
                                        {donor.isVerified && (
                                            <div className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                <Shield className="w-3 h-3 inline mr-0.5" /> Verified
                                            </div>
                                        )}
                                    </div>

                                    {/* Location */}
                                    <div className="flex items-center text-[11px] text-slate-500 mb-4">
                                        <MapPin className="w-3 h-3 mr-1.5 opacity-50 shrink-0" />
                                        <span className="truncate">{[donor.village, donor.upazila, donor.district].filter(Boolean).join(", ")}</span>
                                        {sortBy === "location" && (district === donor.district || upazila === donor.upazila) && (
                                            <span className="ml-1.5 text-emerald-400 font-bold shrink-0">• Near</span>
                                        )}
                                    </div>

                                    {/* CTA */}
                                    <a href={`tel:${donor.user?.phone}`} className="block">
                                        <Button
                                            variant="outline"
                                            className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 group-hover:border-slate-600 transition-all font-bold text-xs"
                                        >
                                            <Phone className="w-3.5 h-3.5 mr-1.5" /> Call Now
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 border-2 border-dashed border-slate-800 rounded-2xl">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-black text-white mb-2">No Donors Found</h3>
                        <p className="text-sm text-slate-500 mb-5 max-w-sm mx-auto">
                            Try adjusting your filters or clearing the search.
                        </p>
                        <Button variant="outline" onClick={clearAllFilters} className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800">
                            Clear All Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
