"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Droplet, Heart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

const donorSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    age: z.number().min(18, "Must be at least 18 years old").max(65, "Age must be under 65"),
    gender: z.enum(["Male", "Female", "Other"]),
    phone: z.string().min(10, "Valid phone number required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    bloodGroup: z.string().min(1, "Please select a blood group"),
    district: z.string().min(1, "District is required"),
    upazila: z.string().min(1, "Upazila is required"),
    village: z.string().optional(),
    lastDonationDate: z.string().optional(),
});

type DonorFormValues = z.infer<typeof donorSchema>;

export default function DonorRegistration() {
    const organization = useOrganization();
    const router = useRouter();
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

            toast.success("Registration successful! You are now a donor.");
            router.push(`/${organization.slug}/donors`);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-slate-950 to-slate-950 opacity-50" />

            <div className="container mx-auto px-4 relative z-10 max-w-2xl">
                <Card className="border-none shadow-2xl overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-800">
                    <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />
                    <CardHeader className="text-center pt-8">
                        <Link href={`/${organization.slug}`} className="mx-auto w-16 h-16 bg-red-500/10 p-2 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20 group">
                            <Droplet className="w-8 h-8 text-red-500 fill-current group-hover:scale-110 transition-transform" />
                        </Link>
                        <CardTitle className="text-3xl font-black text-white tracking-tight">Become a Life Saver</CardTitle>
                        <p className="text-slate-400 font-medium">Register as a donor at {organization.name}</p>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                                    <input
                                        {...register("name")}
                                        placeholder="Enter your name"
                                        className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600"
                                    />
                                    {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Age</label>
                                    <input
                                        type="number"
                                        {...register("age", { valueAsNumber: true })}
                                        placeholder="18-65"
                                        className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600"
                                    />
                                    {errors.age && <p className="text-xs text-red-500 ml-1">{errors.age.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Gender</label>
                                    <select
                                        {...register("gender")}
                                        className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white appearance-none"
                                        style={{ colorScheme: "dark" }}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.gender && <p className="text-xs text-red-500 ml-1">{errors.gender.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Blood Group</label>
                                    <select
                                        {...register("bloodGroup")}
                                        className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white appearance-none"
                                        style={{ colorScheme: "dark" }}
                                    >
                                        <option value="">Select Group</option>
                                        {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
                                            <option key={group} value={group}>{group}</option>
                                        ))}
                                    </select>
                                    {errors.bloodGroup && <p className="text-xs text-red-500 ml-1">{errors.bloodGroup.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Phone Number</label>
                                    <input
                                        {...register("phone")}
                                        placeholder="017XXXXXXXX"
                                        className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600"
                                    />
                                    {errors.phone && <p className="text-xs text-red-500 ml-1">{errors.phone.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Password</label>
                                    <input
                                        type="password"
                                        {...register("password")}
                                        placeholder="••••••••"
                                        className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600"
                                    />
                                    {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">District</label>
                                    <input
                                        {...register("district")}
                                        placeholder="e.g. Dhaka"
                                        className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600"
                                    />
                                    {errors.district && <p className="text-xs text-red-500 ml-1">{errors.district.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Upazila</label>
                                    <input
                                        {...register("upazila")}
                                        placeholder="e.g. Savar"
                                        className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600"
                                    />
                                    {errors.upazila && <p className="text-xs text-red-500 ml-1">{errors.upazila.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Village / Area (Optional)</label>
                                <input
                                    {...register("village")}
                                    placeholder="Enter your village name"
                                    className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Last Donation Date (Optional)</label>
                                <input
                                    type="date"
                                    {...register("lastDonationDate")}
                                    className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white"
                                    style={{ colorScheme: "dark" }}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 text-lg font-black uppercase tracking-widest text-white shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] mt-4"
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
        </div>
    );
}
