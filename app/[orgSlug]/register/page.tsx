"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { LocationSelect } from "@/components/ui/location-select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Droplet, Heart, Mail } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { apiPost } from "@/lib/api/client";

/**
 * Donor registration.
 *
 * This was previously a three-step wizard, but the step state was never
 * advanced: `nextStep`/`prevStep` existed and nothing called them, so panels two
 * and three stayed hidden while a duplicate set of fields rendered on top of
 * panel one. The form could not be completed. It is now a single page, which is
 * also the better fit for the audience — mostly phones on slow connections,
 * where fewer interactions beats staged reveals.
 *
 * The schema mirrors the server's `donorRegistrationSchema`. It previously
 * diverged (a 6-character password minimum against the server's 8, plus `age`
 * and `gender` fields that no column stores and the API discards), so a form
 * that passed client validation could still be rejected.
 */
const donorSchema = z
    .object({
        name: z.string().trim().min(2, "Name must be at least 2 characters"),
        phone: z
            .union([
                z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid 11-digit mobile number"),
                z.literal(""),
            ])
            .optional(),
        email: z.union([z.string().email("Enter a valid email address"), z.literal("")]).optional(),
        password: z
            .union([z.string().min(8, "Password must be at least 8 characters"), z.literal("")])
            .optional(),
        bloodGroup: z.string().min(1, "Please select a blood group"),
        district: z.string().min(1, "District is required"),
        upazila: z.string().min(1, "Upazila is required"),
        village: z.string().optional(),
        lastDonationDate: z.string().optional(),
    })
    .refine((value) => Boolean(value.phone || value.email), {
        message: "Provide a phone number or an email address",
        path: ["phone"],
    });

type DonorFormValues = z.infer<typeof donorSchema>;

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const fieldClass =
    "w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600 shadow-inner";
const labelClass = "text-xs font-bold uppercase tracking-widest text-slate-500 ml-1";

export default function DonorRegistration() {
    const organization = useOrganization();
    const router = useRouter();
    const primaryColor = organization.primaryColor || "#D32F2F";

    const { data: session } = useSession();
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [hasPrefilled, setHasPrefilled] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<DonorFormValues>({
        resolver: zodResolver(donorSchema),
        mode: "onTouched",
        // district and upazila are set through LocationSelect rather than a
        // registered input; without defaults they are undefined and Zod reports
        // a type error instead of "District is required".
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            password: "",
            bloodGroup: "",
            district: "",
            upazila: "",
            village: "",
            lastDonationDate: "",
        },
    });

    /**
     * Google sign-in is a full-page redirect through NextAuth, not the popup
     * Firebase provided, so anything already typed would be lost. Prefill
     * happens on the way back instead.
     */
    const handleGoogleSignUp = async () => {
        setIsGoogleLoading(true);
        try {
            await signIn("google", { callbackUrl: `/${organization.slug}/register` });
        } catch (error) {
            console.error("Google sign-in failed:", error);
            toast.error("Failed to link Google account");
            setIsGoogleLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user && !hasPrefilled) {
            if (session.user.name) setValue("name", session.user.name);
            if (session.user.email) setValue("email", session.user.email);
            setHasPrefilled(true);
            toast.success("Google account linked. Please complete your donor profile.");
        }
    }, [session, hasPrefilled, setValue]);

    const onSubmit = async (data: DonorFormValues) => {
        try {
            await apiPost("/api/donors/register", { ...data, orgSlug: organization.slug });

            toast.success("Registration successful! You are now a donor.");
            router.push(`/${organization.slug}/donors`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An error occurred");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-slate-950 to-slate-950 opacity-50" />

            <div className="container mx-auto px-4 relative z-10 max-w-2xl">
                <Card className="border-none shadow-2xl overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-800">
                    <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />

                    <CardHeader className="text-center pt-8">
                        <Link
                            href={`/${organization.slug}`}
                            className="mx-auto w-16 h-16 bg-red-500/10 p-2 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20 group"
                        >
                            <Droplet className="w-8 h-8 text-red-500 fill-current group-hover:scale-110 transition-transform" />
                        </Link>
                        <CardTitle as="h1" className="text-3xl font-black text-white tracking-tight">
                            Become a Life Saver
                        </CardTitle>
                        <p className="text-slate-400 font-medium">
                            Register as a donor at {organization.name}
                        </p>
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
                                <div className="w-full border-t border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
                                <span className="bg-[#0f172a] px-3 text-slate-500">
                                    Or register manually
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className={labelClass}>Full Name</label>
                                <input
                                    {...register("name")}
                                    placeholder="Enter your name"
                                    className={fieldClass}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Phone Number</label>
                                    <input
                                        {...register("phone")}
                                        inputMode="numeric"
                                        placeholder="017XXXXXXXX"
                                        className={fieldClass}
                                    />
                                    {errors.phone && (
                                        <p className="text-xs text-red-500 ml-1">
                                            {errors.phone.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className={labelClass}>Email Address (Optional)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="email"
                                            {...register("email")}
                                            placeholder="name@example.com"
                                            className={`${fieldClass} pl-11`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-xs text-red-500 ml-1">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>Password (Optional)</label>
                                <input
                                    type="password"
                                    {...register("password")}
                                    placeholder="••••••••"
                                    className={fieldClass}
                                />
                                <p className="text-[11px] text-slate-500 ml-1">
                                    Set a password to sign in later. At least 8 characters.
                                </p>
                                {errors.password && (
                                    <p className="text-xs text-red-500 ml-1">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className={labelClass}>Blood Group</label>
                                <select
                                    {...register("bloodGroup")}
                                    className={`${fieldClass} appearance-none`}
                                    style={{ colorScheme: "dark" }}
                                    defaultValue=""
                                >
                                    <option value="">Select Group</option>
                                    {BLOOD_GROUPS.map((group) => (
                                        <option key={group} value={group}>
                                            {group}
                                        </option>
                                    ))}
                                </select>
                                {errors.bloodGroup && (
                                    <p className="text-xs text-red-500 ml-1">
                                        {errors.bloodGroup.message}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className={labelClass}>District</label>
                                    <LocationSelect
                                        type="district"
                                        value={watch("district") || ""}
                                        onChange={(value) => {
                                            setValue("district", value, { shouldValidate: true });
                                            // The upazila list depends on the district, so a
                                            // stale selection must not survive the change.
                                            setValue("upazila", "", { shouldValidate: false });
                                        }}
                                        error={errors.district?.message}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className={labelClass}>Upazila</label>
                                    <LocationSelect
                                        type="upazila"
                                        district={watch("district")}
                                        value={watch("upazila") || ""}
                                        onChange={(value) =>
                                            setValue("upazila", value, { shouldValidate: true })
                                        }
                                        error={errors.upazila?.message}
                                        disabled={!watch("district")}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className={labelClass}>Village (Optional)</label>
                                    <input
                                        {...register("village")}
                                        placeholder="Your village or area"
                                        className={fieldClass}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className={labelClass}>
                                        Last Donation Date (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        {...register("lastDonationDate")}
                                        className={fieldClass}
                                        style={{ colorScheme: "dark" }}
                                    />
                                </div>
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
