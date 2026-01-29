"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, ArrowLeft, Save, Loader2, Users, Droplet, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const organizationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string()
        .min(2, "Slug must be at least 2 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").optional(),
    contactEmail: z.string().email("Must be a valid email").optional().or(z.literal("")),
    contactPhone: z.string().optional(),
    address: z.string().optional(),
    isActive: z.boolean(),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

interface OrganizationWithStats extends OrganizationFormValues {
    _id: string;
    createdAt: string;
    updatedAt: string;
    stats: {
        donorCount: number;
        requestCount: number;
        activeRequests: number;
    };
}

export default function EditOrganizationPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [organization, setOrganization] = useState<OrganizationWithStats | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm<OrganizationFormValues>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
            primaryColor: "#D32F2F",
            isActive: true,
        },
    });

    const primaryColor = watch("primaryColor") || "#D32F2F";

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                const res = await fetch(`/api/admin/organizations/${id}`);
                if (!res.ok) throw new Error("Organization not found");

                const data = await res.json();
                setOrganization(data);
                reset({
                    name: data.name,
                    slug: data.slug,
                    primaryColor: data.primaryColor || "#D32F2F",
                    contactEmail: data.contactEmail || "",
                    contactPhone: data.contactPhone || "",
                    address: data.address || "",
                    isActive: data.isActive,
                });
            } catch (error) {
                toast.error("Failed to load organization");
                router.push("/admin/organizations");
            } finally {
                setLoading(false);
            }
        };
        fetchOrganization();
    }, [id, reset, router]);

    const onSubmit = async (data: OrganizationFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/admin/organizations/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to update organization");
            }

            toast.success("Organization updated successfully!");
            router.push("/admin/organizations");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${organization?.name}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/organizations/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            toast.success("Organization deleted successfully");
            router.push("/admin/organizations");
        } catch (error) {
            toast.error("Failed to delete organization");
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="animate-pulse space-y-8">
                    <div className="h-6 w-40 bg-neutral-200 rounded"></div>
                    <div className="h-96 bg-neutral-200 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            {/* Back Link */}
            <Link
                href="/admin/organizations"
                className="inline-flex items-center text-sm font-medium text-neutral-600 hover:text-neutral-900 mb-8"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Organizations
            </Link>

            {/* Stats Cards */}
            {organization?.stats && (
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                            <div className="text-2xl font-black text-neutral-900">
                                {organization.stats.donorCount}
                            </div>
                            <div className="text-xs text-neutral-500 font-medium">Donors</div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <Droplet className="w-6 h-6 mx-auto mb-2 text-red-600" />
                            <div className="text-2xl font-black text-neutral-900">
                                {organization.stats.requestCount}
                            </div>
                            <div className="text-xs text-neutral-500 font-medium">Total Requests</div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <Droplet className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                            <div className="text-2xl font-black text-neutral-900">
                                {organization.stats.activeRequests}
                            </div>
                            <div className="text-xs text-neutral-500 font-medium">Active Requests</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card className="border-none shadow-xl overflow-hidden">
                <div
                    className="h-2 w-full transition-colors"
                    style={{ backgroundColor: primaryColor }}
                />
                <CardHeader className="pt-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl transition-colors"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {watch("name")?.charAt(0) || "O"}
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black text-neutral-900">
                                    Edit Organization
                                </CardTitle>
                                <p className="text-neutral-500 text-sm">
                                    Update organization details and settings.
                                </p>
                            </div>
                        </div>
                        <Link href={`/${organization?.slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Site
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="Organization Name *"
                            placeholder="e.g. Savar Blood Bank"
                            {...register("name")}
                            error={errors.name?.message}
                        />

                        <Input
                            label="URL Slug *"
                            placeholder="e.g. savar-blood-bank"
                            {...register("slug")}
                            error={errors.slug?.message}
                        />
                        <p className="text-xs text-neutral-500 -mt-4 ml-1">
                            This will be the URL: yoursite.com/<span className="font-bold">{watch("slug") || "slug"}</span>
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-neutral-700 ml-1">
                                    Primary Color
                                </label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="color"
                                        {...register("primaryColor")}
                                        className="w-12 h-12 rounded-xl border border-neutral-200 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        {...register("primaryColor")}
                                        placeholder="#D32F2F"
                                        className="flex-1 h-12 rounded-xl border border-neutral-200 px-4 focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                </div>
                                {errors.primaryColor && (
                                    <p className="text-xs text-red-500 ml-1">{errors.primaryColor.message}</p>
                                )}
                            </div>

                            <Input
                                label="Contact Phone"
                                placeholder="017XXXXXXXX"
                                {...register("contactPhone")}
                                error={errors.contactPhone?.message}
                            />
                        </div>

                        <Input
                            label="Contact Email"
                            type="email"
                            placeholder="contact@example.com"
                            {...register("contactEmail")}
                            error={errors.contactEmail?.message}
                        />

                        <Input
                            label="Address"
                            placeholder="Full address"
                            {...register("address")}
                            error={errors.address?.message}
                        />

                        {/* Active Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl border border-neutral-200">
                            <div>
                                <label className="text-sm font-medium text-neutral-900">
                                    Organization Status
                                </label>
                                <p className="text-xs text-neutral-500">
                                    Inactive organizations won't be accessible to users.
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    {...register("isActive")}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:bg-green-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>

                        <div className="flex items-center space-x-4 pt-4">
                            <Button
                                type="submit"
                                className="flex-1 h-14 text-lg font-bold text-white shadow-lg"
                                style={{ backgroundColor: primaryColor }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="h-14 px-6 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Trash2 className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border border-red-200 mt-8">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-neutral-600 mb-4">
                        Deleting this organization will remove all associated data including donors,
                        blood requests, and user associations. This action cannot be undone.
                    </p>
                    <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Organization
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
