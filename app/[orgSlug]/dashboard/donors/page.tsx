"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Users,
    CheckCircle2,
    XCircle,
    Phone,
    MapPin,
    Loader2,
    ShieldCheck,
    Download,
    CheckSquare,
    Square,
    Search,
    Filter,
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
    const primaryColor = organization.primaryColor || "#D32F2F";
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

    useEffect(() => {
        fetchDonors();
    }, [orgSlug]);

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

    // Bulk verification
    const handleBulkVerify = async (verify: boolean) => {
        if (selectedDonors.size === 0) {
            toast.error("Please select donors first");
            return;
        }

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

    // Export to CSV
    const exportToCSV = () => {
        const dataToExport = filteredDonors;
        if (dataToExport.length === 0) {
            toast.error("No data to export");
            return;
        }

        const headers = ["Name", "Phone", "Email", "Blood Group", "District", "Upazila", "Village", "Verified", "Available", "Last Donation", "Registered Date"];
        const rows = dataToExport.map(d => [
            d.user?.name || "",
            d.user?.phone || "",
            d.user?.email || "",
            d.bloodGroup,
            d.district,
            d.upazila,
            d.village || "",
            d.isVerified ? "Yes" : "No",
            d.isAvailable ? "Yes" : "No",
            d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : "",
            new Date(d.createdAt).toLocaleDateString(),
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${orgSlug}-donors-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        toast.success("CSV file downloaded!");
    };

    // Export to JSON
    const exportToJSON = () => {
        const dataToExport = filteredDonors.map(d => ({
            name: d.user?.name,
            phone: d.user?.phone,
            email: d.user?.email,
            bloodGroup: d.bloodGroup,
            district: d.district,
            upazila: d.upazila,
            village: d.village,
            isVerified: d.isVerified,
            isAvailable: d.isAvailable,
            lastDonationDate: d.lastDonationDate,
            registeredAt: d.createdAt,
        }));

        if (dataToExport.length === 0) {
            toast.error("No data to export");
            return;
        }

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${orgSlug}-donors-${new Date().toISOString().split("T")[0]}.json`;
        link.click();
        toast.success("JSON file downloaded!");
    };

    // Filter donors
    const filteredDonors = donors.filter(donor => {
        const matchesFilter = filter === "all" ||
            (filter === "verified" && donor.isVerified) ||
            (filter === "unverified" && !donor.isVerified);

        const matchesSearch = searchQuery === "" ||
            donor.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            donor.user?.phone?.includes(searchQuery) ||
            donor.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
            donor.district?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    // Toggle donor selection
    const toggleDonorSelection = (donorId: string) => {
        const newSelected = new Set(selectedDonors);
        if (newSelected.has(donorId)) {
            newSelected.delete(donorId);
        } else {
            newSelected.add(donorId);
        }
        setSelectedDonors(newSelected);
    };

    // Select all filtered donors
    const toggleSelectAll = () => {
        if (selectedDonors.size === filteredDonors.length) {
            setSelectedDonors(new Set());
        } else {
            setSelectedDonors(new Set(filteredDonors.map(d => d._id)));
        }
    };

    const unverifiedCount = donors.filter(d => !d.isVerified).length;
    const verifiedCount = donors.filter(d => d.isVerified).length;

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 mb-2">Manage Donors</h1>
                    <p className="text-neutral-500 font-medium tracking-tight">
                        Verify and manage {donors.length} donors in {organization.name}.
                    </p>
                </div>

                {/* Export Buttons */}
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportToCSV}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button variant="outline" onClick={exportToJSON}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export JSON
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-black text-neutral-900">{donors.length}</div>
                        <div className="text-xs text-neutral-500 font-medium">Total Donors</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-black text-green-600">{verifiedCount}</div>
                        <div className="text-xs text-neutral-500 font-medium">Verified</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 text-center">
                        <div className="text-3xl font-black text-orange-600">{unverifiedCount}</div>
                        <div className="text-xs text-neutral-500 font-medium">Pending</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone, blood group..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-red-500 outline-none"
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
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f.key
                                ? "text-white"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                }`}
                            style={filter === f.key ? { backgroundColor: primaryColor } : {}}
                        >
                            {f.label} ({f.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedDonors.size > 0 && (
                <div
                    className="flex items-center justify-between p-4 mb-6 rounded-xl text-white"
                    style={{ backgroundColor: primaryColor }}
                >
                    <span className="font-bold">
                        {selectedDonors.size} donor{selectedDonors.size > 1 ? "s" : ""} selected
                    </span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleBulkVerify(true)}
                            disabled={isBulkProcessing}
                        >
                            {isBulkProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4 mr-1" />
                                    Verify All
                                </>
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleBulkVerify(false)}
                            disabled={isBulkProcessing}
                        >
                            <XCircle className="w-4 h-4 mr-1" />
                            Unverify All
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedDonors(new Set())}
                        >
                            Clear Selection
                        </Button>
                    </div>
                </div>
            )}

            {/* Donor List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 text-neutral-400">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="font-bold">Loading donors...</p>
                </div>
            ) : filteredDonors.length > 0 ? (
                <div className="space-y-3">
                    {/* Select All Header */}
                    <div className="flex items-center gap-3 px-4 py-2 bg-neutral-100 rounded-xl">
                        <button onClick={toggleSelectAll} className="p-1">
                            {selectedDonors.size === filteredDonors.length && filteredDonors.length > 0 ? (
                                <CheckSquare className="w-5 h-5" style={{ color: primaryColor }} />
                            ) : (
                                <Square className="w-5 h-5 text-neutral-400" />
                            )}
                        </button>
                        <span className="text-sm font-medium text-neutral-600">
                            {selectedDonors.size === filteredDonors.length && filteredDonors.length > 0
                                ? "Deselect all"
                                : "Select all"}
                        </span>
                    </div>

                    {/* Donor Cards */}
                    {filteredDonors.map((donor) => (
                        <Card
                            key={donor._id}
                            className={`border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white ${selectedDonors.has(donor._id) ? "ring-2" : ""
                                }`}
                            style={selectedDonors.has(donor._id) ? { ["--tw-ring-color" as any]: primaryColor } : {}}
                        >
                            <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleDonorSelection(donor._id)}
                                        className="p-1 shrink-0"
                                    >
                                        {selectedDonors.has(donor._id) ? (
                                            <CheckSquare className="w-5 h-5" style={{ color: primaryColor }} />
                                        ) : (
                                            <Square className="w-5 h-5 text-neutral-300" />
                                        )}
                                    </button>

                                    {/* Blood Group Badge */}
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shrink-0"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {donor.bloodGroup}
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-neutral-900 truncate">{donor.user?.name}</h3>
                                            <Badge
                                                label={donor.isVerified ? "Verified" : "Pending"}
                                                color={donor.isVerified ? "green" : "orange"}
                                            />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-500">
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

                                {/* Actions */}
                                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                    <Button
                                        variant={donor.isVerified ? "outline" : "secondary"}
                                        size="sm"
                                        className={!donor.isVerified ? "text-white" : ""}
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
                                        <Button variant="outline" size="sm">
                                            <Phone className="w-4 h-4" />
                                        </Button>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 border-4 border-dashed border-neutral-100 rounded-3xl">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-neutral-300" />
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900 mb-2">
                        {searchQuery || filter !== "all" ? "No donors match your criteria" : "No donors registered yet"}
                    </h2>
                    <p className="text-neutral-500 max-w-sm mx-auto font-medium">
                        {searchQuery || filter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Share your registration link to start building your donor network."}
                    </p>
                </div>
            )}
        </div>
    );
}

function Badge({ label, color }: { label: string, color: string }) {
    const styleMap: Record<string, string> = {
        green: "bg-green-100 text-green-700",
        orange: "bg-orange-100 text-orange-700",
    };
    const styles = styleMap[color] || "bg-neutral-100 text-neutral-700";

    return (
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${styles}`}>
            {label}
        </div>
    );
}
