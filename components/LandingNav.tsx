"use client";

import { User, LogOut } from "lucide-react";
import Link from "next/link";

import BrandLogo from "@/components/BrandLogo";
import { useSession, signOut } from "next-auth/react";

export default function LandingNav() {
    const { data: session, status } = useSession();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="group">
                    <BrandLogo size="md" priority />
                </Link>

                <div className="hidden lg:flex items-center space-x-8">
                    <Link href="#features" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">How It Works</Link>
                    <Link href="#organizations" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Find Blood Banks</Link>
                    <Link href="/docs" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Documentation</Link>
                </div>

                <div className="flex items-center space-x-3">
                    {status === "loading" ? (
                        <div className="w-24 h-10 bg-slate-800/50 rounded-xl animate-pulse" />
                    ) : status === "authenticated" && session?.user ? (
                        <>
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                                <span className="text-sm text-slate-300 font-medium truncate max-w-[100px]">
                                    {session.user.name || session.user.email}
                                </span>
                            </div>
                            {session.user.role === "super_admin" && (
                                <Link
                                    href="/admin"
                                    className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Admin
                                </Link>
                            )}
                            <button
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="h-9 px-4 rounded-xl border border-slate-700/50 text-slate-400 text-sm font-medium hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="h-10 px-6 rounded-xl text-slate-400 text-sm font-bold hover:text-white transition-all flex items-center justify-center"
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className="h-10 px-6 rounded-xl bg-white text-black text-sm font-bold hover:bg-slate-100 transition-all flex items-center justify-center shadow-lg"
                            >
                                Join Now
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
