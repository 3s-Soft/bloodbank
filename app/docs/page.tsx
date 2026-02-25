import {
    Globe,
    Shield,
    Zap,
    Droplet,
    HandHeart,
    Building2,
    BookOpen,
    Activity,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import DocSearch from "@/components/DocSearch";

const mainGuides = [
    {
        title: "Platform Vision",
        description: "Our mission to unify and digitize blood donation across Bangladesh.",
        icon: Globe,
        href: "#vision"
    },
    {
        title: "For Donors",
        description: "How to register, maintain your profile, and find organizations.",
        icon: HandHeart,
        href: "#donors"
    },
    {
        title: "For Organizations",
        description: "Setting up your blood bank and managing requests efficiently.",
        icon: Building2,
        href: "#organizations"
    },
    {
        title: "Trust & Safety",
        description: "Our verification protocols and data protection standards.",
        icon: Shield,
        href: "#safety"
    }
];

export default async function GlobalDocs({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const { q = "" } = await searchParams;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col text-slate-50 selection:bg-red-500/30">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 h-20">
                <div className="container mx-auto px-4 h-full flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center space-x-2.5 group hover:opacity-80 transition-opacity">
                            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                                <Droplet className="w-5 h-5 text-white fill-current" />
                            </div>
                            <span className="text-xl font-black text-white tracking-tight">
                                Blood<span className="text-red-500">Bank</span>
                            </span>
                        </Link>
                        <div className="h-6 w-px bg-slate-800 hidden sm:block" />
                        <div className="hidden sm:flex items-center gap-2 text-slate-400 font-bold text-sm tracking-tight">
                            <BookOpen className="w-4 h-4" />
                            Global Documentation
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <DocSearch defaultValue={q} />
                    </div>
                </div>
            </header>

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-white/5">
                    <div className="container mx-auto px-4 max-w-5xl text-center">
                        <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight">
                            Everything You Need <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">To Save Lives</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                            Welcome to the central knowledge hub of Bangladesh BloodBank. Whether you're a donor looking to give or a hospital managing requests, we've got you covered.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {mainGuides.map((guide, i) => (
                                <Link
                                    key={i}
                                    href={guide.href}
                                    className="p-6 rounded-3xl bg-slate-900/50 border border-white/5 hover:border-red-500/30 hover:bg-slate-900 transition-all group text-left"
                                >
                                    <div className="p-3 w-fit rounded-xl bg-slate-800 mb-6 group-hover:scale-110 transition-transform">
                                        <guide.icon className="w-6 h-6 text-red-500" />
                                    </div>
                                    <h3 className="font-black text-white mb-2 tracking-tight">{guide.title}</h3>
                                    <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                                        {guide.description}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Content Sections */}
                <div className="container mx-auto px-4 py-24 max-w-4xl">
                    {(!q || "platform vision".includes(q.toLowerCase())) && (
                        <section id="vision" className="mb-32 scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest">Platform Vision & Scale</span>
                                <div className="h-px flex-grow bg-slate-800" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">One Platform, Endless Impact</h2>
                            <div className="prose prose-invert max-w-none text-slate-400 font-medium leading-relaxed space-y-6">
                                <p>
                                    Bangladesh BloodBank is a digital infrastructure designed to bridge the gap between those who can help and those who need it most. Our platform addresses the critical shortage of organized blood donation data in rural areas of Bangladesh, turning fragmented local networks into a unified "Digital Life-Line."
                                </p>
                                <p>
                                    By digitizing donor availability at the sub-district (Upazila) and village levels, we enable communities to respond to medical emergencies with unprecedented speed and accuracy. Our goal is to ensure that no life is lost due to a lack of information or logistical delays.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 text-center group hover:bg-slate-900 transition-colors">
                                        <div className="text-2xl font-black text-white mb-1 group-hover:text-red-500">64</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Districts Covered</div>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 text-center group hover:bg-slate-900 transition-colors">
                                        <div className="text-2xl font-black text-white mb-1 group-hover:text-red-500">490+</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Upazilas</div>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 text-center group hover:bg-slate-900 transition-colors">
                                        <div className="text-2xl font-black text-white mb-1 group-hover:text-red-500">&lt;5m</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Matching Speed</div>
                                    </div>
                                    <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 text-center group hover:bg-slate-900 transition-colors">
                                        <div className="text-2xl font-black text-white mb-1 group-hover:text-red-500">0৳</div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Always Free</div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {(!q || "donors protocol emergency response".includes(q.toLowerCase())) && (
                        <section id="donors" className="mb-32 scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest">The Life-Saving Protocol</span>
                                <div className="h-px flex-grow bg-slate-800" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">Protocol for Emergency Response</h2>
                            <div className="space-y-8">
                                <div className="p-8 rounded-3xl bg-slate-900 border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Droplet className="w-32 h-32 text-red-500 fill-current" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-4">Phase 1: Verification & Matching</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                        When an emergency request is filed, our system immediately scans the local geographical hub for O-negative and specific compatible groups. We prioritize donors with high "reliability scores"—those who have fulfilled past requests promptly.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                        <div className="p-4 rounded-xl bg-slate-950 border border-white/5">
                                            <div className="text-xs font-bold text-slate-200 mb-1 tracking-tight">Donor Eligibility</div>
                                            <p className="text-[10px] text-slate-500 leading-normal">
                                                Weight &gt; 50kg, Age 18-60, Hemoglobin &gt; 12.5g/dL. Must be free from chronic illness and post-recovery from any viral infections.
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-slate-950 border border-white/5">
                                            <div className="text-xs font-bold text-slate-200 mb-1 tracking-tight">Screening Check</div>
                                            <p className="text-[10px] text-slate-500 leading-normal">
                                                All donors must undergo standard NGO-grade screening for Hepatitis, HIV, and Malaria before donation at the facility.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            LOCAL PRIORITY
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            AUTO-SCREENING
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 rounded-3xl bg-slate-900 border border-white/5 relative overflow-hidden group">
                                    <h4 className="text-xl font-bold text-white mb-4">Phase 2: Response & Rewards</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                        Our targeted Response SLA (Service Level Agreement) is 5 minutes from request validation. Donors who fulfill requests earn 50 points and a "Life-Saver" badge.
                                    </p>
                                    <ul className="space-y-3">
                                        <li className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-red-500" />
                                            Instant SMS/Push Notifications to compatible donors.
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-red-500" />
                                            Automatic Dispatch of Regional Logistics Volunteers if needed.
                                        </li>
                                        <li className="flex items-center gap-3 text-slate-400 text-sm font-medium">
                                            <CheckCircle2 className="w-4 h-4 text-red-500" />
                                            Real-time Tracking of donor arrival at the hospital.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </section>
                    )}

                    {(!q || "organizations admin verification supply management".includes(q.toLowerCase())) && (
                        <section id="organizations" className="mb-32 scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">Regional Command & Control</span>
                                <div className="h-px flex-grow bg-slate-800" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">For Blood Banks & NGOs</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:bg-slate-900 transition-all">
                                    <Activity className="w-8 h-8 text-emerald-500 mb-6" />
                                    <h3 className="text-xl font-bold text-white mb-3">Verification Process</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        To maintain platform integrity, all organizations must be verified by our Global Admins. You must submit your NGO registration or Hospital License number. Once verified, you gain the ability to post push-notification emergency requests.
                                    </p>
                                </div>
                                <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/5 hover:bg-slate-900 transition-all">
                                    <Zap className="w-8 h-8 text-amber-500 mb-6" />
                                    <h3 className="text-xl font-bold text-white mb-3">Supply Management</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Use our specialized dashboard to track local blood supply needs. The platform allows you to manage donation events, send reminders to past donors, and coordinate with regional logistics volunteers for blood transport.
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {(!q || "trust safety privacy security data governance".includes(q.toLowerCase())) && (
                        <section id="safety" className="mb-32 scroll-mt-32">
                            <div className="flex items-center gap-4 mb-8">
                                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-500 text-[10px] font-black uppercase tracking-widest">Digital Sovereignty & Safety</span>
                                <div className="h-px flex-grow bg-slate-800" />
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight">Trust Infrastructure</h2>
                            <div className="prose prose-invert max-w-none text-slate-400 font-medium leading-relaxed space-y-8">
                                <div className="flex flex-col gap-6">
                                    <div className="flex gap-6 items-start">
                                        <div className="p-3 rounded-xl bg-slate-900 shrink-0">
                                            <Shield className="w-6 h-6 text-cyan-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-2 tracking-tight">Data Governance & Privacy</h4>
                                            <p className="text-sm">
                                                We employ a strict "Role-Based Access Control" (RBAC) model. Personal phone numbers are only accessible to verified organizations when an active request is being fulfilled. Your donation history is encrypted and never shared with third-party advertisers.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-6 items-start">
                                        <div className="p-3 rounded-xl bg-slate-900 shrink-0">
                                            <Droplet className="w-6 h-6 text-red-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-white mb-2 tracking-tight">No-Profit Mandate</h4>
                                            <p className="text-sm">
                                                Bangladesh BloodBank is, and will always be, the people's property. We strictly prohibit the solicitation of money for blood donation services. Any user or organization found requesting "service fees" will be permanently blacklisted and reported to local authorities.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                                    <h5 className="text-amber-500 font-bold mb-2 flex items-center gap-2">
                                        <Activity className="w-4 h-4" />
                                        Fraud Prevention
                                    </h5>
                                    <p className="text-xs text-amber-500/80 italic leading-relaxed">
                                        "Our system monitors matching behavior for anomalies. Attempting to bypass the matching protocol or commercialize donation data is a violation of our core values and legal terms. We believe in the sanctity of selfless giving."
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* CTA */}
                <section className="bg-red-500 py-20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[120px] -mr-48 -mt-48" />
                    <div className="absolute bottom-0 left-0 w-72 h-72 bg-black/20 rounded-full blur-[100px] -ml-36 -mb-36" />

                    <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight italic">
                            "Humanity first, technology always."
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/login"
                                className="h-14 px-10 rounded-2xl bg-white text-red-600 text-base font-black hover:bg-slate-100 transition-all flex items-center justify-center shadow-xl shadow-black/10"
                            >
                                Get Started Now
                            </Link>
                            <Link
                                href="/organizations/new"
                                className="h-14 px-10 rounded-2xl border-2 border-white/30 text-white text-base font-black hover:bg-white/10 transition-all flex items-center justify-center"
                            >
                                Setup an Organization
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Platform Footer */}
            <footer className="py-12 border-t border-white/5 bg-slate-950">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <Droplet className="w-5 h-5 text-slate-600" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em]">Bangladesh Bloodbank Infrastructure</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Link href="/" className="hover:text-white transition-colors">Home Page</Link>
                        <Link href="/admin" className="hover:text-white transition-colors">System Admin</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
