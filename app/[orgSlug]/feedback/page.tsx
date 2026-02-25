"use client";

import { useState, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOrganization } from "@/lib/context/OrganizationContext";
import { MessageSquare, Send, Bug, Lightbulb, Star, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const categories = [
    { value: "general", label: "General Feedback", icon: MessageSquare, color: "text-blue-400" },
    { value: "bug", label: "Bug Report", icon: Bug, color: "text-red-400" },
    { value: "feature", label: "Feature Request", icon: Lightbulb, color: "text-amber-400" },
    { value: "praise", label: "Appreciation", icon: Star, color: "text-emerald-400" },
    { value: "complaint", label: "Complaint", icon: MessageSquare, color: "text-orange-400" },
];

export default function FeedbackPage({
    params,
}: {
    params: Promise<{ orgSlug: string }>;
}) {
    const { orgSlug } = use(params);
    const org = useOrganization();
    const primaryColor = org?.primaryColor || "#D32F2F";

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [category, setCategory] = useState("general");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !message.trim()) {
            toast.error("Name and message are required");
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim() || undefined,
                    category,
                    message: message.trim(),
                    orgSlug,
                }),
            });

            if (res.ok) {
                setSubmitted(true);
                toast.success("Thank you for your feedback!");
            } else {
                toast.error("Failed to submit feedback. Please try again.");
            }
        } catch {
            toast.error("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
                <Card className="bg-slate-900 border-slate-800 max-w-md w-full">
                    <CardContent className="py-12 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                            <CheckCircle className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white">Thank You!</h2>
                        <p className="text-slate-400">
                            Your feedback has been submitted successfully. We appreciate your input!
                        </p>
                        <Button
                            onClick={() => {
                                setSubmitted(false);
                                setName("");
                                setEmail("");
                                setCategory("general");
                                setMessage("");
                            }}
                            className="mt-4"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Submit Another
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-6 lg:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 mx-auto">
                        <MessageSquare className="w-8 h-8 text-purple-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white">Feedback & Suggestions</h1>
                    <p className="text-slate-400">
                        Help us improve by sharing your thoughts, reporting bugs, or requesting features.
                    </p>
                </div>

                {/* Form */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Category Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    Category
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {categories.map((cat) => {
                                        const Icon = cat.icon;
                                        return (
                                            <button
                                                key={cat.value}
                                                type="button"
                                                onClick={() => setCategory(cat.value)}
                                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all border ${category === cat.value
                                                        ? "border-red-500 bg-red-500/10 text-white"
                                                        : "border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-800"
                                                    }`}
                                            >
                                                <Icon className={`w-4 h-4 ${cat.color}`} />
                                                {cat.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    Your Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    Email <span className="text-slate-500">(optional)</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    Your Feedback <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Tell us what you think, report a bug, or suggest a feature..."
                                    rows={5}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors resize-none"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 text-white font-bold"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {submitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Submit Feedback
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
