"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganization } from "@/lib/context/OrganizationContext";
import {
    Shield,
    UserCheck,
    UserX,
    Droplet,
    Settings,
    Users,
    Calendar,
    FileText,
    Filter,
    Clock,
    ChevronDown,
} from "lucide-react";

interface AuditLogEntry {
    _id: string;
    action: string;
    performedBy: {
        name: string;
        email?: string;
        phone?: string;
    };
    targetType?: string;
    targetId?: string;
    details?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
}

const actionConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    donor_verified: { label: "Donor Verified", icon: UserCheck, color: "text-emerald-400" },
    donor_unverified: { label: "Donor Unverified", icon: UserX, color: "text-orange-400" },
    donor_imported: { label: "Donors Imported", icon: FileText, color: "text-blue-400" },
    request_fulfilled: { label: "Request Fulfilled", icon: Droplet, color: "text-emerald-400" },
    request_canceled: { label: "Request Canceled", icon: Droplet, color: "text-red-400" },
    request_reopened: { label: "Request Reopened", icon: Droplet, color: "text-amber-400" },
    request_escalated: { label: "Request Escalated", icon: Droplet, color: "text-red-500" },
    user_role_changed: { label: "Role Changed", icon: Users, color: "text-purple-400" },
    user_added: { label: "User Added", icon: Users, color: "text-blue-400" },
    user_deleted: { label: "User Deleted", icon: Users, color: "text-red-400" },
    org_settings_updated: { label: "Settings Updated", icon: Settings, color: "text-slate-400" },
    event_created: { label: "Event Created", icon: Calendar, color: "text-blue-400" },
    event_updated: { label: "Event Updated", icon: Calendar, color: "text-amber-400" },
    event_deleted: { label: "Event Deleted", icon: Calendar, color: "text-red-400" },
    donation_recorded: { label: "Donation Recorded", icon: Droplet, color: "text-emerald-400" },
};

const actionOptions = [
    { value: "", label: "All Actions" },
    { value: "donor_verified", label: "Donor Verified" },
    { value: "donor_unverified", label: "Donor Unverified" },
    { value: "donor_imported", label: "Donors Imported" },
    { value: "request_fulfilled", label: "Request Fulfilled" },
    { value: "request_canceled", label: "Request Canceled" },
    { value: "request_escalated", label: "Request Escalated" },
    { value: "user_role_changed", label: "Role Changed" },
    { value: "user_added", label: "User Added" },
    { value: "user_deleted", label: "User Deleted" },
    { value: "org_settings_updated", label: "Settings Updated" },
    { value: "event_created", label: "Event Created" },
    { value: "donation_recorded", label: "Donation Recorded" },
];

export default function AuditLogPage({
    params,
}: {
    params: Promise<{ orgSlug: string }>;
}) {
    const { orgSlug } = use(params);
    const org = useOrganization();
    const primaryColor = org?.primaryColor || "#D32F2F";

    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterAction, setFilterAction] = useState("");

    useEffect(() => {
        async function fetchLogs() {
            try {
                const actionParam = filterAction ? `&action=${filterAction}` : "";
                const res = await fetch(
                    `/api/org/audit-log?orgSlug=${orgSlug}${actionParam}&limit=100`
                );
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (error) {
                console.error("Error fetching audit logs:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, [orgSlug, filterAction]);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3">
                        <Shield className="w-7 h-7" style={{ color: primaryColor }} />
                        Audit Log
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Track all administrative actions and changes
                    </p>
                </div>
            </div>

            {/* Filter */}
            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <Filter className="w-5 h-5 text-slate-400" />
                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-red-500 appearance-none"
                        >
                            {actionOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Log Entries */}
            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Recent Activity ({logs.length} entries)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="text-lg">No audit logs found</p>
                            <p className="text-sm mt-1">Administrative actions will be logged here.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {logs.map((log) => {
                                const config = actionConfig[log.action] || {
                                    label: log.action,
                                    icon: Shield,
                                    color: "text-slate-400",
                                };
                                const Icon = config.icon;

                                return (
                                    <div
                                        key={log._id}
                                        className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all"
                                    >
                                        <div className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-5 h-5 ${config.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${config.color}`}>
                                                    {config.label}
                                                </span>
                                                <span className="text-xs text-slate-600">•</span>
                                                <span className="text-xs text-slate-500">
                                                    {formatTime(log.createdAt)}
                                                </span>
                                            </div>
                                            {log.details && (
                                                <p className="text-sm text-slate-400 mt-1">{log.details}</p>
                                            )}
                                            <p className="text-xs text-slate-600 mt-1">
                                                by{" "}
                                                <span className="text-slate-500 font-bold">
                                                    {log.performedBy?.name || "Unknown"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
