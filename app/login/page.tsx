"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Phone, Lock } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { toast } from "sonner";
import Link from "next/link";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orgSlug = searchParams.get("org") || "";

    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                phone,
                password,
                redirect: false,
            });

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Login successful!");
                // Redirect to org dashboard if org provided, else home
                if (orgSlug) {
                    router.push(`/${orgSlug}/dashboard`);
                } else {
                    router.push("/");
                }
            }
        } catch (error: any) {
            toast.error("An error occurred during login");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden">
            <div className="h-2 w-full bg-red-600" />
            <CardHeader className="text-center pt-10 pb-6">
                <Link href="/" className="inline-flex items-center justify-center space-x-2 mb-6">
                    <div className="bg-red-100 p-2 rounded-xl">
                        <Droplet className="w-8 h-8 text-red-600 fill-current" />
                    </div>
                </Link>
                <CardTitle className="text-3xl font-black text-neutral-900">Welcome Back</CardTitle>
                <p className="text-neutral-500 font-medium mt-2">
                    Sign in to manage your blood bank
                </p>
            </CardHeader>
            <CardContent className="p-8 pt-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-neutral-700 ml-1 flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-neutral-400" />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="017XXXXXXXX"
                            required
                            className="w-full h-12 rounded-xl border border-neutral-200 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-neutral-700 ml-1 flex items-center">
                            <Lock className="w-4 h-4 mr-2 text-neutral-400" />
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            className="w-full h-12 rounded-xl border border-neutral-200 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-14 text-lg font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-neutral-500">
                        Don't have an account?{" "}
                        <Link
                            href={orgSlug ? `/${orgSlug}/register` : "/#organizations"}
                            className="font-bold text-red-600 hover:underline"
                        >
                            Register as a donor
                        </Link>
                    </p>
                </div>

                {/* Demo credentials hint */}
                <div className="mt-6 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                    <p className="text-xs text-neutral-500 text-center">
                        <span className="font-bold">Demo:</span> Use any registered phone number with password <code className="bg-neutral-200 px-1 rounded">demo123</code>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

function LoginFormFallback() {
    return (
        <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden">
            <div className="h-2 w-full bg-red-600" />
            <CardHeader className="text-center pt-10 pb-6">
                <div className="inline-flex items-center justify-center space-x-2 mb-6">
                    <div className="bg-red-100 p-2 rounded-xl">
                        <Droplet className="w-8 h-8 text-red-600 fill-current" />
                    </div>
                </div>
                <CardTitle className="text-3xl font-black text-neutral-900">Welcome Back</CardTitle>
                <p className="text-neutral-500 font-medium mt-2">
                    Loading...
                </p>
            </CardHeader>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-neutral-50 py-12 px-4">
            <Suspense fallback={<LoginFormFallback />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
