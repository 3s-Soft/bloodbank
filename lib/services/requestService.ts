import { HttpError } from "@/lib/api/responses";
import { db } from "@/lib/db";
import { AuditAction, RequestStatus, UrgencyLevel } from "@/lib/db/enums";
import { BLOOD_COMPATIBILITY } from "@/lib/gamification";
import { buildBloodRequestPayload, sendPushNotifications } from "@/lib/pushNotifications";
import * as bloodRequestsRepo from "@/lib/repositories/bloodRequests";
import * as donorProfilesRepo from "@/lib/repositories/donorProfiles";
import { auditLogsRepo } from "@/lib/repositories/misc";
import type { BloodGroup, BloodRequestRow, DonorSummaryDto } from "@/lib/types";
import { toDonorSummaryDto } from "@/lib/api/serialize";
import type { BloodRequestCreateInput } from "@/lib/validation/schemas";

/**
 * Blood request lifecycle: creation, donor matching, and status changes.
 */

export async function createRequest(
    input: BloodRequestCreateInput,
    organizationId: number,
    orgSlug: string,
    requesterId: number | null,
): Promise<BloodRequestRow> {
    const requestId = await bloodRequestsRepo.create({
        patientName: input.patientName,
        bloodGroup: input.bloodGroup,
        location: input.location || null,
        district: input.district,
        upazila: input.upazila,
        urgency: input.urgency,
        requiredDate: input.requiredDate,
        contactNumber: input.contactNumber,
        additionalNotes: input.additionalNotes || null,
        status: RequestStatus.PENDING,
        requesterId,
        organizationId,
    });

    const request = await bloodRequestsRepo.findById(requestId);
    if (!request) {
        throw new HttpError(500, "Request was created but could not be read back");
    }

    // Fire-and-forget: a push failure must never fail the blood request, which
    // is the part that actually matters to the patient.
    if (input.urgency === UrgencyLevel.URGENT || input.urgency === UrgencyLevel.EMERGENCY) {
        void sendPushNotifications(
            organizationId,
            buildBloodRequestPayload(
                input.urgency as UrgencyLevel,
                input.bloodGroup,
                input.district,
                orgSlug,
                requestId,
            ),
            { district: input.district, bloodGroup: input.bloodGroup },
        );
    }

    return request;
}

export interface MatchResult {
    bloodGroup: string;
    compatibleTypes: string[];
    totalMatched: number;
    donors: DonorSummaryDto[];
}

/**
 * Finds donors who can give to the requested blood group.
 *
 * Compatibility comes from `BLOOD_COMPATIBILITY` in `lib/gamification.ts`, so
 * an O- request also surfaces the universal donors. Results are ordered by
 * locality first (same upazila, then same district), because a nearby donor is
 * far more useful than a well-matched one three districts away.
 */
export async function matchDonors(
    organizationId: number,
    bloodGroup: BloodGroup,
    location: { district?: string; upazila?: string } = {},
    requestId?: number,
): Promise<MatchResult> {
    const compatibleTypes = (BLOOD_COMPATIBILITY[bloodGroup] ?? [bloodGroup]) as BloodGroup[];
    const matches = await donorProfilesRepo.findAvailableByBloodGroups(
        organizationId,
        compatibleTypes,
    );

    const district = location.district?.toLowerCase();
    const upazila = location.upazila?.toLowerCase();

    const ranked = [...matches].sort((a, b) => {
        const score = (candidate: (typeof matches)[number]) => {
            let value = 0;
            if (upazila && candidate.profile.upazila?.toLowerCase() === upazila) value += 2;
            if (district && candidate.profile.district?.toLowerCase() === district) value += 1;
            return value;
        };

        const difference = score(b) - score(a);
        if (difference !== 0) return difference;
        return b.profile.totalDonations - a.profile.totalDonations;
    });

    const donors = ranked.map((match) => toDonorSummaryDto(match.profile, match.user));

    if (requestId) {
        const request = await bloodRequestsRepo.findById(requestId);
        if (!request || request.organizationId !== organizationId) {
            throw new HttpError(404, "Blood request not found");
        }
        await bloodRequestsRepo.replaceMatches(
            requestId,
            ranked.map((match) => match.profile.id),
        );
    }

    return {
        bloodGroup,
        compatibleTypes,
        totalMatched: donors.length,
        donors,
    };
}

const STATUS_AUDIT_ACTION: Record<string, AuditAction> = {
    [RequestStatus.FULFILLED]: AuditAction.REQUEST_FULFILLED,
    [RequestStatus.CANCELED]: AuditAction.REQUEST_CANCELED,
    [RequestStatus.PENDING]: AuditAction.REQUEST_REOPENED,
};

export async function updateStatus(
    requestId: number,
    status: BloodRequestRow["status"],
    organizationId: number,
    performedById: number,
    fulfilledById?: number,
): Promise<BloodRequestRow> {
    const request = await bloodRequestsRepo.findById(requestId);
    if (!request) {
        throw new HttpError(404, "Blood request not found");
    }
    if (request.organizationId !== organizationId) {
        throw new HttpError(403, "That request belongs to another organization");
    }

    await db.transaction(async (tx) => {
        await bloodRequestsRepo.update(
            requestId,
            {
                status,
                fulfilledById:
                    status === RequestStatus.FULFILLED ? (fulfilledById ?? null) : null,
            },
            tx,
        );

        await auditLogsRepo.record(
            {
                action: STATUS_AUDIT_ACTION[status] ?? AuditAction.REQUEST_REOPENED,
                performedById,
                organizationId,
                targetType: "BloodRequest",
                targetId: requestId,
                details: `Request for ${request.patientName} marked ${status}`,
            },
            tx,
        );
    });

    const updated = await bloodRequestsRepo.findById(requestId);
    if (!updated) {
        throw new HttpError(500, "Request was updated but could not be read back");
    }
    return updated;
}
