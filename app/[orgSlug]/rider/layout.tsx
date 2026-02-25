"use client";

import { useState, useEffect } from "react";
import {
    Bike,
    MapPin,
    Package,
    ChevronRight,
    History,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    User as UserIcon,
    Droplet
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const riderNavItems = [
    { href: "/rider", label: "Tasks Feed", icon: Package },
    { href: "/rider/active", label: "Active Delivery", icon: Bike },
    { href: "/rider/history", label: "History", icon: History },
    { href: "/rider/profile", label: "Profile", icon: UserIcon },
];

export default function RiderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const orgSlug = params.orgSlug as string;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 h-16">
                <div className="px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="lg:hidden p-2 hover:bg-slate-800 rounded-lg"
                        >
                            {isMobileMenuOpen ? <X /> : <Menu />}
                        </button>
                        <Link href={`/${orgSlug}/rider`} className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                                <Bike className="w-4 h-4 text-red-500" />
                            </div>
                            <span className="font-black text-white tracking-tight hidden sm:block">
                                Rider<span className="text-red-500">Hub</span>
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-slate-800 rounded-lg relative">
                            <Bell className="w-5 h-5 text-slate-400" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900" />
                        </button>
                        <div className="h-8 w-px bg-white/5 mx-2" />
                        <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-800/50 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center">
                                <UserIcon className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="hidden md:block">
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Volunteer</div>
                                <div className="text-sm font-black text-white leading-none">{session?.user?.name || "Rider"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-slate-950 p-4 sticky top-16 h-[calc(100vh-4rem)]">
                    <nav className="flex-1 space-y-1">
                        {riderNavItems.map((item) => {
                            const isActive = pathname === `/${orgSlug}${item.href}`;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={`/${orgSlug}${item.href}`}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all
                                        ${isActive
                                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                            : "text-slate-400 hover:text-white hover:bg-slate-900"
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-4 mt-4 border-t border-white/5">
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/95 pt-20 p-4">
                        <nav className="space-y-4">
                            {riderNavItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={`/${orgSlug}${item.href}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-white/5 text-lg font-black"
                                    >
                                        <Icon className="w-6 h-6 text-red-500" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 lg:p-8 p-4 bg-slate-950">
                    {children}
                </main>
            </div>
        </div>
    );
}
