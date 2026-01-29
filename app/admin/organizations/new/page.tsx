"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColorPicker } from "@/components/ui/color-picker";
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
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

export default function NewOrganizationPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        control,
    } = useForm<OrganizationFormValues>({
        resolver: zodResolver(organizationSchema),
        defaultValues: {
            primaryColor: "#D32F2F",
        },
    });

    const primaryColor = watch("primaryColor") || "#D32F2F";

    const onSubmit = async (data: OrganizationFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/admin/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to create organization");
            }

            toast.success("Organization created successfully!");
            router.push("/admin/organizations");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            {/* Back Link */}
            <Link
                href="/admin/organizations"
                className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white mb-8"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Organizations
            </Link>

            <Card className="border-none shadow-xl overflow-hidden bg-slate-900/50 backdrop-blur">
                <div
                    className="h-2 w-full transition-colors"
                    style={{ backgroundColor: primaryColor }}
                />
                <CardHeader className="text-center pt-8">
                    <div
                        className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors"
                        style={{ backgroundColor: `${primaryColor}20` }}
                    >
                        <Building2 className="w-8 h-8" style={{ color: primaryColor }} />
                    </div>
                    <CardTitle className="text-3xl font-black text-white">
                        Create Organization
                    </CardTitle>
                    <p className="text-slate-400 font-medium font-sans">
                        Add a new blood bank organization to the platform.
                    </p>
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
                        <p className="text-xs text-slate-500 -mt-4 ml-1 italic">
                            This will be the URL: yoursite.com/<span className="font-bold text-slate-300">{watch("slug") || "slug"}</span>
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                            <div className="pt-2">
                                <Controller
                                    name="primaryColor"
                                    control={control}
                                    render={({ field }) => (
                                        <ColorPicker
                                            value={field.value || "#D32F2F"}
                                            onChange={field.onChange}
                                            label="Primary Theme Color"
                                            error={errors.primaryColor?.message}
                                        />
                                    )}
                                />
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

                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-bold text-white shadow-lg"
                            style={{ backgroundColor: primaryColor }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2" />
                                    Create Organization
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
