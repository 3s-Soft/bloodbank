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
    AlertCircle,
} from "lucide-react";
import { useState, useEffect, use } from "react";
import { useOrganization } from "@/lib/context/OrganizationContext";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColorPicker } from "@/components/ui/color-picker";
import * as z from "zod";

const settingsSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string()
        .min(2, "Slug must be at least 2 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
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
        control,
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
                    slug: data.slug || "",
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

            if (data.slug !== orgSlug) {
                toast.success("Slug updated! Redirecting to new URL...");
                setTimeout(() => {
                    window.location.href = `/${data.slug}/dashboard/settings`;
                }, 2000);
            } else {
                toast.success("Settings saved successfully! Refresh to see changes.");
            }
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
                    <div className="h-10 w-64 bg-slate-800 rounded-lg"></div>
                    <div className="h-96 bg-slate-900 rounded-2xl border border-slate-800"></div>
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
                    <h1 className="text-4xl font-black text-white tracking-tight">Organization Settings</h1>
                    <p className="text-slate-400 font-medium">
                        Customize your organization's appearance and contact information.
                    </p>
                </div>
            </div>

            {/* Preview Card */}
            <Card className="bg-slate-900 border-slate-800 mb-8 overflow-hidden">
                <div
                    className="h-3 w-full"
                    style={{ backgroundColor: primaryColor }}
                />
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                        <Eye className="w-5 h-5 text-slate-400" />
                        Live Preview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800">
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
                            <div className="text-xl font-black text-white">
                                {watch("name") || "Organization Name"}
                            </div>
                            <div className="text-sm text-slate-400 flex items-center gap-2">
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
            <Card className="border-none shadow-xl bg-slate-900/50 backdrop-blur">
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5" style={{ color: primaryColor }} />
                                Basic Information
                            </h3>

                            <Input
                                label="Organization Name *"
                                placeholder="e.g. Savar Blood Bank"
                                {...register("name")}
                                error={errors.name?.message}
                            />

                            <div className="space-y-1">
                                <Input
                                    label="URL Slug *"
                                    placeholder="e.g. savar-blood-bank"
                                    {...register("slug")}
                                    error={errors.slug?.message}
                                />
                                <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 mt-1">
                                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-[11px] text-amber-500 font-medium">
                                        Changing your slug will change your organization's URL. Existing links will be broken.
                                    </p>
                                </div>
                            </div>

                            <Input
                                label="Logo URL"
                                placeholder="https://example.com/logo.png"
                                {...register("logo")}
                                error={errors.logo?.message}
                            />
                            <p className="text-xs text-slate-500 -mt-2 ml-1 italic">
                                Enter a URL to an image for your organization logo.
                            </p>
                        </div>

                        {/* Branding */}
                        <div className="space-y-4 pt-4 border-t border-slate-800">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Palette className="w-5 h-5" style={{ color: primaryColor }} />
                                Branding
                            </h3>

                            <div className="pt-2">
                                <Controller
                                    name="primaryColor"
                                    control={control}
                                    render={({ field }) => (
                                        <ColorPicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            label="Primary Theme Color *"
                                            error={errors.primaryColor?.message}
                                        />
                                    )}
                                />
                                <p className="text-xs text-slate-500 ml-1 mt-2 italic">
                                    This color will be used throughout your organization's pages.
                                </p>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4 pt-4 border-t border-slate-800">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
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
                                <label className="text-sm font-medium text-slate-300 ml-1 block mb-3">
                                    Address
                                </label>
                                <textarea
                                    {...register("address")}
                                    placeholder="Full address of your organization"
                                    className="w-full h-32 px-4 py-3 rounded-xl border border-slate-800 bg-slate-900 focus:ring-2 focus:ring-red-500 outline-none resize-none text-white placeholder-slate-500"
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
                            <p className="text-center text-sm text-slate-500">
                                No changes to save
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>

            {/* URL Info */}
            <Card className="border-none shadow-sm mt-8 bg-slate-900/40">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-slate-800 rounded-xl">
                            <MapPin className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white">Your Organization URL</h4>
                            <p className="text-sm text-slate-500 mb-3">
                                Share this link with your community to access your blood bank.
                            </p>
                            <code className="px-4 py-2 bg-slate-950 rounded-lg text-sm font-mono border border-slate-800 text-slate-300">
                                {typeof window !== "undefined" ? window.location.origin : ""}/{orgSlug}
                            </code>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
