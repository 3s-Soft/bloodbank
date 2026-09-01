"use client";

import { apiDelete, apiGet, apiPost } from "@/lib/api/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Building2,
    Plus,
    Search,
    ExternalLink,
    Trash2,
    Edit,
    CheckCircle,
    XCircle,
    Clock,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Organization {
    id: number;
    name: string;
    slug: string;
    primaryColor: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    isActive: boolean;
    isVerified?: boolean;
    createdAt: string;
}

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleting, setDeleting] = useState<number | null>(null);
    const [verifying, setVerifying] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"all" | "pending">("all");

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            setOrganizations(await apiGet<Organization[]>("/api/admin/organizations"));
        } catch (error) {
            console.error("Failed to fetch organizations", error);
            toast.error("Failed to load organizations");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        setDeleting(id);
        try {
            await apiDelete(`/api/admin/organizations/${id}`);

            toast.success("Organization deleted successfully");
            setOrganizations(organizations.filter((org) => org.id !== id));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete organization");
        } finally {
            setDeleting(null);
        }
    };

    const handleVerify = async (id: number, action: "verify" | "reject") => {
        setVerifying(id);
        try {
            if (action === "verify") {
                await apiPost(`/api/admin/organizations/${id}/verify`, { isVerified: true });
                toast.success("Organization verified successfully!");
                setOrganizations(
                    organizations.map((org) =>
                        org.id === id ? { ...org, isVerified: true } : org,
                    ),
                );
            } else {
                // Rejecting an application removes it outright.
                await apiDelete(`/api/admin/organizations/${id}`);
                toast.success("Organization rejected and removed");
                setOrganizations(organizations.filter((org) => org.id !== id));
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to process request");
        } finally {
            setVerifying(null);
        }
    };

    const pendingOrganizations = organizations.filter((org) => org.isVerified === false);
    const verifiedOrganizations = organizations.filter((org) => org.isVerified !== false);

    const filteredOrganizations = (activeTab === "pending" ? pendingOrganizations : verifiedOrganizations).filter(
        (org) =>
            org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="animate-pulse space-y-8">
                    <div className="h-10 w-64 bg-slate-800 rounded"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-48 bg-slate-800 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2">Organizations</h1>
                    <p className="text-slate-400 font-medium">
                        Manage all blood bank organizations on the platform.
                    </p>
                </div>
                <Link href="/admin/organizations/new">
                    <Button className="bg-red-600 hover:bg-red-700 text-white font-bold">
                        <Plus className="w-5 h-5 mr-2" />
                        New Organization
                    </Button>
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-2 mb-6">
                <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === "all"
                            ? "bg-red-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                >
                    All Organizations ({verifiedOrganizations.length})
                </button>
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center ${activeTab === "pending"
                            ? "bg-orange-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                >
                    <Clock className="w-4 h-4 mr-2" />
                    Pending Verification ({pendingOrganizations.length})
                </button>
            </div>

            {/* Search */}
            <div className="mb-8">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search organizations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-700 bg-slate-900 text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                </div>
            </div>

            {/* Organizations Grid */}
            {filteredOrganizations.length === 0 ? (
                <Card className="border-none shadow-sm bg-slate-900/50 border border-slate-800">
                    <CardContent className="py-16 text-center">
                        <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                        <h3 className="text-lg font-bold text-white mb-2">
                            {searchQuery ? "No organizations found" : activeTab === "pending" ? "No pending organizations" : "No organizations yet"}
                        </h3>
                        <p className="text-slate-400 mb-6">
                            {searchQuery
                                ? "Try a different search term"
                                : activeTab === "pending"
                                    ? "All organizations have been reviewed!"
                                    : "Create your first organization to get started."}
                        </p>
                        {!searchQuery && activeTab === "all" && (
                            <Link href="/admin/organizations/new">
                                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Create Organization
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrganizations.map((org) => (
                        <Card key={org.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-slate-900/50 border border-slate-800">
                            <div
                                className="h-2 w-full rounded-t-xl"
                                style={{ backgroundColor: org.primaryColor || "#D32F2F" }}
                            />
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                                            style={{ backgroundColor: org.primaryColor || "#D32F2F" }}
                                        >
                                            {org.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">{org.name}</h3>
                                            <code className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                                                /{org.slug}
                                            </code>
                                        </div>
                                    </div>
                                    {org.isVerified === false ? (
                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                            Pending
                                        </span>
                                    ) : org.isActive ? (
                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-400">
                                            Inactive
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 mb-6 text-sm text-slate-400">
                                    {org.contactPhone && (
                                        <p>📞 {org.contactPhone}</p>
                                    )}
                                    {org.contactEmail && (
                                        <p>✉️ {org.contactEmail}</p>
                                    )}
                                    {org.address && (
                                        <p>📍 {org.address}</p>
                                    )}
                                    <p className="text-xs text-slate-500">
                                        Created {new Date(org.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Actions */}
                                {org.isVerified === false ? (
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                                            onClick={() => handleVerify(org.id, "verify")}
                                            disabled={verifying === org.id}
                                        >
                                            {verifying === org.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-4 h-4 mr-2" />
                                                    Verify
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                                            onClick={() => handleVerify(org.id, "reject")}
                                            disabled={verifying === org.id}
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <Link href={`/${org.slug}`} target="_blank" className="flex-1">
                                            <Button size="sm" variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                View
                                            </Button>
                                        </Link>
                                        <Link href={`/admin/organizations/${org.id}`}>
                                            <Button size="sm" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-400 border-red-500/50 hover:bg-red-500/10"
                                            onClick={() => handleDelete(org.id, org.name)}
                                            disabled={deleting === org.id}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
