"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Scale, CheckCircle2, AlertTriangle, UserPlus, ArrowLeft, Droplet } from "lucide-react";
import Link from "next/link";

const termSections = [
    {
        title: "User Responsibilities",
        icon: UserPlus,
        content: "Users must provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your profile."
    },
    {
        title: "Eligibility for Donation",
        icon: CheckCircle2,
        content: "Donors must meet all health and age requirements set by local health authorities. While we provide a platform for connection, the final eligibility is determined by the attending medical professional."
    },
    {
        title: "No Liability",
        icon: AlertTriangle,
        content: "This platform is a connector between donors and seekers. We do not guarantee the quality, safety, or availability of blood and are not liable for medical outcomes or donor/seeker interactions."
    },
    {
        title: "Prohibited Acts",
        icon: Scale,
        content: "Any misinformation, harassment, or commercial use of this platform is strictly prohibited. We reserve the right to suspend or terminate accounts that violate these terms."
    }
];

export default function TermsOfService() {
    const organization = useOrganization();
    const primaryColor = organization.primaryColor || "#dc2626";

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl flex-grow">
                {/* Back Link */}
                <Link
                    href={`/${organization.slug}`}
                    className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-white transition-colors mb-10 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                {/* Header */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-2xl" style={{ backgroundColor: `${primaryColor}15` }}>
                            <Scale className="w-8 h-8" style={{ color: primaryColor }} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                            Terms & Conditions
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Terms of Service
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                        By using {organization.name}, you agree to our terms. This agreement ensures a safe and effective environment for everyone in our life-saving community.
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {termSections.map((section, idx) => {
                        const Icon = section.icon;
                        return (
                            <div key={idx} className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all group">
                                <div className="p-3 w-fit rounded-xl bg-slate-800 mb-6 group-hover:scale-110 transition-transform">
                                    <Icon className="w-6 h-6 text-slate-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">{section.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                                    {section.content}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Detailed Sections */}
                <div className="rounded-3xl bg-slate-900/30 border border-slate-800/50 p-8 md:p-12">
                    <div className="prose prose-invert max-w-none">
                        <h2 className="text-2xl font-black text-white mb-8">Detailed Agreements</h2>
                        <div className="space-y-8 text-slate-400 font-medium leading-relaxed">
                            <p>
                                Welcome to {organization.name}. Our mission is to streamline blood donation across Bangladesh. By accessing or using our platform, you agree to be bound by these legal terms.
                            </p>

                            <h4 className="text-white font-bold text-lg mt-10">1. Acceptance of Terms</h4>
                            <p>
                                Your access to and use of the platform is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
                            </p>

                            <h4 className="text-white font-bold text-lg mt-10">2. Medical Disclaimer</h4>
                            <p>
                                {organization.name} is not a healthcare provider. We do not provide medical advice, diagnosis, or treatment. The donation of blood and its medical implications are the sole responsibility of the medical professionals and facilities conducting the process.
                            </p>

                            <h4 className="text-white font-bold text-lg mt-10">3. Information Accuracy</h4>
                            <p>
                                You agree that all information you provide, including blood group and medical history, is true and accurate. Falsifying medical data is a serious violation and may lead to permanent exclusion from the platform.
                            </p>

                            <h4 className="text-white font-bold text-lg mt-10">4. Community Guidelines</h4>
                            <p>
                                We maintain a zero-tolerance policy towards any form of harassment, discrimination, or exploitation. This platform is strictly for humanitarian purposes. Commercial use or trading of blood is strictly prohibited.
                            </p>
                        </div>
                    </div>

                    <div className="mt-16 pt-10 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <Droplet className="w-5 h-5" style={{ color: primaryColor }} />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">A commitment to humanity</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
