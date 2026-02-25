"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LocationSelect, BloodGroupSelect } from "@/components/ui/location-select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Droplet, AlertCircle, MapPin, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const requestSchema = z.object({
    patientName: z.string().min(2, "Patient name is required"),
    bloodGroup: z.string().min(1, "Please select blood group"),
    location: z.string().min(5, "Hospital / Home location is required"),
    district: z.string().min(1, "District is required"),
    upazila: z.string().min(1, "Upazila is required"),
    urgency: z.enum(["normal", "urgent", "emergency"]),
    requiredDate: z.string().min(1, "Required date is needed"),
    contactNumber: z.string().min(10, "Valid contact number required"),
    additionalNotes: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestSchema>;

export default function NewBloodRequest() {
    const organization = useOrganization();
    const router = useRouter();
    const primaryColor = organization.primaryColor || "#dc2626";
    const [selectedDistrict, setSelectedDistrict] = useState("");

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RequestFormValues>({
        resolver: zodResolver(requestSchema),
        defaultValues: { urgency: "normal" },
    });

    const onSubmit = async (data: RequestFormValues) => {
        try {
            const response = await fetch("/api/requests/new", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, orgSlug: organization.slug }),
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to post request");
            }
            toast.success("Blood request posted successfully. We hope a donor connects soon!");
            router.push(`/${organization.slug}/requests`);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const urgencyOptions = [
        { value: "normal", label: "Normal", description: "Within a few days", activeBg: "bg-emerald-500/10", activeBorder: "border-emerald-500/50", color: "text-emerald-400" },
        { value: "urgent", label: "Urgent", description: "Within 24 hours", activeBg: "bg-amber-500/10", activeBorder: "border-amber-500/50", color: "text-amber-400" },
        { value: "emergency", label: "Emergency", description: "Needed immediately", activeBg: "bg-red-500/10", activeBorder: "border-red-500/50", color: "text-red-400" },
    ];

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="container mx-auto px-4 py-10 md:py-14 max-w-2xl">
                {/* Back Link */}
                <Link
                    href={`/${organization.slug}/requests`}
                    className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Requests
                </Link>

                {/* Form Card */}
                <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
                    {/* Color bar */}
                    <div className="h-1.5 w-full" style={{ backgroundColor: primaryColor }} />

                    {/* Header */}
                    <div className="text-center pt-10 pb-2 px-6">
                        <div
                            className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                            style={{ backgroundColor: `${primaryColor}15` }}
                        >
                            <AlertCircle className="w-8 h-8" style={{ color: primaryColor }} />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2">Request Blood</h1>
                        <p className="text-slate-500 font-medium text-sm">
                            Create a request in {organization.name}
                        </p>
                    </div>

                    {/* Form */}
                    <div className="p-6 md:p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Patient Name */}
                            <Input
                                label="Patient Name *"
                                placeholder="Full name of the patient"
                                {...register("patientName")}
                                error={errors.patientName?.message}
                            />

                            {/* Blood Group */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
                                    Blood Group Needed *
                                </label>
                                <Controller
                                    name="bloodGroup"
                                    control={control}
                                    render={({ field }) => (
                                        <BloodGroupSelect
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={errors.bloodGroup?.message}
                                        />
                                    )}
                                />
                            </div>

                            {/* Urgency Level */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
                                    Urgency Level *
                                </label>
                                <Controller
                                    name="urgency"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="grid grid-cols-3 gap-3">
                                            {urgencyOptions.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => field.onChange(opt.value)}
                                                    className={`p-4 rounded-xl border-2 text-center transition-all ${field.value === opt.value
                                                            ? `${opt.activeBg} ${opt.activeBorder}`
                                                            : "border-slate-800 bg-slate-800/30 hover:border-slate-700"
                                                        }`}
                                                >
                                                    <div className={`text-sm font-bold ${opt.color}`}>
                                                        {opt.label}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 mt-1">
                                                        {opt.description}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Date and Contact */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Required Date *"
                                    type="date"
                                    {...register("requiredDate")}
                                    error={errors.requiredDate?.message}
                                />
                                <Input
                                    label="Contact Number *"
                                    placeholder="017XXXXXXXX"
                                    {...register("contactNumber")}
                                    error={errors.contactNumber?.message}
                                />
                            </div>

                            {/* Location Section */}
                            <div className="space-y-4 pt-5 border-t border-slate-800">
                                <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" style={{ color: primaryColor }} />
                                    Location Details
                                </h3>

                                <Input
                                    label="Hospital / Exact Address *"
                                    placeholder="e.g. Apollo Hospital, Room 402"
                                    {...register("location")}
                                    error={errors.location?.message}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                                            District *
                                        </label>
                                        <Controller
                                            name="district"
                                            control={control}
                                            render={({ field }) => (
                                                <LocationSelect
                                                    type="district"
                                                    value={field.value}
                                                    onChange={(val) => {
                                                        field.onChange(val);
                                                        setSelectedDistrict(val);
                                                        setValue("upazila", "");
                                                    }}
                                                    error={errors.district?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                                            Upazila *
                                        </label>
                                        <Controller
                                            name="upazila"
                                            control={control}
                                            render={({ field }) => (
                                                <LocationSelect
                                                    type="upazila"
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    district={selectedDistrict}
                                                    error={errors.upazila?.message}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                                    Additional Notes
                                </label>
                                <textarea
                                    {...register("additionalNotes")}
                                    className="w-full min-h-[120px] rounded-xl border border-slate-700 bg-slate-800 p-4 focus:ring-2 focus:ring-red-500/50 focus:border-slate-600 outline-none resize-none text-white placeholder-slate-500 text-sm"
                                    placeholder="Any special instructions for donors..."
                                />
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full h-14 text-lg font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: primaryColor }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <Droplet className="w-5 h-5 mr-2" />
                                        Post Request
                                    </>
                                )}
                            </Button>

                            <p className="text-center text-[11px] text-slate-600">
                                By posting, you agree to our community guidelines.
                                Your contact will be shared with potential donors.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
