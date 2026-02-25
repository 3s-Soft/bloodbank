"use client";

import { BADGES, getBadgeDetails } from "@/lib/gamification";

interface DonorBadgeProps {
    badges: string[];
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
}

export function DonorBadge({ badges, size = "md", showLabel = true }: DonorBadgeProps) {
    const badgeDetails = getBadgeDetails(badges);

    if (badgeDetails.length === 0) return null;

    const sizeClasses = {
        sm: "text-xs px-1.5 py-0.5 gap-0.5",
        md: "text-sm px-2 py-1 gap-1",
        lg: "text-base px-3 py-1.5 gap-1.5",
    };

    return (
        <div className="flex flex-wrap gap-1.5">
            {badgeDetails.map((badge) => (
                <span
                    key={badge.id}
                    className={`inline-flex items-center rounded-full font-bold transition-all hover:scale-105 ${sizeClasses[size]} ${getBadgeColor(badge.id)}`}
                    title={badge.description}
                >
                    <span>{badge.icon}</span>
                    {showLabel && <span>{badge.label}</span>}
                </span>
            ))}
        </div>
    );
}

function getBadgeColor(badgeId: string): string {
    switch (badgeId) {
        case "verified":
            return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
        case "first_blood":
            return "bg-red-500/20 text-red-400 border border-red-500/30";
        case "regular_donor":
            return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
        case "hero":
            return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
        case "lifesaver":
            return "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30";
        case "legend":
            return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30";
        default:
            return "bg-slate-500/20 text-slate-400 border border-slate-500/30";
    }
}

interface DonorPointsProps {
    points: number;
    totalDonations: number;
}

export function DonorPoints({ points, totalDonations }: DonorPointsProps) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
                <span className="text-lg">🏆</span>
                <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Points</p>
                    <p className="text-lg font-black text-amber-400">{points.toLocaleString()}</p>
                </div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="flex items-center gap-1.5">
                <span className="text-lg">🩸</span>
                <div>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-500">Donations</p>
                    <p className="text-lg font-black text-red-400">{totalDonations}</p>
                </div>
            </div>
        </div>
    );
}

interface EligibilityBadgeProps {
    eligible: boolean;
    daysRemaining: number;
    message: string;
}

export function EligibilityBadge({ eligible, daysRemaining, message }: EligibilityBadgeProps) {
    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold ${eligible
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                }`}
        >
            <span>{eligible ? "✅" : "⏳"}</span>
            <span>{eligible ? "Eligible to Donate" : `${daysRemaining} days until eligible`}</span>
        </div>
    );
}
