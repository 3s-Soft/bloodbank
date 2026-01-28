"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Droplet, AlertCircle, Phone, MapPin } from "lucide-react";

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
    const primaryColor = organization.primaryColor || "#D32F2F";

    const {
        register,
        handleSubmit,
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

            alert("Blood request posted successfully. We hope a donor connects soon!");
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <Card className="border-none shadow-xl overflow-hidden">
                <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />
                <CardHeader className="text-center pt-8">
                    <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${primaryColor}10` }}>
                        <AlertCircle className="w-8 h-8" style={{ color: primaryColor }} />
                    </div>
                    <CardTitle className="text-3xl font-black text-neutral-900">Request Blood</CardTitle>
                    <p className="text-neutral-500 font-medium">Create an emergency request in {organization.name}</p>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="Patient Name"
                            placeholder="Full name of the patient"
                            {...register("patientName")}
                            error={errors.patientName?.message}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-neutral-700 ml-1">Blood Group Needed</label>
                                <select
                                    {...register("bloodGroup")}
                                    className="w-full h-12 rounded-xl border border-neutral-200 px-4 focus:ring-2 focus:ring-red-500 outline-none"
                                >
                                    <option value="">Select Group</option>
                                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
                                        <option key={group} value={group}>{group}</option>
                                    ))}
                                </select>
                                {errors.bloodGroup && <p className="text-xs text-red-500 ml-1">{errors.bloodGroup.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-neutral-700 ml-1">Urgency Level</label>
                                <select
                                    {...register("urgency")}
                                    className="w-full h-12 rounded-xl border border-neutral-200 px-4 focus:ring-2 focus:ring-red-500 outline-none"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="emergency">Emergency (Immediate)</option>
                                </select>
                                {errors.urgency && <p className="text-xs text-red-500 ml-1">{errors.urgency.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Required Date"
                                type="date"
                                {...register("requiredDate")}
                                error={errors.requiredDate?.message}
                            />
                            <Input
                                label="Contact Number"
                                placeholder="017XXXXXXXX"
                                {...register("contactNumber")}
                                error={errors.contactNumber?.message}
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                Location Details
                            </h3>
                            <Input
                                label="Hospital / Exact Address"
                                placeholder="e.g. Apollo Hospital, Room 402"
                                {...register("location")}
                                error={errors.location?.message}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="District"
                                    placeholder="e.g. Dhaka"
                                    {...register("district")}
                                    error={errors.district?.message}
                                />
                                <Input
                                    label="Upazila"
                                    placeholder="e.g. Savar"
                                    {...register("upazila")}
                                    error={errors.upazila?.message}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-neutral-700 ml-1">Additional Notes</label>
                            <textarea
                                {...register("additionalNotes")}
                                className="w-full min-h-[100px] rounded-xl border border-neutral-200 p-4 focus:ring-2 focus:ring-red-500 outline-none resize-none"
                                placeholder="Any special instructions for donors..."
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-bold text-white shadow-lg"
                            style={{ backgroundColor: primaryColor }}
                            disabled={isSubmitting}
                        >
                            <Droplet className="w-5 h-5 mr-2" />
                            {isSubmitting ? "Postings..." : "Post Request"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
