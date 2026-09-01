import bcrypt from "bcryptjs";

import { HttpError } from "@/lib/api/responses";
import { db } from "@/lib/db";
import { AuditAction, DEFAULT_NOTIFICATION_PREFERENCES, UserRole } from "@/lib/db/enums";
import { calculateBadges, calculatePoints } from "@/lib/gamification";
import * as donorProfilesRepo from "@/lib/repositories/donorProfiles";
import { auditLogsRepo } from "@/lib/repositories/misc";
import * as usersRepo from "@/lib/repositories/users";
import { hasRecentVerification, isOtpRequired } from "./otpService";
import type { DonorRegistrationInput } from "@/lib/validation/schemas";

/**
 * Donor registration.
 *
 * A person may already exist as a user (they requested blood before, or signed
 * in with Google) and may already be a donor for this organization. The whole
 * thing runs in one transaction so a half-registered donor — a user row with no
 * profile — cannot be left behind.
 */
export async function registerDonor(
    input: DonorRegistrationInput,
    organizationId: number,
): Promise<{ userId: number; created: boolean }> {
    const phone = input.phone?.trim() || null;
    const email = input.email?.trim().toLowerCase() || null;

    // Verification is checked here rather than trusted from the request: a
    // client-supplied "verified" flag would make the OTP flow decorative.
    // Only enforced when an SMS gateway is actually configured and enabled,
    // so deployments without one keep registering donors as before.
    if (phone && isOtpRequired() && !(await hasRecentVerification(phone))) {
        throw new HttpError(403, "Verify your phone number before registering.");
    }

    return db.transaction(async (tx) => {
        const existing = await usersRepo.findByPhoneOrEmail(phone, email, tx);

        let userId: number;
        let created = false;

        if (existing) {
            userId = existing.id;

            // Fill in identifiers and a password the account was missing, but
            // never overwrite ones already set: that would let anyone who knows
            // a phone number rewrite the account behind it.
            const updates: Parameters<typeof usersRepo.update>[1] = {};
            if (email && !existing.email) updates.email = email;
            if (phone && !existing.phone) updates.phone = phone;
            if (input.password && !existing.password) {
                updates.password = await bcrypt.hash(input.password, 10);
            }
            if (!existing.organizationId) updates.organizationId = organizationId;
            if (existing.role === UserRole.PATIENT) updates.role = UserRole.DONOR;

            if (Object.keys(updates).length > 0) {
                await usersRepo.update(userId, updates, tx);
            }
        } else {
            created = true;
            userId = await usersRepo.create(
                {
                    name: input.name,
                    phone,
                    email,
                    password: input.password ? await bcrypt.hash(input.password, 10) : null,
                    role: UserRole.DONOR,
                    organizationId,
                    onboardingCompleted: false,
                    notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
                },
                tx,
            );
        }

        // Upsert against unique(user_id, organization_id): registering twice
        // updates the existing profile instead of duplicating the donor.
        await donorProfilesRepo.upsert(
            {
                userId,
                organizationId,
                bloodGroup: input.bloodGroup,
                district: input.district,
                upazila: input.upazila,
                village: input.village || null,
                lastDonationDate: input.lastDonationDate ?? null,
                totalDonations: 0,
                points: calculatePoints(0, false, true, true),
                badges: calculateBadges(0, false),
                isAvailable: true,
                isVerified: false,
            },
            tx,
        );

        return { userId, created };
    });
}

/** Admin verification toggle, with its audit entry. */
export async function setDonorVerification(
    donorProfileId: number,
    isVerified: boolean,
    organizationId: number,
    performedById: number,
): Promise<void> {
    const donor = await donorProfilesRepo.findById(donorProfileId);
    if (!donor) {
        throw new HttpError(404, "Donor not found");
    }
    // The tenant check: an admin of one organization must not be able to verify
    // another organization's donor by guessing an id.
    if (donor.profile.organizationId !== organizationId) {
        throw new HttpError(403, "That donor belongs to another organization");
    }

    await db.transaction(async (tx) => {
        await donorProfilesRepo.update(
            donorProfileId,
            {
                isVerified,
                points: calculatePoints(
                    donor.profile.totalDonations,
                    isVerified,
                    donor.profile.isAvailable,
                    Boolean(donor.profile.district && donor.profile.upazila),
                ),
                badges: calculateBadges(donor.profile.totalDonations, isVerified),
            },
            tx,
        );

        await auditLogsRepo.record(
            {
                action: isVerified ? AuditAction.DONOR_VERIFIED : AuditAction.DONOR_UNVERIFIED,
                performedById,
                organizationId,
                targetType: "DonorProfile",
                targetId: donorProfileId,
                details: `${isVerified ? "Verified" : "Unverified"} donor ${donor.user.name}`,
            },
            tx,
        );
    });
}

export interface ImportDonorInput {
    name: string;
    phone: string;
    bloodGroup: DonorRegistrationInput["bloodGroup"];
    district?: string;
    upazila?: string;
    village?: string;
}

/**
 * Bulk import. Rows that fail are reported rather than aborting the batch, so
 * one bad phone number in a spreadsheet does not discard the other 499 rows.
 */
export async function importDonors(
    rows: ImportDonorInput[],
    organizationId: number,
    performedById: number,
): Promise<{ imported: number; skipped: { row: number; reason: string }[] }> {
    const skipped: { row: number; reason: string }[] = [];
    let imported = 0;

    for (const [index, row] of rows.entries()) {
        try {
            await db.transaction(async (tx) => {
                const existing = await usersRepo.findByPhone(row.phone, tx);
                const userId = existing
                    ? existing.id
                    : await usersRepo.create(
                          {
                              name: row.name,
                              phone: row.phone,
                              role: UserRole.DONOR,
                              organizationId,
                              notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
                          },
                          tx,
                      );

                await donorProfilesRepo.upsert(
                    {
                        userId,
                        organizationId,
                        bloodGroup: row.bloodGroup,
                        district: row.district ?? null,
                        upazila: row.upazila ?? null,
                        village: row.village ?? null,
                        isAvailable: true,
                        isVerified: false,
                    },
                    tx,
                );
            });
            imported += 1;
        } catch (error) {
            skipped.push({
                row: index + 1,
                reason: error instanceof Error ? error.message : "Unknown error",
            });
        }
    }

    if (imported > 0) {
        await auditLogsRepo.record({
            action: AuditAction.DONOR_IMPORTED,
            performedById,
            organizationId,
            targetType: "DonorProfile",
            details: `Imported ${imported} donor(s)`,
        });
    }

    return { imported, skipped };
}
