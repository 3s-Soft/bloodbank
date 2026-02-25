// Gamification system: points, badges, and eligibility

export const POINTS = {
    DONATION: 100,
    PROFILE_COMPLETE: 50,
    AVAILABILITY_ON: 25,
    FIRST_DONATION: 150,
    VERIFIED: 75,
} as const;

export const BADGES = {
    FIRST_BLOOD: { id: "first_blood", label: "First Blood", description: "Completed first donation", icon: "🩸", minDonations: 1 },
    REGULAR_DONOR: { id: "regular_donor", label: "Regular Donor", description: "3+ donations", icon: "⭐", minDonations: 3 },
    HERO: { id: "hero", label: "Hero", description: "10+ donations", icon: "🦸", minDonations: 10 },
    LIFESAVER: { id: "lifesaver", label: "Lifesaver", description: "25+ donations", icon: "💎", minDonations: 25 },
    LEGEND: { id: "legend", label: "Legend", description: "50+ donations", icon: "👑", minDonations: 50 },
    VERIFIED: { id: "verified", label: "Verified Donor", description: "Identity verified by admin", icon: "✅", minDonations: 0 },
} as const;

export type BadgeId = keyof typeof BADGES;

/**
 * Calculate which badges a donor has earned based on donation count and verification status.
 */
export function calculateBadges(totalDonations: number, isVerified: boolean): string[] {
    const earned: string[] = [];

    if (isVerified) earned.push(BADGES.VERIFIED.id);
    if (totalDonations >= BADGES.FIRST_BLOOD.minDonations) earned.push(BADGES.FIRST_BLOOD.id);
    if (totalDonations >= BADGES.REGULAR_DONOR.minDonations) earned.push(BADGES.REGULAR_DONOR.id);
    if (totalDonations >= BADGES.HERO.minDonations) earned.push(BADGES.HERO.id);
    if (totalDonations >= BADGES.LIFESAVER.minDonations) earned.push(BADGES.LIFESAVER.id);
    if (totalDonations >= BADGES.LEGEND.minDonations) earned.push(BADGES.LEGEND.id);

    return earned;
}

/**
 * Calculate points for a donor based on their profile and donation count.
 */
export function calculatePoints(
    totalDonations: number,
    isVerified: boolean,
    isAvailable: boolean,
    hasCompleteProfile: boolean
): number {
    let points = 0;

    points += totalDonations * POINTS.DONATION;
    if (totalDonations >= 1) points += POINTS.FIRST_DONATION;
    if (isVerified) points += POINTS.VERIFIED;
    if (isAvailable) points += POINTS.AVAILABILITY_ON;
    if (hasCompleteProfile) points += POINTS.PROFILE_COMPLETE;

    return points;
}

/**
 * Check donor eligibility based on last donation date.
 * Minimum gap: 56 days (8 weeks) for whole blood donation.
 */
export function checkDonorEligibility(lastDonationDate?: Date | null): {
    eligible: boolean;
    nextEligibleDate: Date | null;
    daysRemaining: number;
    message: string;
} {
    const MIN_DONATION_GAP_DAYS = 56;

    if (!lastDonationDate) {
        return {
            eligible: true,
            nextEligibleDate: null,
            daysRemaining: 0,
            message: "Eligible to donate (no previous donation recorded)",
        };
    }

    const now = new Date();
    const lastDonation = new Date(lastDonationDate);
    const daysSinceLastDonation = Math.floor(
        (now.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastDonation >= MIN_DONATION_GAP_DAYS) {
        return {
            eligible: true,
            nextEligibleDate: null,
            daysRemaining: 0,
            message: `Eligible to donate (${daysSinceLastDonation} days since last donation)`,
        };
    }

    const daysRemaining = MIN_DONATION_GAP_DAYS - daysSinceLastDonation;
    const nextDate = new Date(lastDonation);
    nextDate.setDate(nextDate.getDate() + MIN_DONATION_GAP_DAYS);

    return {
        eligible: false,
        nextEligibleDate: nextDate,
        daysRemaining,
        message: `Not eligible yet. ${daysRemaining} days remaining (next eligible: ${nextDate.toLocaleDateString()})`,
    };
}

/**
 * Blood type compatibility map for donor matching.
 * Key = recipient blood type, Value = compatible donor types.
 */
export const BLOOD_COMPATIBILITY: Record<string, string[]> = {
    "O-": ["O-"],
    "O+": ["O-", "O+"],
    "A-": ["O-", "A-"],
    "A+": ["O-", "O+", "A-", "A+"],
    "B-": ["O-", "B-"],
    "B+": ["O-", "O+", "B-", "B+"],
    "AB-": ["O-", "A-", "B-", "AB-"],
    "AB+": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
};

/**
 * Get all badge details for a list of badge IDs.
 */
export function getBadgeDetails(badgeIds: string[]) {
    return Object.values(BADGES).filter((b) => badgeIds.includes(b.id));
}
