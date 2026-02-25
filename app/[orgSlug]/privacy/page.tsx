"use client";

import { useOrganization } from "@/lib/context/OrganizationContext";
import { Shield, Lock, Eye, FileText, ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";

const privacySections = [
    {
        title: "Information We Collect",
        icon: Eye,
        content: "To provide our services, we collect personal information including your name, blood group, phone number, email address, location, and donation history. This data is essential for connecting life-savers with those in need."
    },
    {
        title: "How We Use Your Data",
        icon: FileText,
        content: "Your information is used to facilitate blood donation requests, notify you of urgent needs in your area, and improve the platform's efficiency. We do not sell your personal data to third parties."
    },
    {
        title: "Data Security",
        icon: Lock,
        content: "We implement robust security measures to protect your information from unauthorized access. Your contact details are only shared with verified requestors or donors during an active life-saving match."
    },
    {
        title: "Your Rights",
        icon: Shield,
        content: "You have the right to access, update, or delete your personal information at any time. You can manage your availability and visibility settings through your dashboard."
    }
];

export default function PrivacyPolicy() {
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
                            <Shield className="w-8 h-8" style={{ color: primaryColor }} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                            Legal & Compliance
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
                        At {organization.name}, we believe in transparency. This policy outlines how we handle your data to ensure your safety and privacy while saving lives.
                    </p>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {privacySections.map((section, idx) => {
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

                {/* Additional Details */}
                <div className="rounded-3xl bg-slate-900/30 border border-slate-800/50 p-8 md:p-12">
                    <div className="prose prose-invert max-w-none">
                        <h2 className="text-2xl font-black text-white mb-8">Detailed Coverage</h2>
                        <div className="space-y-8 text-slate-400 font-medium leading-relaxed">
                            <p>
                                By using the {organization.name} platform, you acknowledge and agree to the practices described in this Privacy Policy. This platform acts as a bridge between blood donors and those in urgent need of life-saving medical support.
                            </p>

                            <h4 className="text-white font-bold text-lg mt-10">1. Information Sharing</h4>
                            <p>
                                We only share your contact information with a requester once they have been verified or if the urgency level demands immediate connection. We never display your full phone number to the public or unauthenticated visitors.
                            </p>

                            <h4 className="text-white font-bold text-lg mt-10">2. Cookies and Tracking</h4>
                            <p>
                                We use minimal cookies to manage your session and ensure a seamless experience. We do not use third-party tracking pixels for advertising purposes.
                            </p>

                            <h4 className="text-white font-bold text-lg mt-10">3. Updates to this Policy</h4>
                            <p>
                                We may update this policy periodically to reflect changes in our practices or for other operational, legal, or regulatory reasons. Significant changes will be announced on the platform.
                            </p>
                        </div>
                    </div>

                    <div className="mt-16 pt-10 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <Heart className="w-5 h-5" style={{ color: primaryColor }} />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Saving lives together</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
