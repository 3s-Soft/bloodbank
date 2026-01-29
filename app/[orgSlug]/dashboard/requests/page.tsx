"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Droplet,
    CheckCircle2,
    XCircle,
    Phone,
    MapPin,
    Loader2,
    Calendar,
    AlertTriangle,
    Search,
    FileSpreadsheet,
    FileText,
    Clock,
    CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface BloodRequest {
    _id: string;
    patientName: string;
    bloodGroup: string;
    location: string;
    district: string;
    upazila: string;
    urgency: "normal" | "urgent" | "emergency";
    requiredDate: string;
    contactNumber: string;
    additionalNotes?: string;
    status: "pending" | "fulfilled" | "canceled";
    createdAt: string;
}

export default function RequestManagement() {
    const organization = useOrganization();
    const orgSlug = organization.slug;
    const primaryColor = organization.primaryColor || "#D32F2F";
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [allRequests, setAllRequests] = useState<BloodRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "fulfilled" | "canceled">("pending");
    const [urgencyFilter, setUrgencyFilter] = useState<"all" | "normal" | "urgent" | "emergency">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            // Fetch all requests
            const [pending, fulfilled, canceled] = await Promise.all([
                fetch(`/api/requests?orgSlug=${orgSlug}&status=pending`).then(r => r.json()),
                fetch(`/api/requests?orgSlug=${orgSlug}&status=fulfilled`).then(r => r.json()),
                fetch(`/api/requests?orgSlug=${orgSlug}&status=canceled`).then(r => r.json()),
            ]);
            const all = [...pending, ...fulfilled, ...canceled];
            setAllRequests(all);
            setRequests(all);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [orgSlug]);

    const handleStatusUpdate = async (requestId: string, newStatus: string) => {
        try {
            const res = await fetch("/api/requests/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, status: newStatus })
            });
            if (res.ok) {
                toast.success(`Request marked as ${newStatus}`);
                fetchRequests();
            }
        } catch (error) {
            toast.error("Failed to update request status");
        }
    };

    // Filter requests
    const filteredRequests = allRequests.filter(request => {
        const matchesStatus = statusFilter === "all" || request.status === statusFilter;
        const matchesUrgency = urgencyFilter === "all" || request.urgency === urgencyFilter;
        const matchesSearch = searchQuery === "" ||
            request.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.contactNumber.includes(searchQuery) ||
            request.location.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesUrgency && matchesSearch;
    });

    // Stats
    const stats = {
        total: allRequests.length,
        pending: allRequests.filter(r => r.status === "pending").length,
        fulfilled: allRequests.filter(r => r.status === "fulfilled").length,
        canceled: allRequests.filter(r => r.status === "canceled").length,
        emergency: allRequests.filter(r => r.urgency === "emergency" && r.status === "pending").length,
    };

    // Export to CSV
    const exportToCSV = () => {
        if (filteredRequests.length === 0) {
            toast.error("No data to export");
            return;
        }

        const headers = ["Patient Name", "Blood Group", "Location", "District", "Upazila", "Urgency", "Required Date", "Contact", "Status", "Notes", "Created"];
        const rows = filteredRequests.map(r => [
            r.patientName,
            r.bloodGroup,
            r.location,
            r.district,
            r.upazila,
            r.urgency,
            new Date(r.requiredDate).toLocaleDateString(),
            r.contactNumber,
            r.status,
            r.additionalNotes || "",
            new Date(r.createdAt).toLocaleDateString(),
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${orgSlug}-requests-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        toast.success("CSV file downloaded!");
    };

    // Export to JSON
    const exportToJSON = () => {
        if (filteredRequests.length === 0) {
            toast.error("No data to export");
            return;
        }

        const blob = new Blob([JSON.stringify(filteredRequests, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${orgSlug}-requests-${new Date().toISOString().split("T")[0]}.json`;
        link.click();
        toast.success("JSON file downloaded!");
    };

    const urgencyColors = {
        normal: { bg: "bg-green-100", text: "text-green-700", badge: "bg-green-600" },
        urgent: { bg: "bg-orange-100", text: "text-orange-700", badge: "bg-orange-500" },
        emergency: { bg: "bg-red-100", text: "text-red-700", badge: "bg-red-600" },
    };

    const statusColors = {
        pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
        fulfilled: { bg: "bg-green-100", text: "text-green-700" },
        canceled: { bg: "bg-neutral-100", text: "text-neutral-600" },
    };

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 mb-2">Blood Requests</h1>
                    <p className="text-neutral-500 font-medium">
                        Manage {stats.total} requests in {organization.name}.
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-black text-neutral-900">{stats.total}</div>
                        <div className="text-xs text-neutral-500 font-medium">Total</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-black text-yellow-600">{stats.pending}</div>
                        <div className="text-xs text-neutral-500 font-medium">Pending</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-black text-green-600">{stats.fulfilled}</div>
                        <div className="text-xs text-neutral-500 font-medium">Fulfilled</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-black text-neutral-500">{stats.canceled}</div>
                        <div className="text-xs text-neutral-500 font-medium">Canceled</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-red-50">
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-black text-red-600">{stats.emergency}</div>
                        <div className="text-xs text-red-600 font-medium">Emergency</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by patient, blood group, contact..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: "all", label: "All", icon: null },
                        { key: "pending", label: "Pending", icon: Clock },
                        { key: "fulfilled", label: "Fulfilled", icon: CheckCircle },
                        { key: "canceled", label: "Canceled", icon: XCircle },
                    ].map((f) => {
                        const Icon = f.icon;
                        return (
                            <button
                                key={f.key}
                                onClick={() => setStatusFilter(f.key as any)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${statusFilter === f.key
                                        ? "text-white"
                                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                    }`}
                                style={statusFilter === f.key ? { backgroundColor: primaryColor } : {}}
                            >
                                {Icon && <Icon className="w-4 h-4" />}
                                {f.label}
                            </button>
                        );
                    })}
                </div>

                {/* Urgency Filter */}
                <div className="flex gap-2">
                    {[
                        { key: "all", label: "All Urgency" },
                        { key: "emergency", label: "🔴 Emergency" },
                        { key: "urgent", label: "🟠 Urgent" },
                        { key: "normal", label: "🟢 Normal" },
                    ].map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setUrgencyFilter(f.key as any)}
                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${urgencyFilter === f.key
                                    ? "bg-neutral-900 text-white"
                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Request List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-40 text-neutral-400">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="font-bold">Loading requests...</p>
                </div>
            ) : filteredRequests.length > 0 ? (
                <div className="space-y-4">
                    {filteredRequests.map((request) => (
                        <Card
                            key={request._id}
                            className={`border-none shadow-sm hover:shadow-md transition-all overflow-hidden ${request.urgency === "emergency" && request.status === "pending" ? "ring-2 ring-red-500" : ""
                                }`}
                        >
                            <CardContent className="p-0 flex flex-col md:flex-row">
                                {/* Left Badge */}
                                <div className={`w-full md:w-32 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-neutral-100 ${urgencyColors[request.urgency].bg
                                    }`}>
                                    <div
                                        className="text-3xl font-black mb-2"
                                        style={{ color: primaryColor }}
                                    >
                                        {request.bloodGroup}
                                    </div>
                                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide text-white ${urgencyColors[request.urgency].badge
                                        } ${request.urgency === "emergency" && request.status === "pending" ? "animate-pulse" : ""}`}>
                                        {request.urgency}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-grow p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-black text-neutral-900 text-xl">{request.patientName}</h3>
                                                {request.urgency === "emergency" && request.status === "pending" && (
                                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                                )}
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[request.status].bg} ${statusColors[request.status].text}`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-neutral-500">
                                                <div className="flex items-center">
                                                    <MapPin className="w-4 h-4 mr-1.5 opacity-40" />
                                                    {request.location}, {request.upazila}
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1.5 opacity-40" />
                                                    {new Date(request.requiredDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <Phone className="w-4 h-4 mr-1.5 opacity-40" />
                                                    <a href={`tel:${request.contactNumber}`} className="hover:underline">
                                                        {request.contactNumber}
                                                    </a>
                                                </div>
                                            </div>
                                            {request.additionalNotes && (
                                                <p className="text-sm text-neutral-400 mt-2 italic">
                                                    "{request.additionalNotes}"
                                                </p>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {request.status === "pending" && (
                                            <div className="flex gap-2 shrink-0">
                                                <Button
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => handleStatusUpdate(request._id, "fulfilled")}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                                    Mark Fulfilled
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="text-neutral-400 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleStatusUpdate(request._id, "canceled")}
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                        {request.status !== "pending" && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleStatusUpdate(request._id, "pending")}
                                            >
                                                Reopen
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 border-4 border-dashed border-neutral-100 rounded-3xl">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Droplet className="w-10 h-10 text-neutral-300" />
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900 mb-2">
                        {searchQuery || statusFilter !== "all" || urgencyFilter !== "all"
                            ? "No requests match your criteria"
                            : "No blood requests yet"}
                    </h2>
                    <p className="text-neutral-500 max-w-sm mx-auto font-medium">
                        {searchQuery || statusFilter !== "all" || urgencyFilter !== "all"
                            ? "Try adjusting your search or filters"
                            : "Your community is currently doing well!"}
                    </p>
                </div>
            )}
        </div>
    );
}
