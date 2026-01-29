"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrganization } from "@/lib/context/OrganizationContext";
import {
    LayoutDashboard,
    Users,
    Droplet,
    UserCheck,
    Settings,
    ArrowLeft,
} from "lucide-react";

const navItems = [
    { href: "", label: "Overview", icon: LayoutDashboard },
    { href: "/donors", label: "Manage Donors", icon: UserCheck },
    { href: "/requests", label: "Blood Requests", icon: Droplet },
    { href: "/users", label: "User Management", icon: Users },
    { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ orgSlug: string }>;
}) {
    const pathname = usePathname();
    const org = useOrganization();
    const primaryColor = org?.primaryColor || "#D32F2F";

    // Extract orgSlug from pathname since we can't use async params in client component easily
    const pathParts = pathname.split("/");
    const orgSlug = pathParts[1];
    const basePath = `/${orgSlug}/dashboard`;

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 border-r border-slate-800 pt-20 hidden lg:block shadow-2xl">
                <div className="px-4 py-6">
                    {/* Org Badge */}
                    <div className="mb-6 p-4 rounded-xl border border-slate-800 bg-slate-950/50">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {org?.name?.charAt(0) || "O"}
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm tracking-tight">{org?.name || "Organization"}</div>
                                <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">Admin Dashboard</div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const fullPath = item.href ? `${basePath}${item.href}` : basePath;
                            const isActive = pathname === fullPath;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={fullPath}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive
                                        ? "text-white shadow-lg"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                                        }`}
                                    style={isActive ? { backgroundColor: primaryColor } : {}}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Back to Site */}
                    <div className="mt-8 pt-6 border-t border-slate-800">
                        <Link
                            href={`/${orgSlug}`}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Site
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-16 left-0 right-0 z-30 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
                    {navItems.map((item) => {
                        const fullPath = item.href ? `${basePath}${item.href}` : basePath;
                        const isActive = pathname === fullPath;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={fullPath}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${isActive
                                    ? "text-white shadow-lg"
                                    : "bg-slate-800 text-slate-400"
                                    }`}
                                style={isActive ? { backgroundColor: primaryColor } : {}}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
                <div className="lg:hidden h-14" /> {/* Spacer for mobile nav */}
                {children}
            </main>
        </div>
    );
}
