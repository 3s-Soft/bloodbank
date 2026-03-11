"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Droplet, Heart, Mail, User, Activity, MapPin, ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

const donorSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.union([z.string().email("Valid email required"), z.literal("")]).optional(),
    age: z.number().min(18, "Must be at least 18 years old").max(65, "Age must be under 65"),
    gender: z.enum(["Male", "Female", "Other"]),
    phone: z.string().min(10, "Valid phone number required"),
    password: z.union([z.string().min(6, "Password must be at least 6 characters"), z.literal("")]).optional(),
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

    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [step, setStep] = useState(1);

    const {
        register,
        handleSubmit,
        setValue,
        trigger,
        formState: { errors, isSubmitting },
    } = useForm<DonorFormValues>({
        resolver: zodResolver(donorSchema),
        mode: "onTouched"
    });

    const nextStep = async () => {
        let valid = false;
        if (step === 1) {
            valid = await trigger(["name", "email", "password"]);
        } else if (step === 2) {
            valid = await trigger(["age", "gender", "bloodGroup", "lastDonationDate"]);
        }
        if (valid) setStep((s) => s + 1);
    };

    const prevStep = () => setStep((s) => s - 1);

    const handleGoogleSignUp = async () => {
        setIsGoogleLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            if (user) {
                toast.success(`Google account linked! Please complete your donor profile.`);
                // Pre-fill form
                if (user.displayName) setValue("name", user.displayName);
                if (user.email) setValue("email", user.email);
            }
        } catch (error: any) {
            console.error("Google Sign-In Error:", error);
            toast.error("Failed to link Google account");
        } finally {
            setIsGoogleLoading(false);
        }
    };

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
            toast.error(error instanceof Error ? error.message : "An error occurred");
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
                        <Button
                            type="button"
                            onClick={handleGoogleSignUp}
                            disabled={isSubmitting || isGoogleLoading}
                            variant="outline"
                            className="w-full h-12 border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold mb-6"
                        >
                            {isGoogleLoading ? (
                                "Connecting..."
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continue with Google
                                </div>
                            )}
                        </Button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-800"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                                <span className="bg-[#0f172a] px-3 text-slate-500">Or register manually</span>
                            </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="flex items-center justify-between mb-8 relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full z-0">
                                <div 
                                    className="h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${((step - 1) / 2) * 100}%`, backgroundColor: primaryColor }}
                                />
                            </div>
                            
                            {[
                                { num: 1, icon: User, label: "Account" },
                                { num: 2, icon: Activity, label: "Biology" },
                                { num: 3, icon: MapPin, label: "Location" }
                            ].map((s) => (
                                <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                                    <div 
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                            step >= s.num 
                                            ? "bg-slate-900 shadow-[0_0_15px_rgba(239,68,68,0.5)]" 
                                            : "bg-slate-900 border-slate-700 text-slate-500"
                                        }`}
                                        style={{ borderColor: step >= s.num ? primaryColor : "" }}
                                    >
                                        <s.icon className={`w-5 h-5 ${step >= s.num ? "text-white" : ""}`} style={{ color: step >= s.num ? primaryColor : "" }} />
                                    </div>
                                    <span className={`text-[10px] uppercase tracking-widest font-black ${step >= s.num ? "text-white" : "text-slate-600"}`}>
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative min-h-[400px]">
                            
                            {/* STEP 1: Account Setup */}
                            <div className={`transition-all duration-500 absolute w-full ${step === 1 ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</label>
                                        <input
                                            {...register("name")}
                                            placeholder="Enter your name"
                                            className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600 shadow-inner"
                                        />
                                        {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address (Optional)</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input
                                                type="email"
                                                {...register("email")}
                                                placeholder="name@example.com"
                                                className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 pl-11 pr-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600 shadow-inner"
                                            />
                                        </div>
                                        {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Password (Optional)</label>
                                        <input
                                            type="password"
                                            {...register("password")}
                                            placeholder="••••••••"
                                            className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600 shadow-inner"
                                        />
                                        {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* STEP 2: Biology */}
                            <div className={`transition-all duration-500 absolute w-full ${step === 2 ? 'opacity-100 translate-x-0 pointer-events-auto' : step < 2 ? 'opacity-0 translate-x-10 pointer-events-none' : 'opacity-0 -translate-x-10 pointer-events-none'}`}>
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Age</label>
                                            <input
                                                type="number"
                                                {...register("age", { valueAsNumber: true })}
                                                placeholder="18-65"
                                                className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600 shadow-inner"
                                            />
                                            {errors.age && <p className="text-xs text-red-500 ml-1">{errors.age.message}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Gender</label>
                                            <select
                                                {...register("gender")}
                                                className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white appearance-none shadow-inner"
                                                style={{ colorScheme: "dark" }}
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            {errors.gender && <p className="text-xs text-red-500 ml-1">{errors.gender.message}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Blood Group</label>
                                        <select
                                            {...register("bloodGroup")}
                                            className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white appearance-none shadow-inner"
                                            style={{ colorScheme: "dark" }}
                                        >
                                            <option value="">Select Group</option>
                                            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((group) => (
                                                <option key={group} value={group}>{group}</option>
                                            ))}
                                        </select>
                                        {errors.bloodGroup && <p className="text-xs text-red-500 ml-1">{errors.bloodGroup.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Last Donation Date (Optional)</label>
                                        <input
                                            type="date"
                                            {...register("lastDonationDate")}
                                            className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white shadow-inner"
                                            style={{ colorScheme: "dark" }}
                                        />
                                    </div>
                                </div>
                            </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Phone Number</label>
                                    <input
                                        {...register("phone")}
                                        placeholder="017XXXXXXXX"
                                        className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600"
                                    />
                                    {errors.phone && <p className="text-xs text-red-500 ml-1">{errors.phone.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">District</label>
                                    <input
                                        {...register("district")}
                                        placeholder="e.g. Dhaka"
                                        className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600"
                                    />
                                    {errors.district && <p className="text-xs text-red-500 ml-1">{errors.district.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
