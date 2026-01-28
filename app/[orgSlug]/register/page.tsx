"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Droplet, Heart } from "lucide-react";

const donorSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    age: z.number().min(18, "Must be at least 18 years old").max(65, "Age must be under 65"),
    gender: z.enum(["Male", "Female", "Other"]),
    phone: z.string().min(10, "Valid phone number required"),
    bloodGroup: z.string().min(1, "Please select a blood group"),
    district: z.string().min(1, "District is required"),
    upazila: z.string().min(1, "Upazila is required"),
    village: z.string().optional(),
    lastDonationDate: z.string().optional(),
});

type DonorFormValues = z.infer<typeof donorSchema>;

export default function DonorRegistration() {
    const organization = useOrganization();
    const primaryColor = organization.primaryColor || "#D32F2F";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<DonorFormValues>({
        resolver: zodResolver(donorSchema),
    });

    const onSubmit = async (data: DonorFormValues) => {
        try {
            const response = await fetch("/api/donors/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...data, orgSlug: organization.slug }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Something went wrong");
            }

            alert("Registration successful! You are now a donor.");
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
                        <Droplet className="w-8 h-8" style={{ color: primaryColor }} />
                    </div>
                    <CardTitle className="text-3xl font-black text-neutral-900">Become a Life Saver</CardTitle>
                    <p className="text-neutral-500 font-medium">Register as a donor at {organization.name}</p>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Full Name"
                                placeholder="Enter your name"
                                {...register("name")}
                                error={errors.name?.message}
                            />
                            <Input
                                label="Age"
                                type="number"
                                placeholder="18-65"
                                {...register("age", { valueAsNumber: true })}
                                error={errors.age?.message}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-neutral-700 ml-1">Gender</label>
                                <select
                                    {...register("gender")}
                                    className="w-full h-12 rounded-xl border border-neutral-200 px-4 focus:ring-2 focus:ring-red-500 outline-none"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <p className="text-xs text-red-500 ml-1">{errors.gender.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-neutral-700 ml-1">Blood Group</label>
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
                        </div>

                        <Input
                            label="Phone Number"
                            placeholder="017XXXXXXXX"
                            {...register("phone")}
                            error={errors.phone?.message}
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

                        <Input
                            label="Village / Area (Optional)"
                            placeholder="Enter your village name"
                            {...register("village")}
                        />

                        <Input
                            label="Last Donation Date (Optional)"
                            type="date"
                            {...register("lastDonationDate")}
                        />

                        <Button
                            type="submit"
                            className="w-full h-14 text-lg font-bold text-white shadow-lg"
                            style={{ backgroundColor: primaryColor }}
                            disabled={isSubmitting}
                        >
                            <Heart className="w-5 h-5 mr-2" />
                            {isSubmitting ? "Registering..." : "Complete Registration"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
