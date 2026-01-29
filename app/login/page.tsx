"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Phone, Lock, ArrowLeft } from "lucide-react";
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
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

    const handleGoogleSignIn = async () => {
        setIsGoogleLoading(true);
        try {
            await signIn("google", { callbackUrl: orgSlug ? `/${orgSlug}/dashboard` : "/" });
        } catch (error) {
            toast.error("Google sign-in failed");
            setIsGoogleLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-sm border-none shadow-2xl overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-800">
            <div className="h-2 w-full bg-red-600" />
            <CardHeader className="text-center pt-8 pb-4">
                <Link href="/" className="inline-flex items-center justify-center space-x-2 mb-4">
                    <div className="bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                        <Droplet className="w-6 h-6 text-red-500 fill-current" />
                    </div>
                </Link>
                <CardTitle className="text-3xl font-black text-white tracking-tight">Welcome Back</CardTitle>
                <p className="text-slate-400 font-medium mt-1 text-sm">
                    Manage your life-saving community
                </p>
            </CardHeader>
            <CardContent className="p-8 pt-2">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center">
                            <Phone className="w-3 h-3 mr-2" />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="017XXXXXXXX"
                            required
                            className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1 flex items-center">
                            <Lock className="w-3 h-3 mr-2" />
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900 px-4 focus:ring-2 focus:ring-red-500 outline-none transition-all text-white placeholder-slate-600"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-sm font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/20"
                        disabled={isLoading || isGoogleLoading}
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                </form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-800"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest font-black">
                        <span className="bg-[#0f172a] px-3 text-slate-500">Or continue with</span>
                    </div>
                </div>

                <Button
                    variant="outline"
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || isGoogleLoading}
                    className="w-full h-12 border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold"
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
                            Google
                        </div>
                    )}
                </Button>

                <div className="mt-8 text-center space-y-4">
                    <p className="text-xs text-slate-500 font-medium">
                        Don't have an account?{" "}
                        <Link
                            href={orgSlug ? `/${orgSlug}/register` : "/#organizations"}
                            className="font-black text-red-500 hover:text-red-400"
                        >
                            Register
                        </Link>
                    </p>

                    <Link href="/" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors">
                        <ArrowLeft className="w-3 h-3 mr-1" />
                        Back to Home
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

function LoginFormFallback() {
    return (
        <Card className="w-full max-w-sm border-none shadow-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-800">
            <div className="h-2 w-full bg-red-600" />
            <CardHeader className="text-center pt-8">
                <div className="animate-pulse space-y-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-xl mx-auto" />
                    <div className="h-8 w-48 bg-slate-800 rounded mx-auto" />
                    <div className="h-4 w-64 bg-slate-800 rounded mx-auto" />
                </div>
            </CardHeader>
        </Card>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-slate-950 to-slate-950 opacity-50" />
            <div className="absolute top-0 left-0 w-full h-full gradient-mesh opacity-20" />
            <Suspense fallback={<LoginFormFallback />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
