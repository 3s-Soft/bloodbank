"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationSelect, BloodGroupSelect } from "@/components/ui/location-select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Droplet, AlertCircle, Phone, MapPin, Loader2, ArrowLeft } from "lucide-react";
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
    const primaryColor = organization.primaryColor || "#D32F2F";
    const [selectedDistrict, setSelectedDistrict] = useState("");

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<RequestFormValues>({
        resolver: zodResolver(requestSchema),
        defaultValues: {
            urgency: "normal",
        },
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
        { value: "normal", label: "Normal", description: "Within a few days", color: "green" },
        { value: "urgent", label: "Urgent", description: "Within 24 hours", color: "orange" },
        { value: "emergency", label: "Emergency", description: "Needed immediately", color: "red" },
    ];

    return (
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-2xl">
            {/* Back Link */}
            <Link
                href={`/${organization.slug}/requests`}
                className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Requests
            </Link>

            <Card className="border-none shadow-xl overflow-hidden dark:bg-neutral-800">
                <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />
                <CardHeader className="text-center pt-8">
                    <div
                        className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                        style={{ backgroundColor: `${primaryColor}15` }}
                    >
                        <AlertCircle className="w-8 h-8" style={{ color: primaryColor }} />
                    </div>
                    <CardTitle className="text-3xl font-black text-neutral-900 dark:text-white">
                        Request Blood
                    </CardTitle>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">
                        Create an emergency request in {organization.name}
                    </p>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
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
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 ml-1">
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
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 ml-1">
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
                                                        ? opt.color === "red"
                                                            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                                                            : opt.color === "orange"
                                                                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                                                                : "border-green-500 bg-green-50 dark:bg-green-900/20"
                                                        : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                                                    }`}
                                            >
                                                <div className={`text-sm font-bold ${opt.color === "red"
                                                        ? "text-red-600"
                                                        : opt.color === "orange"
                                                            ? "text-orange-600"
                                                            : "text-green-600"
                                                    }`}>
                                                    {opt.label}
                                                </div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
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
                        <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center">
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
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 ml-1">
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
                                                    setValue("upazila", ""); // Reset upazila
                                                }}
                                                error={errors.district?.message}
                                            />
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 ml-1">
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
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 ml-1">
                                Additional Notes
                            </label>
                            <textarea
                                {...register("additionalNotes")}
                                className="w-full min-h-[100px] rounded-xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 p-4 focus:ring-2 focus:ring-red-500 outline-none resize-none text-neutral-900 dark:text-white"
                                placeholder="Any special instructions for donors..."
                            />
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-bold text-white shadow-lg"
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

                        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                            By posting, you agree to our community guidelines.
                            Your contact will be shared with potential donors.
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
