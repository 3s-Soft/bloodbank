"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    user?: {
        _id: string;
        name: string;
        phone: string;
    };
}

type SortOption = "relevance" | "newest" | "lastDonation" | "name";

export default function DonorDiscovery() {
    const organization = useOrganization();
    const primaryColor = organization.primaryColor || "#D32F2F";

    // Filter states
    const [bloodGroup, setBloodGroup] = useState("");
    const [district, setDistrict] = useState("");
    const [upazila, setUpazila] = useState("");
    const [onlyAvailable, setOnlyAvailable] = useState(true);
    const [onlyVerified, setOnlyVerified] = useState(false);
    const [sortBy, setSortBy] = useState<SortOption>("relevance");

    // Data states
    const [donors, setDonors] = useState<Donor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    const fetchDonors = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                orgSlug: organization.slug,
            });
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

    useEffect(() => {
        fetchDonors();
    }, [bloodGroup, district, upazila, organization.slug]);

    // Apply client-side filters and sorting
    const filteredAndSortedDonors = donors
        .filter(donor => {
            if (onlyAvailable && !donor.isAvailable) return false;
            if (onlyVerified && !donor.isVerified) return false;
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "lastDonation":
                    // Donors who donated longest ago first (more eligible)
                    const aDate = a.lastDonationDate ? new Date(a.lastDonationDate).getTime() : 0;
                    const bDate = b.lastDonationDate ? new Date(b.lastDonationDate).getTime() : 0;
                    return aDate - bDate;
                case "name":
                    return (a.user?.name || "").localeCompare(b.user?.name || "");
                case "relevance":
                default:
                    // Verified first, then available, then by verification
                    if (a.isVerified !== b.isVerified) return b.isVerified ? 1 : -1;
                    if (a.isAvailable !== b.isAvailable) return b.isAvailable ? 1 : -1;
                    return 0;
            }
        });

    const clearAllFilters = () => {
        setBloodGroup("");
        setDistrict("");
        setUpazila("");
        setOnlyAvailable(true);
        setOnlyVerified(false);
        setSortBy("relevance");
    };

    const activeFilterCount = [
        bloodGroup,
        district,
        upazila,
        !onlyAvailable ? "available" : "",
        onlyVerified ? "verified" : "",
    ].filter(Boolean).length;

    const sortOptions: { value: SortOption; label: string; icon: any }[] = [
        { value: "relevance", label: "Best Match", icon: Sparkles },
        { value: "newest", label: "Newest First", icon: Clock },
        { value: "lastDonation", label: "Donation Eligibility", icon: Calendar },
        { value: "name", label: "Name A-Z", icon: SortAsc },
    ];

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-neutral-900 dark:text-white mb-3">
                    Find Blood Donors
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 font-medium max-w-2xl">
                    Search our network of {donors.length} registered donors in {organization.name}.
                    Use filters to find the perfect match for your needs.
                </p>
            </div>

            {/* Blood Group Quick Select */}
            <div className="mb-8">
                <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3">
                    Select Blood Group
                </label>
                <BloodGroupSelect
                    value={bloodGroup}
                    onChange={setBloodGroup}
                    className="max-w-md"
                />
            </div>

            {/* Filter Toggle & Sort (Mobile) */}
            <div className="flex flex-wrap gap-3 mb-6">
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span
                            className="ml-2 w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {activeFilterCount}
                        </span>
                    )}
                </Button>

                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="h-10 pl-4 pr-10 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm font-medium appearance-none cursor-pointer"
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <SortAsc className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>

                {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        <X className="w-4 h-4 mr-1" />
                        Clear All
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
                    <Card className="border-none shadow-sm dark:bg-neutral-800">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-neutral-900 dark:text-white mb-6 uppercase text-xs tracking-widest flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Filters
                            </h3>

                            <div className="space-y-5">
                                {/* Location Filters */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        District
                                    </label>
                                    <LocationSelect
                                        type="district"
                                        value={district}
                                        onChange={(val) => {
                                            setDistrict(val);
                                            setUpazila(""); // Reset upazila when district changes
                                        }}
                                        placeholder="Any District"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                        Upazila
                                    </label>
                                    <LocationSelect
                                        type="upazila"
                                        value={upazila}
                                        onChange={setUpazila}
                                        district={district}
                                        placeholder="Any Upazila"
                                    />
                                </div>

                                {/* Availability Toggle */}
                                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-700">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={onlyAvailable}
                                            onChange={(e) => setOnlyAvailable(e.target.checked)}
                                            className="w-5 h-5 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Available only
                                        </span>
                                    </label>
                                </div>

                                {/* Verified Toggle */}
                                <div>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={onlyVerified}
                                            onChange={(e) => setOnlyVerified(e.target.checked)}
                                            className="w-5 h-5 rounded border-neutral-300 text-red-600 focus:ring-red-500"
                                        />
                                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                            Verified donors only
                                        </span>
                                    </label>
                                </div>

                                {/* Apply Button */}
                                <Button
                                    className="w-full text-white mt-4"
                                    style={{ backgroundColor: primaryColor }}
                                    onClick={() => setShowFilters(false)}
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    Apply Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card className="border-none shadow-sm dark:bg-neutral-800">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-neutral-900 dark:text-white mb-4 uppercase text-xs tracking-widest">
                                Quick Stats
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Total Donors</span>
                                    <span className="font-bold text-neutral-900 dark:text-white">{donors.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Available Now</span>
                                    <span className="font-bold text-green-600">{donors.filter(d => d.isAvailable).length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Verified</span>
                                    <span className="font-bold text-blue-600">{donors.filter(d => d.isVerified).length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500">Showing</span>
                                    <span className="font-bold" style={{ color: primaryColor }}>{filteredAndSortedDonors.length}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Grid */}
                <div className="lg:col-span-3">
                    {/* Results Count */}
                    <div className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
                        Showing <span className="font-bold text-neutral-900 dark:text-white">{filteredAndSortedDonors.length}</span> donors
                        {bloodGroup && <span> with blood group <span className="font-bold" style={{ color: primaryColor }}>{bloodGroup}</span></span>}
                        {district && <span> in <span className="font-bold">{district}</span></span>}
                        {upazila && <span>, <span className="font-bold">{upazila}</span></span>}
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p className="font-medium">Finding potential life savers...</p>
                        </div>
                    ) : filteredAndSortedDonors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredAndSortedDonors.map((donor) => (
                                <Card
                                    key={donor._id}
                                    className="border-none shadow-sm hover:shadow-md transition-all overflow-hidden group dark:bg-neutral-800"
                                >
                                    <div
                                        className="h-1.5 w-full"
                                        style={{ backgroundColor: donor.isAvailable ? primaryColor : "#9CA3AF" }}
                                    />
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div
                                                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white"
                                                    style={{ backgroundColor: primaryColor }}
                                                >
                                                    {donor.bloodGroup}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="font-bold text-neutral-900 dark:text-white text-lg">
                                                            {donor.user?.name}
                                                        </h3>
                                                        {donor.isVerified && (
                                                            <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                        {donor.lastDonationDate
                                                            ? `Last donated: ${new Date(donor.lastDonationDate).toLocaleDateString()}`
                                                            : "First time donor"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${donor.isAvailable
                                                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                                                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-400"
                                                }`}>
                                                {donor.isAvailable ? "Available" : "Unavailable"}
                                            </div>
                                        </div>

                                        <div className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                                            <MapPin className="w-4 h-4 mr-2 opacity-50" />
                                            {[donor.village, donor.upazila, donor.district].filter(Boolean).join(", ")}
                                        </div>

                                        <div className="flex space-x-3">
                                            <a href={`tel:${donor.user?.phone}`} className="flex-grow">
                                                <Button
                                                    variant="outline"
                                                    className="w-full group-hover:border-red-200 dark:group-hover:border-red-800 transition-colors"
                                                >
                                                    <Phone className="w-4 h-4 mr-2" />
                                                    Call Now
                                                </Button>
                                            </a>
                                            <Button variant="outline" className="px-3">
                                                <Droplet className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-800 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-700">
                            <div className="w-16 h-16 bg-white dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <Users className="w-8 h-8 text-neutral-300 dark:text-neutral-500" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                                No Donors Found
                            </h3>
                            <p className="text-neutral-500 dark:text-neutral-400 mb-4">
                                Try adjusting your filters or clearing the search.
                            </p>
                            <Button variant="outline" onClick={clearAllFilters}>
                                Clear All Filters
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
