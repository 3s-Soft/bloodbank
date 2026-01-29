"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Settings,
    Building2,
    Palette,
    Phone,
    Mail,
    MapPin,
    Save,
    Loader2,
    Image,
    Eye,
    RefreshCw,
} from "lucide-react";
import { useState, useEffect, use } from "react";
import { useOrganization } from "@/lib/context/OrganizationContext";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const settingsSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
    contactEmail: z.string().email("Must be a valid email").optional().or(z.literal("")),
    contactPhone: z.string().optional(),
    address: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function OrgSettingsPage({
    params,
}: {
    params: Promise<{ orgSlug: string }>;
}) {
    const { orgSlug } = use(params);
    const org = useOrganization();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        watch,
        reset,
    } = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            primaryColor: "#D32F2F",
        },
    });

    const primaryColor = watch("primaryColor") || "#D32F2F";
    const logoUrl = watch("logo");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`/api/org/settings?orgSlug=${orgSlug}`);
                if (!res.ok) throw new Error("Failed to fetch settings");

                const data = await res.json();
                reset({
                    name: data.name || "",
                    logo: data.logo || "",
                    primaryColor: data.primaryColor || "#D32F2F",
                    contactEmail: data.contactEmail || "",
                    contactPhone: data.contactPhone || "",
                    address: data.address || "",
                });
            } catch (error) {
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [orgSlug, reset]);

    const onSubmit = async (data: SettingsFormValues) => {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/org/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, orgSlug }),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            toast.success("Settings saved successfully! Refresh to see changes.");
            reset(data); // Reset form state to mark as not dirty
        } catch (error: any) {
            toast.error(error.message || "Failed to save settings");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="animate-pulse space-y-8">
                    <div className="h-10 w-64 bg-neutral-200 rounded"></div>
                    <div className="h-96 bg-neutral-200 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div
                    className="p-3 rounded-2xl"
                    style={{ backgroundColor: `${primaryColor}20` }}
                >
                    <Settings className="w-8 h-8" style={{ color: primaryColor }} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-neutral-900">Organization Settings</h1>
                    <p className="text-neutral-500 font-medium">
                        Customize your organization's appearance and contact information.
                    </p>
                </div>
            </div>

            {/* Preview Card */}
            <Card className="border-none shadow-sm mb-8 overflow-hidden">
                <div
                    className="h-3 w-full"
                    style={{ backgroundColor: primaryColor }}
                />
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Eye className="w-5 h-5 text-neutral-400" />
                        Live Preview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt="Logo"
                                className="w-16 h-16 rounded-xl object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = "none";
                                }}
                            />
                        ) : (
                            <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-black"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {watch("name")?.charAt(0) || "O"}
                            </div>
                        )}
                        <div>
                            <div className="text-xl font-black text-neutral-900">
                                {watch("name") || "Organization Name"}
                            </div>
                            <div className="text-sm text-neutral-500 flex items-center gap-2">
                                <span
                                    className="inline-block w-3 h-3 rounded-full"
                                    style={{ backgroundColor: primaryColor }}
                                />
                                Primary Color: {primaryColor}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Settings Form */}
            <Card className="border-none shadow-xl">
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                <Building2 className="w-5 h-5" style={{ color: primaryColor }} />
                                Basic Information
                            </h3>

                            <Input
                                label="Organization Name *"
                                placeholder="e.g. Savar Blood Bank"
                                {...register("name")}
                                error={errors.name?.message}
                            />

                            <Input
                                label="Logo URL"
                                placeholder="https://example.com/logo.png"
                                {...register("logo")}
                                error={errors.logo?.message}
                            />
                            <p className="text-xs text-neutral-500 -mt-2 ml-1">
                                Enter a URL to an image for your organization logo.
                            </p>
                        </div>

                        {/* Branding */}
                        <div className="space-y-4 pt-4 border-t border-neutral-100">
                            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                <Palette className="w-5 h-5" style={{ color: primaryColor }} />
                                Branding
                            </h3>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-neutral-700 ml-1">
                                    Primary Color *
                                </label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="color"
                                        {...register("primaryColor")}
                                        className="w-14 h-14 rounded-xl border border-neutral-200 cursor-pointer"
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
                                <p className="text-xs text-neutral-500 ml-1">
                                    This color will be used throughout your organization's pages.
                                </p>
                            </div>

                            {/* Color Presets */}
                            <div>
                                <label className="text-sm font-medium text-neutral-700 ml-1 block mb-2">
                                    Quick Presets
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { color: "#D32F2F", name: "Red" },
                                        { color: "#1976D2", name: "Blue" },
                                        { color: "#388E3C", name: "Green" },
                                        { color: "#7B1FA2", name: "Purple" },
                                        { color: "#F57C00", name: "Orange" },
                                        { color: "#00796B", name: "Teal" },
                                        { color: "#C2185B", name: "Pink" },
                                        { color: "#303F9F", name: "Indigo" },
                                    ].map((preset) => (
                                        <button
                                            key={preset.color}
                                            type="button"
                                            onClick={() => reset({ ...watch(), primaryColor: preset.color })}
                                            className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${primaryColor === preset.color ? "border-neutral-900 scale-110" : "border-transparent"
                                                }`}
                                            style={{ backgroundColor: preset.color }}
                                            title={preset.name}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4 pt-4 border-t border-neutral-100">
                            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                <Phone className="w-5 h-5" style={{ color: primaryColor }} />
                                Contact Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Contact Phone"
                                    placeholder="017XXXXXXXX"
                                    {...register("contactPhone")}
                                    error={errors.contactPhone?.message}
                                />

                                <Input
                                    label="Contact Email"
                                    type="email"
                                    placeholder="contact@example.com"
                                    {...register("contactEmail")}
                                    error={errors.contactEmail?.message}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-neutral-700 ml-1 block mb-1.5">
                                    Address
                                </label>
                                <textarea
                                    {...register("address")}
                                    placeholder="Full address of your organization"
                                    className="w-full h-24 px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 flex items-center gap-4">
                            <Button
                                type="submit"
                                className="flex-1 h-14 text-lg font-bold text-white shadow-lg"
                                style={{ backgroundColor: primaryColor }}
                                disabled={isSubmitting || !isDirty}
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
                            {isDirty && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.location.reload()}
                                >
                                    <RefreshCw className="w-5 h-5" />
                                </Button>
                            )}
                        </div>

                        {!isDirty && (
                            <p className="text-center text-sm text-neutral-500">
                                No changes to save
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* URL Info */}
            <Card className="border-none shadow-sm mt-8">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-neutral-100 rounded-xl">
                            <MapPin className="w-5 h-5 text-neutral-600" />
                        </div>
                        <div>
                            <h4 className="font-bold text-neutral-900">Your Organization URL</h4>
                            <p className="text-sm text-neutral-500 mb-2">
                                Share this link with your community to access your blood bank.
                            </p>
                            <code className="px-3 py-2 bg-neutral-100 rounded-lg text-sm font-mono">
                                {typeof window !== "undefined" ? window.location.origin : ""}/{orgSlug}
                            </code>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
