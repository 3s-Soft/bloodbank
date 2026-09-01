import { HttpError } from "@/lib/api/responses";
import { db } from "@/lib/db";
import { AuditAction } from "@/lib/db/enums";
import { POINTS, calculateBadges, calculatePoints } from "@/lib/gamification";
import * as donorProfilesRepo from "@/lib/repositories/donorProfiles";
import { auditLogsRepo, donationsRepo } from "@/lib/repositories/misc";
import type { DonationRow } from "@/lib/types";

export interface RecordDonationInput {
    donorProfileId: number;
    donationDate: Date;
    location?: string | null;
    recipientName?: string | null;
    notes?: string | null;
}

/**
 * Records a donation.
 *
 * Four things must happen together: the donation row, the donor's incremented
 * total, their recalculated points and badges, and the audit entry. Under
 * Firestore these were four separate writes with no atomicity, so a failure
 * midway left a donation that never counted toward the donor's record. Here
 * they share one transaction.
 */
export async function recordDonation(
    input: RecordDonationInput,
    organizationId: number,
    performedById: number,
): Promise<DonationRow> {
    const donor = await donorProfilesRepo.findById(input.donorProfileId);
    if (!donor) {
        throw new HttpError(404, "Donor not found");
    }
    if (donor.profile.organizationId !== organizationId) {
        throw new HttpError(403, "That donor belongs to another organization");
    }

    const totalDonations = donor.profile.totalDonations + 1;
    const hasCompleteProfile = Boolean(
        donor.profile.district && donor.profile.upazila && donor.profile.bloodGroup,
    );

    const donationId = await db.transaction(async (tx) => {
        const id = await donationsRepo.create(
            {
                donorProfileId: input.donorProfileId,
                organizationId,
                bloodGroup: donor.profile.bloodGroup,
                donationDate: input.donationDate,
                location: input.location || null,
                recipientName: input.recipientName || null,
                notes: input.notes || null,
                pointsAwarded: POINTS.DONATION,
            },
            tx,
        );

        await donorProfilesRepo.update(
            input.donorProfileId,
            {
                totalDonations,
                points: calculatePoints(
                    totalDonations,
                    donor.profile.isVerified,
                    donor.profile.isAvailable,
                    hasCompleteProfile,
                ),
                badges: calculateBadges(totalDonations, donor.profile.isVerified),
                lastDonationDate: input.donationDate,
            },
            tx,
        );

        await auditLogsRepo.record(
            {
                action: AuditAction.DONATION_RECORDED,
                performedById,
                organizationId,
                targetType: "DonorProfile",
                targetId: input.donorProfileId,
                details: `Recorded donation for ${donor.user.name}`,
            },
            tx,
        );

        return id;
    });

    // Read back by id. Selecting the donor's most recent donation would be
    // wrong for a back-dated entry, and scanning their whole history to find
    // one row is needless work on every recorded donation.
    const donation = await donationsRepo.findById(donationId);
    if (!donation) {
        throw new HttpError(500, "Donation was recorded but could not be read back");
    }

    return donation;
}
