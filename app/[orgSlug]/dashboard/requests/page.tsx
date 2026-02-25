"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
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
    const primaryColor = organization.primaryColor || "#dc2626";
    const [requests, setRequests] = useState<BloodRequest[]>([]);
    const [allRequests, setAllRequests] = useState<BloodRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "fulfilled" | "canceled">("pending");
    const [urgencyFilter, setUrgencyFilter] = useState<"all" | "normal" | "urgent" | "emergency">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
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

    useEffect(() => { fetchRequests(); }, [orgSlug]);

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

    const stats = {
        total: allRequests.length,
        pending: allRequests.filter(r => r.status === "pending").length,
        fulfilled: allRequests.filter(r => r.status === "fulfilled").length,
        canceled: allRequests.filter(r => r.status === "canceled").length,
        emergency: allRequests.filter(r => r.urgency === "emergency" && r.status === "pending").length,
    };

    const exportToCSV = () => {
        if (filteredRequests.length === 0) { toast.error("No data to export"); return; }
        const headers = ["Patient Name", "Blood Group", "Location", "District", "Upazila", "Urgency", "Required Date", "Contact", "Status", "Notes", "Created"];
        const rows = filteredRequests.map(r => [
            r.patientName, r.bloodGroup, r.location, r.district, r.upazila, r.urgency,
            new Date(r.requiredDate).toLocaleDateString(), r.contactNumber, r.status,
            r.additionalNotes || "", new Date(r.createdAt).toLocaleDateString(),
        ]);
        const csvContent = [headers.join(","), ...rows.map(row => row.map(cell => `"${cell}"`).join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${orgSlug}-requests-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        toast.success("CSV file downloaded!");
    };

    const exportToJSON = () => {
        if (filteredRequests.length === 0) { toast.error("No data to export"); return; }
        const blob = new Blob([JSON.stringify(filteredRequests, null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${orgSlug}-requests-${new Date().toISOString().split("T")[0]}.json`;
        link.click();
        toast.success("JSON file downloaded!");
    };

    const urgencyStyle = {
        normal: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", badge: "bg-emerald-500" },
        urgent: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", badge: "bg-amber-500" },
        emergency: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", badge: "bg-red-500" },
    };

    const statusStyle = {
        pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        fulfilled: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        canceled: "bg-slate-700/50 text-slate-400 border-slate-600",
    };

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white mb-1">Blood Requests</h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Manage {stats.total} requests in {organization.name}
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: "Total", value: stats.total, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Pending", value: stats.pending, color: "text-amber-400", bg: "bg-amber-500/10" },
                    { label: "Fulfilled", value: stats.fulfilled, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Canceled", value: stats.canceled, color: "text-slate-400", bg: "bg-slate-700/30" },
                    { label: "Emergency", value: stats.emergency, color: "text-red-400", bg: "bg-red-500/10" },
                ].map((s, i) => (
                    <div key={i} className={`p-4 rounded-2xl ${s.bg} border border-slate-800 text-center`}>
                        <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                    <input
                        type="text"
                        placeholder="Search by patient, blood group, contact..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-12 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-red-500/50 outline-none text-sm"
                    />
                </div>

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
                                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${statusFilter === f.key
                                        ? "text-white shadow-lg"
                                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                                    }`}
                                style={statusFilter === f.key ? { backgroundColor: primaryColor } : {}}
                            >
                                {Icon && <Icon className="w-3.5 h-3.5" />}
                                {f.label}
                            </button>
                        );
                    })}
                </div>

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
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${urgencyFilter === f.key
                                    ? "bg-slate-700 text-white"
                                    : "bg-slate-800/50 text-slate-500 hover:bg-slate-800 border border-slate-800"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Request List */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 text-slate-500">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-slate-600" />
                    <p className="font-bold text-sm">Loading requests...</p>
                </div>
            ) : filteredRequests.length > 0 ? (
                <div className="space-y-3">
                    {filteredRequests.map((request) => {
                        const uStyle = urgencyStyle[request.urgency];
                        return (
                            <div
                                key={request._id}
                                className={`rounded-2xl bg-slate-900/50 border overflow-hidden transition-all hover:border-slate-600 ${request.urgency === "emergency" && request.status === "pending"
                                        ? "border-red-500/50 bg-red-500/5"
                                        : "border-slate-800"
                                    }`}
                            >
                                <div className="flex flex-col md:flex-row">
                                    {/* Left Badge */}
                                    <div className={`w-full md:w-28 flex flex-row md:flex-col items-center justify-center p-4 gap-3 md:gap-2 border-b md:border-b-0 md:border-r border-slate-800 ${uStyle.bg}`}>
                                        <div className="text-2xl font-black text-white">{request.bloodGroup}</div>
                                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${uStyle.badge} ${request.urgency === "emergency" && request.status === "pending" ? "animate-pulse" : ""
                                            }`}>
                                            {request.urgency}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow p-5">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-bold text-white text-lg">{request.patientName}</h3>
                                                    {request.urgency === "emergency" && request.status === "pending" && (
                                                        <AlertTriangle className="w-4 h-4 text-red-400" />
                                                    )}
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusStyle[request.status]}`}>
                                                        {request.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-slate-500">
                                                    <div className="flex items-center">
                                                        <MapPin className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                                                        {request.location}, {request.upazila}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                                                        {new Date(request.requiredDate).toLocaleDateString()}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Phone className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                                                        <a href={`tel:${request.contactNumber}`} className="hover:text-white transition-colors">
                                                            {request.contactNumber}
                                                        </a>
                                                    </div>
                                                </div>
                                                {request.additionalNotes && (
                                                    <p className="text-xs text-slate-600 mt-2 italic">&ldquo;{request.additionalNotes}&rdquo;</p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            {request.status === "pending" ? (
                                                <div className="flex gap-2 shrink-0">
                                                    <Button
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                                        size="sm"
                                                        onClick={() => handleStatusUpdate(request._id, "fulfilled")}
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                                        Fulfilled
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-500/50"
                                                        onClick={() => handleStatusUpdate(request._id, "canceled")}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                                                    onClick={() => handleStatusUpdate(request._id, "pending")}
                                                >
                                                    Reopen
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-24 border-2 border-dashed border-slate-800 rounded-2xl">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Droplet className="w-8 h-8 text-slate-600" />
                    </div>
                    <h2 className="text-xl font-black text-white mb-2">
                        {searchQuery || statusFilter !== "all" || urgencyFilter !== "all" ? "No requests match your criteria" : "No blood requests yet"}
                    </h2>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto font-medium">
                        {searchQuery || statusFilter !== "all" || urgencyFilter !== "all" ? "Try adjusting your search or filters" : "Your community is currently doing well!"}
                    </p>
                </div>
            )}
        </div>
    );
}
