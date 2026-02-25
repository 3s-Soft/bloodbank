"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import {
    Users,
    XCircle,
    Phone,
    MapPin,
    Loader2,
    ShieldCheck,
    CheckSquare,
    Square,
    Search,
    FileSpreadsheet,
    FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Donor {
    _id: string;
    bloodGroup: string;
    isVerified: boolean;
    isAvailable: boolean;
    village: string;
    upazila: string;
    district: string;
    lastDonationDate?: string;
    user?: {
        _id: string;
        name: string;
        phone: string;
        email?: string;
    };
    createdAt: string;
}

export default function DonorManagement() {
    const organization = useOrganization();
    const orgSlug = organization.slug;
    const primaryColor = organization.primaryColor || "#dc2626";
    const [donors, setDonors] = useState<Donor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unverified" | "verified">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDonors, setSelectedDonors] = useState<Set<string>>(new Set());
    const [isBulkProcessing, setIsBulkProcessing] = useState(false);

    const fetchDonors = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/donors?orgSlug=${orgSlug}`);
            const data = await res.json();
            setDonors(data);
        } catch (error) {
            console.error("Failed to fetch donors", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchDonors(); }, [orgSlug]);

    const handleVerify = async (donorId: string, currentStatus: boolean) => {
        try {
            const res = await fetch("/api/donors/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ donorId, isVerified: !currentStatus })
            });
            if (res.ok) {
                toast.success(currentStatus ? "Verification removed" : "Donor verified!");
                fetchDonors();
            }
        } catch (error) {
            toast.error("Failed to update verification status");
        }
    };

    const handleBulkVerify = async (verify: boolean) => {
        if (selectedDonors.size === 0) { toast.error("Please select donors first"); return; }
        setIsBulkProcessing(true);
        try {
            const promises = Array.from(selectedDonors).map(donorId =>
                fetch("/api/donors/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ donorId, isVerified: verify })
                })
            );
            await Promise.all(promises);
            toast.success(`${selectedDonors.size} donors ${verify ? "verified" : "unverified"} successfully!`);
            setSelectedDonors(new Set());
            fetchDonors();
        } catch (error) {
            toast.error("Some operations failed");
        } finally {
            setIsBulkProcessing(false);
        }
    };

    const exportToCSV = () => {
        if (filteredDonors.length === 0) { toast.error("No data to export"); return; }
        const headers = ["Name", "Phone", "Email", "Blood Group", "District", "Upazila", "Village", "Verified", "Available", "Last Donation", "Registered Date"];
        const rows = filteredDonors.map(d => [
            d.user?.name || "", d.user?.phone || "", d.user?.email || "", d.bloodGroup, d.district, d.upazila, d.village || "",
            d.isVerified ? "Yes" : "No", d.isAvailable ? "Yes" : "No",
            d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : "", new Date(d.createdAt).toLocaleDateString(),
        ]);
        const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${orgSlug}-donors-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        toast.success("CSV file downloaded!");
    };

    const exportToJSON = () => {
        const dataToExport = filteredDonors.map(d => ({
            name: d.user?.name, phone: d.user?.phone, email: d.user?.email, bloodGroup: d.bloodGroup,
            district: d.district, upazila: d.upazila, village: d.village, isVerified: d.isVerified,
            isAvailable: d.isAvailable, lastDonationDate: d.lastDonationDate, registeredAt: d.createdAt,
        }));
        if (dataToExport.length === 0) { toast.error("No data to export"); return; }
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${orgSlug}-donors-${new Date().toISOString().split("T")[0]}.json`;
        link.click();
        toast.success("JSON file downloaded!");
    };

    const filteredDonors = donors.filter(donor => {
        const matchesFilter = filter === "all" || (filter === "verified" && donor.isVerified) || (filter === "unverified" && !donor.isVerified);
        const matchesSearch = searchQuery === "" ||
            donor.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            donor.user?.phone?.includes(searchQuery) ||
            donor.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
            donor.district?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const toggleDonorSelection = (donorId: string) => {
        const s = new Set(selectedDonors);
        s.has(donorId) ? s.delete(donorId) : s.add(donorId);
        setSelectedDonors(s);
    };

    const toggleSelectAll = () => {
        setSelectedDonors(selectedDonors.size === filteredDonors.length ? new Set() : new Set(filteredDonors.map(d => d._id)));
    };

    const unverifiedCount = donors.filter(d => !d.isVerified).length;
    const verifiedCount = donors.filter(d => d.isVerified).length;

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white mb-1">Manage Donors</h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Verify and manage {donors.length} donors in {organization.name}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportToCSV} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                        <FileSpreadsheet className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                    <Button variant="outline" onClick={exportToJSON} className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                        <FileText className="w-4 h-4 mr-2" /> Export JSON
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Total Donors", value: donors.length, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Verified", value: verifiedCount, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Pending", value: unverifiedCount, color: "text-amber-400", bg: "bg-amber-500/10" },
                ].map((stat, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
                        <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, blood group..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-12 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-red-500/50 outline-none text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    {[
                        { key: "all", label: "All", count: donors.length },
                        { key: "unverified", label: "Pending", count: unverifiedCount },
                        { key: "verified", label: "Verified", count: verifiedCount },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key as any)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filter === f.key
                                    ? "text-white shadow-lg"
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                                }`}
                            style={filter === f.key ? { backgroundColor: primaryColor } : {}}
                        >
                            {f.label} ({f.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedDonors.size > 0 && (
                <div className="flex items-center justify-between p-4 rounded-xl text-white" style={{ backgroundColor: primaryColor }}>
                    <span className="font-bold text-sm">
                        {selectedDonors.size} donor{selectedDonors.size > 1 ? "s" : ""} selected
                    </span>
                    <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleBulkVerify(true)} disabled={isBulkProcessing}>
                            {isBulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4 mr-1" /> Verify All</>}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => handleBulkVerify(false)} disabled={isBulkProcessing}>
                            <XCircle className="w-4 h-4 mr-1" /> Unverify All
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setSelectedDonors(new Set())}>
                            Clear
                        </Button>
                    </div>
                </div>
            )}

            {/* Donor List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-500">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-slate-600" />
                    <p className="font-bold text-sm">Loading donors...</p>
                </div>
            ) : filteredDonors.length > 0 ? (
                <div className="space-y-2">
                    {/* Select All */}
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-800/50 rounded-xl border border-slate-800">
                        <button onClick={toggleSelectAll} className="p-1">
                            {selectedDonors.size === filteredDonors.length && filteredDonors.length > 0 ? (
                                <CheckSquare className="w-5 h-5" style={{ color: primaryColor }} />
                            ) : (
                                <Square className="w-5 h-5 text-slate-600" />
                            )}
                        </button>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {selectedDonors.size === filteredDonors.length && filteredDonors.length > 0 ? "Deselect all" : "Select all"}
                        </span>
                    </div>

                    {/* Cards */}
                    {filteredDonors.map((donor) => (
                        <div
                            key={donor._id}
                            className={`p-4 rounded-2xl bg-slate-900/50 border hover:border-slate-600 transition-all flex flex-col md:flex-row items-center justify-between gap-4 ${selectedDonors.has(donor._id) ? "border-red-500/50 bg-red-500/5" : "border-slate-800"
                                }`}
                        >
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <button onClick={() => toggleDonorSelection(donor._id)} className="p-1 shrink-0">
                                    {selectedDonors.has(donor._id) ? (
                                        <CheckSquare className="w-5 h-5" style={{ color: primaryColor }} />
                                    ) : (
                                        <Square className="w-5 h-5 text-slate-600" />
                                    )}
                                </button>

                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg text-white shrink-0"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {donor.bloodGroup}
                                </div>

                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="font-bold text-white truncate">{donor.user?.name}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${donor.isVerified
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                            }`}>
                                            {donor.isVerified ? "Verified" : "Pending"}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                        <span className="flex items-center">
                                            <MapPin className="w-3.5 h-3.5 mr-1 opacity-50" />
                                            {donor.upazila}, {donor.district}
                                        </span>
                                        <span className="flex items-center">
                                            <Phone className="w-3.5 h-3.5 mr-1 opacity-50" />
                                            {donor.user?.phone}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={donor.isVerified
                                        ? "border-slate-700 text-slate-400 hover:bg-slate-800"
                                        : "text-white border-0 hover:opacity-90"
                                    }
                                    style={!donor.isVerified ? { backgroundColor: primaryColor } : {}}
                                    onClick={() => handleVerify(donor._id, donor.isVerified)}
                                >
                                    {donor.isVerified ? (
                                        <><XCircle className="w-4 h-4 mr-1" /> Unverify</>
                                    ) : (
                                        <><ShieldCheck className="w-4 h-4 mr-1" /> Verify</>
                                    )}
                                </Button>
                                <a href={`tel:${donor.user?.phone}`}>
                                    <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:bg-slate-800">
                                        <Phone className="w-4 h-4" />
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
                    <h2 className="text-xl font-black text-white mb-2">
                        {searchQuery || filter !== "all" ? "No donors match your criteria" : "No donors registered yet"}
                    </h2>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">
                        {searchQuery || filter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Share your registration link to start building your donor network."}
                    </p>
                </div>
            )}
        </div>
    );
}
