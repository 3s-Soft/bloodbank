"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, ArrowLeft, Send, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import * as z from "zod";

const organizationSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string()
        .min(2, "Slug must be at least 2 characters")
        .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
    contactEmail: z.string().email("Must be a valid email").optional().or(z.literal("")),
    contactPhone: z.string().optional(),
    address: z.string().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

export default function RequestOrganizationPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        trigger,
    } = useForm<OrganizationFormValues>({
        resolver: zodResolver(organizationSchema),
    });

    const name = watch("name");

    // Auto-generate slug from name
    useEffect(() => {
        if (name) {
            const generatedSlug = name
                .toLowerCase()
                .trim()
                .replace(/[^\a-z0-9\s-]/g, '') // remove non-alphanumeric except space and hyphen
                .replace(/[\s_]+/g, '-')       // replace spaces and underscores with hyphen
                .replace(/^-+|-+$/g, '');     // trim leading/trailing hyphens

            setValue("slug", generatedSlug);
            trigger("slug");
        }
    }, [name, setValue, trigger]);

    const onSubmit = async (data: OrganizationFormValues) => {
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/organizations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to create organization request");
            }

            setIsSuccess(true);
            toast.success("Request submitted successfully!");
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
                <Card className="w-full max-w-md border-none shadow-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800">
                    <CardContent className="p-8 text-center">
                        <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
                        <p className="text-slate-400 mb-6">
                            You need to be logged in to request a new organization.
                        </p>
                        <Link href="/login">
                            <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold">
                                Go to Login
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
                <Card className="w-full max-w-md border-none shadow-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800">
                    <CardContent className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
                        <p className="text-slate-400 mb-6">
                            Your organization request has been submitted and is pending review by our admin team. You will be notified once it's approved.
                        </p>
                        <Link href="/">
                            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold">
                                Back to Home
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4">
            <div className="container mx-auto max-w-2xl">
                {/* Back Link */}
                <Link
                    href="/"
                    className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>

                <Card className="border-none shadow-xl overflow-hidden bg-slate-900/50 backdrop-blur border border-slate-800">
                    <div className="h-2 w-full bg-red-600" />
                    <CardHeader className="text-center pt-8">
                        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                            <Building2 className="w-8 h-8 text-red-500" />
                        </div>
                        <CardTitle className="text-3xl font-black text-white">
                            Request a Blood Bank
                        </CardTitle>
                        <p className="text-slate-400 font-medium mt-2">
                            Fill out the form below to request a new blood bank organization. Our team will review and approve it.
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

                            <div>
                                <Input
                                    label="URL Slug *"
                                    placeholder="e.g. savar-blood-bank"
                                    {...register("slug")}
                                    error={errors.slug?.message}
                                />
                                <p className="text-xs text-slate-500 mt-1 ml-1">
                                    This will be your organization's URL: bloodbank.com/<span className="text-red-400">{watch("slug") || "your-slug"}</span>
                                </p>
                            </div>

                            <Input
                                label="Contact Email"
                                type="email"
                                placeholder="contact@example.com"
                                {...register("contactEmail")}
                                error={errors.contactEmail?.message}
                            />

                            <Input
                                label="Contact Phone"
                                placeholder="017XXXXXXXX"
                                {...register("contactPhone")}
                                error={errors.contactPhone?.message}
                            />

                            <div>
                                <label className="text-sm font-medium text-slate-300 ml-1 block mb-2">
                                    Address
                                </label>
                                <textarea
                                    {...register("address")}
                                    placeholder="Full address of your organization"
                                    className="w-full h-24 px-4 py-3 rounded-xl border border-slate-800 bg-slate-900 focus:ring-2 focus:ring-red-500 outline-none resize-none text-white placeholder-slate-500"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 text-lg font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2" />
                                        Submit Request
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-slate-500 text-center">
                                By submitting, you agree that the information is accurate and you are authorized to create this organization.
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
