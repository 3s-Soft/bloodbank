"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import {
    Book,
    LayoutDashboard,
    UserCheck,
    Droplet,
    Shield,
    Settings,
    Search,
    ChevronRight,
    ArrowLeft,
    CheckCircle2,
    Info,
    AlertTriangle,
    LifeBuoy
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";

const sections = [
    {
        id: "getting-started",
        title: "Getting Started",
        icon: LayoutDashboard,
        subsections: [
            { id: "overview", title: "Dashboard Overview" },
            { id: "navigation", title: "Platform Navigation" },
            { id: "organization-profile", title: "Organization Profile" }
        ]
    },
    {
        id: "donor-management",
        title: "Donor Management",
        icon: UserCheck,
        subsections: [
            { id: "verifying-donors", title: "Verifying Donors" },
            { id: "searching-donors", title: "Advanced Search" },
            { id: "availability", title: "Managing Availability" }
        ]
    },
    {
        id: "blood-requests",
        title: "Blood Requests",
        icon: Droplet,
        subsections: [
            { id: "creation", title: "Handling New Requests" },
            { id: "urgency", title: "Understanding Urgency" },
            { id: "fulfillment", title: "Fulfillment & Tracking" }
        ]
    },
    {
        id: "security",
        title: "Security & Access",
        icon: Shield,
        subsections: [
            { id: "roles", title: "User Roles & Permissions" },
            { id: "audit-logs", title: "Audit Log Monitoring" },
            { id: "data-privacy", title: "Data Protection Protocols" }
        ]
    },
    {
        id: "settings",
        title: "System Configuration",
        icon: Settings,
        subsections: [
            { id: "branding", title: "Branding & Appearance" },
            { id: "notifications", title: "Notification Preferences" },
            { id: "integrations", title: "External Integrations" }
        ]
    }
];

export default function OrganizationDocs() {
    const organization = useOrganization();
    const primaryColor = organization.primaryColor || "#dc2626";
    const [searchQuery, setSearchQuery] = useState("");
    const [activeSection, setActiveSection] = useState("getting-started");

    const filteredSections = useMemo(() => {
        if (!searchQuery) return sections;
        return sections.filter(s =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.subsections.some(sub => sub.title.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 h-16">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/${organization.slug}/dashboard`} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}15` }}>
                                <Book className="w-5 h-5" style={{ color: primaryColor }} />
                            </div>
                            <h1 className="text-lg font-black text-white tracking-tight">Organization Documentation</h1>
                        </div>
                    </div>

                    <div className="relative w-64 hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Find a guide..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-9 pl-9 pr-4 rounded-full bg-slate-800 border-none text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500/50 outline-none"
                        />
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 flex-grow flex gap-12">
                {/* Sidebar Navigation */}
                <aside className="w-64 shrink-0 hidden lg:block h-[calc(100vh-8rem)] sticky top-24 overflow-y-auto">
                    <nav className="space-y-8">
                        {filteredSections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <div key={section.id}>
                                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">
                                        <Icon className="w-3.5 h-3.5 outline-none" />
                                        {section.title}
                                    </h4>
                                    <ul className="space-y-1">
                                        {section.subsections.map((sub) => (
                                            <li key={sub.id}>
                                                <button
                                                    onClick={() => {
                                                        setActiveSection(section.id);
                                                        const el = document.getElementById(sub.id);
                                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                    }}
                                                    className="w-full flex items-center justify-between text-left px-3 py-2 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all group"
                                                >
                                                    {sub.title}
                                                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </nav>

                    <div className="mt-12 p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
                        <LifeBuoy className="w-6 h-6 text-slate-500 mb-3" />
                        <h5 className="text-white text-sm font-bold mb-2">Need Support?</h5>
                        <p className="text-slate-500 text-[11px] leading-relaxed mb-4">
                            Can't find what you're looking for? Reach out to our technical team.
                        </p>
                        <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg transition-colors">
                            Contact Support
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-grow max-w-3xl">
                    <section id="getting-started" className="mb-20 scroll-mt-24">
                        <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                            Getting Started
                            <div className="h-px flex-grow bg-slate-800" />
                        </h2>

                        <div className="space-y-16">
                            <div id="overview" className="scroll-mt-24">
                                <h3 className="text-xl font-bold text-white mb-4">Dashboard Overview</h3>
                                <p className="text-slate-400 font-medium leading-relaxed mb-6">
                                    The organization dashboard provides a centralized command center for monitoring donation activity, request fulfillment, and platform growth. Real-time analytics charts visualize your organization's impact across different districts and blood groups.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                        <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Real-time Stats
                                        </div>
                                        <p className="text-slate-500 text-xs font-medium">Instantly see active requests, emergency cases, and donor availability.</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                        <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            Activity Feed
                                        </div>
                                        <p className="text-slate-500 text-xs font-medium">Keep track of every user action and platform event in real-time.</p>
                                    </div>
                                </div>
                            </div>

                            <div id="navigation" className="scroll-mt-24">
                                <h3 className="text-xl font-bold text-white mb-4">Platform Navigation</h3>
                                <p className="text-slate-400 font-medium leading-relaxed mb-4">
                                    Efficiently switch between different management tools through the left sidebar on desktop or the top scrolling navigation on mobile.
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-500 text-sm font-medium">
                                    <li><strong className="text-slate-300">Overview:</strong> The analytics hub for your organization.</li>
                                    <li><strong className="text-slate-300">Manage Donors:</strong> The complete database of your life-savers.</li>
                                    <li><strong className="text-slate-300">Blood Requests:</strong> Active and past requests management.</li>
                                    <li><strong className="text-slate-300">Settings:</strong> Branding, contact, and system configuration.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section id="donor-management" className="mb-20 scroll-mt-24">
                        <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                            Donor Management
                            <div className="h-px flex-grow bg-slate-800" />
                        </h2>

                        <div className="space-y-16">
                            <div id="verifying-donors" className="scroll-mt-24">
                                <h3 className="text-xl font-bold text-white mb-4">Verifying Donors</h3>
                                <p className="text-slate-400 font-medium leading-relaxed mb-4">
                                    Trust is our primary currency. Every donor on the platform should be verified to ensure the safety of the recipients. Our multi-step verification process involves:
                                </p>
                                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 border-l-4 border-l-blue-500">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Info className="w-5 h-5 text-blue-500" />
                                        <span className="text-white font-bold">Verification Protocol</span>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-0">
                                        Always cross-check donor identification cards and historical donation records before marking a donor as verified. Verified donors receive a badge and higher priority in search results.
                                    </p>
                                </div>
                            </div>

                            <div id="searching-donors" className="scroll-mt-24">
                                <h3 className="text-xl font-bold text-white mb-4">Advanced Search Logic</h3>
                                <p className="text-slate-400 font-medium leading-relaxed mb-4">
                                    Our matching engine uses a proprietary geolocation and urgency-based algorithm to sort donors. When you perform a search, the system considers:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                        <div className="text-red-500 font-black text-xs mb-2">CRITERIA 01</div>
                                        <div className="text-white font-bold text-sm mb-1">Blood Compatibility</div>
                                        <p className="text-slate-500 text-[10px]">Matches based on universal donor/recipient rules (e.g., O- as universal donor).</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                        <div className="text-blue-500 font-black text-xs mb-2">CRITERIA 02</div>
                                        <div className="text-white font-bold text-sm mb-1">Proximity Radius</div>
                                        <p className="text-slate-500 text-[10px]">Prioritizes donors within the same Upazila and District to minimize transport time.</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                                        <div className="text-orange-500 font-black text-xs mb-2">CRITERIA 03</div>
                                        <div className="text-white font-bold text-sm mb-1">Donation Interval</div>
                                        <p className="text-slate-500 text-[10px]">Filters out donors who have donated within the last 120 days for their safety.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="blood-requests" className="mb-20 scroll-mt-24">
                        <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                            Blood Requests & Crisis Management
                            <div className="h-px flex-grow bg-slate-800" />
                        </h2>

                        <div className="space-y-16">
                            <div id="creation" className="scroll-mt-24">
                                <h3 className="text-xl font-bold text-white mb-4">Emergency Broadcasting</h3>
                                <p className="text-slate-400 font-medium leading-relaxed mb-6">
                                    For "High Urgency" requests, organization administrators can trigger an emergency broadcast. This protocol bypasses standard filters to notify all registered donors in the region.
                                </p>
                                <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 border-l-4 border-l-red-500">
                                    <h5 className="text-red-500 font-black text-xs uppercase mb-3 tracking-widest">Protocol: Urgent Response</h5>
                                    <ol className="space-y-3 text-slate-400 text-sm font-medium">
                                        <li className="flex gap-3"><span className="text-white opacity-20">01</span> Verify the hospital request document.</li>
                                        <li className="flex gap-3"><span className="text-white opacity-20">02</span> Set request status to "Urgent" in the dashboard.</li>
                                        <li className="flex gap-3"><span className="text-white opacity-20">03</span> Use the "Direct Match" tool to contact the top 5 compatible donors.</li>
                                    </ol>
                                </div>
                            </div>

                            <div id="fulfillment" className="scroll-mt-24">
                                <h3 className="text-xl font-bold text-white mb-4">Data Export & Reporting</h3>
                                <p className="text-slate-400 font-medium leading-relaxed mb-4">
                                    Need reports for hospital audits or government compliance? You can export your organization's activity data at any time.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-bold text-slate-400 uppercase">Export CSV</span>
                                    <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-bold text-slate-400 uppercase">Monthly Impact Report</span>
                                    <span className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-[10px] font-bold text-slate-400 uppercase">Donor Demographics</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="security" className="mb-20 scroll-mt-24">
                        <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-4">
                            Security & Access
                            <div className="h-px flex-grow bg-slate-800" />
                        </h2>

                        <div className="space-y-16">
                            <div id="roles" className="scroll-mt-24">
                                <h3 className="text-xl font-bold text-white mb-4">User Roles & Permissions</h3>
                                <p className="text-slate-400 font-medium leading-relaxed mb-6">
                                    Maintain granular control over who can access sensitive data. We provide three main levels of access:
                                </p>
                                <div className="space-y-4">
                                    {[
                                        { role: "Owner", desc: "Full administrative access and organization management." },
                                        { role: "Admin", desc: "Can manage users, donors, and requests. No destructive settings access." },
                                        { role: "Manager", desc: "Day-to-day management of donors and requests. No user management." }
                                    ].map((r, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
                                            <div className="p-2 rounded-lg bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest">{r.role}</div>
                                            <p className="text-slate-500 text-xs font-medium pt-1">{r.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div id="audit-logs" className="scroll-mt-24">
                                <h3 className="text-xl font-bold text-white mb-4">Audit Log Monitoring</h3>
                                <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                                    <div className="flex items-center gap-3 mb-4">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                        <span className="text-white font-bold">Security Tip</span>
                                    </div>
                                    <p className="text-slate-400 text-sm leading-relaxed mb-0 font-medium">
                                        Review audit logs daily to identify any unusual activity. Every sensitive action—from viewing a donor's number to changing verification status—is logged with timestamps and user identification.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer for Docs */}
                    <div className="mt-32 pt-12 border-t border-slate-800 text-center">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <Droplet className="w-6 h-6" style={{ color: primaryColor }} />
                            <span className="text-white font-black tracking-widest uppercase text-xs">Knowledge is power</span>
                        </div>
                        <p className="text-slate-500 text-xs font-medium max-w-sm mx-auto mb-8">
                            This documentation is updated periodically to ensure organization users have the best tools to manage life-saving resources.
                        </p>
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">
                            © {new Date().getFullYear()} {organization.name}
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
