"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Building2,
    Plus,
    Search,
    ExternalLink,
    Trash2,
    Edit,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Organization {
    _id: string;
    name: string;
    slug: string;
    primaryColor: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    isActive: boolean;
    createdAt: string;
}

export default function OrganizationsPage() {
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetchOrganizations();
    }, []);

    const fetchOrganizations = async () => {
        try {
            const res = await fetch("/api/admin/organizations");
            const data = await res.json();
            setOrganizations(data);
        } catch (error) {
            console.error("Failed to fetch organizations", error);
            toast.error("Failed to load organizations");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
            return;
        }

        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/organizations/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete");
            }

            toast.success("Organization deleted successfully");
            setOrganizations(organizations.filter((org) => org._id !== id));
        } catch (error) {
            toast.error("Failed to delete organization");
        } finally {
            setDeleting(null);
        }
    };

    const filteredOrganizations = organizations.filter(
        (org) =>
            org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            org.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="animate-pulse space-y-8">
                    <div className="h-10 w-64 bg-neutral-200 rounded"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-48 bg-neutral-200 rounded-2xl"></div>
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
                    <h1 className="text-4xl font-black text-neutral-900 mb-2">Organizations</h1>
                    <p className="text-neutral-500 font-medium">
                        Manage all blood bank organizations on the platform.
                    </p>
                </div>
                <Link href="/admin/organizations/new">
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                        <Plus className="w-5 h-5 mr-2" />
                        New Organization
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="mb-8">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search organizations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                </div>
            </div>

            {/* Organizations Grid */}
            {filteredOrganizations.length === 0 ? (
                <Card className="border-none shadow-sm">
                    <CardContent className="py-16 text-center">
                        <Building2 className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
                        <h3 className="text-lg font-bold text-neutral-900 mb-2">
                            {searchQuery ? "No organizations found" : "No organizations yet"}
                        </h3>
                        <p className="text-neutral-500 mb-6">
                            {searchQuery
                                ? "Try a different search term"
                                : "Create your first organization to get started."}
                        </p>
                        {!searchQuery && (
                            <Link href="/admin/organizations/new">
                                <Button className="bg-red-600 hover:bg-red-700 text-white">
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
                        <Card key={org._id} className="border-none shadow-sm hover:shadow-md transition-shadow">
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
                                            <h3 className="font-bold text-neutral-900">{org.name}</h3>
                                            <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded">
                                                /{org.slug}
                                            </code>
                                        </div>
                                    </div>
                                    {org.isActive ? (
                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-600">
                                            Inactive
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2 mb-6 text-sm text-neutral-600">
                                    {org.contactPhone && (
                                        <p>📞 {org.contactPhone}</p>
                                    )}
                                    {org.contactEmail && (
                                        <p>✉️ {org.contactEmail}</p>
                                    )}
                                    {org.address && (
                                        <p>📍 {org.address}</p>
                                    )}
                                    <p className="text-xs text-neutral-400">
                                        Created {new Date(org.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Link href={`/${org.slug}`} target="_blank" className="flex-1">
                                        <Button size="sm" variant="outline" className="w-full">
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            View
                                        </Button>
                                    </Link>
                                    <Link href={`/admin/organizations/${org._id}`}>
                                        <Button size="sm" variant="outline">
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                    </Link>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(org._id, org.name)}
                                        disabled={deleting === org._id}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
