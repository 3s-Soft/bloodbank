"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Rocket,
    Building2,
    UserPlus,
    Droplet,
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    X,
} from "lucide-react";

interface OnboardingWizardProps {
    orgSlug: string;
    orgName: string;
    onComplete: () => void;
    onSkip: () => void;
}

const steps = [
    {
        id: "welcome",
        title: "Welcome to Your Dashboard! 🎉",
        description: "Let's walk you through the key features of your blood bank management system.",
        icon: Rocket,
        content: (orgName: string) => (
            <div className="space-y-4 text-slate-300">
                <p className="text-lg">
                    Welcome to <span className="font-black text-white">{orgName}</span>!
                </p>
                <p>
                    This dashboard helps you manage donors, blood requests, events, and more.
                    Let&apos;s get you started with a quick tour.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-6">
                    {[
                        { icon: "🩸", label: "Manage Donors" },
                        { icon: "📋", label: "Blood Requests" },
                        { icon: "📅", label: "Events" },
                        { icon: "📊", label: "Analytics" },
                    ].map((item) => (
                        <div
                            key={item.label}
                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700"
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-sm font-bold">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: "org-setup",
        title: "Organization Settings",
        description: "Customize your blood bank's branding and contact details.",
        icon: Building2,
        content: () => (
            <div className="space-y-4 text-slate-300">
                <p>Head to <span className="font-bold text-white">Settings</span> in the sidebar to:</p>
                <ul className="space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-1">•</span>
                        <span>Set your organization&apos;s <span className="text-white font-bold">primary color</span> for branding</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-1">•</span>
                        <span>Update <span className="text-white font-bold">contact information</span> (email, phone, address)</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-emerald-400 mt-1">•</span>
                        <span>Upload your organization&apos;s <span className="text-white font-bold">logo</span></span>
                    </li>
                </ul>
            </div>
        ),
    },
    {
        id: "donors",
        title: "Register Your First Donor",
        description: "Start building your donor network by registering donors.",
        icon: UserPlus,
        content: (orgName: string, orgSlug: string) => (
            <div className="space-y-4 text-slate-300">
                <p>Share the registration link with potential donors:</p>
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 font-mono text-sm text-cyan-400 break-all">
                    /{orgSlug}/register
                </div>
                <p>Or manually add donors via <span className="text-white font-bold">Manage Donors</span> in the sidebar.</p>
                <p className="text-sm text-slate-500">
                    Tip: You can bulk import donors using a JSON file from the donor management page.
                </p>
            </div>
        ),
    },
    {
        id: "requests",
        title: "Handle Blood Requests",
        description: "Manage incoming blood requests and match them with donors.",
        icon: Droplet,
        content: () => (
            <div className="space-y-4 text-slate-300">
                <p>When a blood request comes in:</p>
                <ol className="space-y-3 ml-4">
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-black">1</span>
                        <span>View the request in <span className="text-white font-bold">Blood Requests</span></span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-black">2</span>
                        <span>Use <span className="text-white font-bold">Auto-Match</span> to find compatible donors</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-black">3</span>
                        <span>Contact matched donors and update the request status</span>
                    </li>
                </ol>
            </div>
        ),
    },
    {
        id: "done",
        title: "You're All Set! 🚀",
        description: "Your blood bank is ready to save lives.",
        icon: CheckCircle,
        content: () => (
            <div className="space-y-4 text-slate-300">
                <p className="text-lg">Great job! Your dashboard is ready to use.</p>
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-emerald-400 font-bold mb-2">Quick reminders:</p>
                    <ul className="space-y-1 text-sm">
                        <li>✅ Verify donor identities for trust</li>
                        <li>✅ Keep requests updated with latest status</li>
                        <li>✅ Create events for donation drives</li>
                        <li>✅ Check audit logs for accountability</li>
                    </ul>
                </div>
            </div>
        ),
    },
];

export default function OnboardingWizard({ orgSlug, orgName, onComplete, onSkip }: OnboardingWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const step = steps[currentStep];
    const Icon = step.icon;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((s) => s + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep((s) => s - 1);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg bg-slate-900 border-slate-700 shadow-2xl">
                <CardHeader className="relative">
                    <button
                        onClick={onSkip}
                        className="absolute top-4 right-4 p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <CardTitle className="text-white text-lg">{step.title}</CardTitle>
                            <p className="text-sm text-slate-500">{step.description}</p>
                        </div>
                    </div>
                    {/* Progress dots */}
                    <div className="flex gap-1.5 mt-4">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full flex-1 transition-all ${i <= currentStep ? "bg-red-500" : "bg-slate-700"
                                    }`}
                            />
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="min-h-[200px]">
                        {step.content(orgName, orgSlug)}
                    </div>
                    <div className="flex justify-between mt-6 pt-4 border-t border-slate-800">
                        <Button
                            variant="ghost"
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className="text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <Button
                            onClick={handleNext}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
