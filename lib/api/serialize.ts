import type {
    AuditLogDto,
    AuditLogRow,
    BloodRequestDto,
    BloodRequestRow,
    DonationDto,
    DonationRow,
    DonorProfileDto,
    DonorProfileRow,
    DonorSummaryDto,
    EventDto,
    EventRow,
    FeedbackDto,
    FeedbackRow,
    OrganizationDto,
    OrganizationRow,
    UserDto,
    UserRow,
    UserSummaryDto,
} from "@/lib/types";

/**
 * Row-to-DTO mapping.
 *
 * Rows carry `Date` objects; the API contract is ISO 8601 strings. Doing the
 * conversion here rather than relying on `JSON.stringify` keeps the DTO types
 * honest and gives one place to strip fields that must never be serialised,
 * such as the password hash.
 */

function iso(value: Date | null | undefined): string | null {
    return value ? value.toISOString() : null;
}

function isoRequired(value: Date): string {
    return value.toISOString();
}

export function toOrganizationDto(row: OrganizationRow): OrganizationDto {
    return {
        ...row,
        createdAt: isoRequired(row.createdAt),
        updatedAt: isoRequired(row.updatedAt),
    };
}

export function toUserDto(row: UserRow): UserDto {
    // The password hash is dropped rather than nulled so it cannot leak through
    // an object spread further down the line.
    const { password: _password, ...rest } = row;
    void _password;
    return {
        ...rest,
        createdAt: isoRequired(row.createdAt),
        updatedAt: isoRequired(row.updatedAt),
    };
}

export function toUserSummaryDto(
    row: Pick<UserRow, "id" | "name" | "phone" | "email"> | null | undefined,
): UserSummaryDto | null {
    if (!row) return null;
    return { id: row.id, name: row.name, phone: row.phone, email: row.email };
}

export function toDonorProfileDto(
    row: DonorProfileRow,
    user?: Pick<UserRow, "id" | "name" | "phone" | "email"> | null,
): DonorProfileDto {
    return {
        ...row,
        lastDonationDate: iso(row.lastDonationDate),
        createdAt: isoRequired(row.createdAt),
        updatedAt: isoRequired(row.updatedAt),
        user: toUserSummaryDto(user),
    };
}

export function toDonorSummaryDto(
    row: DonorProfileRow,
    user?: Pick<UserRow, "id" | "name" | "phone" | "email"> | null,
): DonorSummaryDto {
    return {
        id: row.id,
        bloodGroup: row.bloodGroup,
        district: row.district,
        upazila: row.upazila,
        village: row.village,
        isVerified: row.isVerified,
        totalDonations: row.totalDonations,
        user: toUserSummaryDto(user),
    };
}

export function toBloodRequestDto(
    row: BloodRequestRow,
    requester?: Pick<UserRow, "id" | "name" | "phone" | "email"> | null,
    matchedDonors?: DonorSummaryDto[],
): BloodRequestDto {
    return {
        ...row,
        requiredDate: iso(row.requiredDate),
        escalatedAt: iso(row.escalatedAt),
        feedbackSubmittedAt: iso(row.feedbackSubmittedAt),
        createdAt: isoRequired(row.createdAt),
        updatedAt: isoRequired(row.updatedAt),
        requester: toUserSummaryDto(requester),
        ...(matchedDonors ? { matchedDonors } : {}),
    };
}

export function toDonationDto(row: DonationRow, donor?: DonorSummaryDto | null): DonationDto {
    return {
        ...row,
        donationDate: isoRequired(row.donationDate),
        createdAt: isoRequired(row.createdAt),
        ...(donor === undefined ? {} : { donor }),
    };
}

export function toEventDto(row: EventRow): EventDto {
    return {
        ...row,
        date: isoRequired(row.date),
        endDate: iso(row.endDate),
        createdAt: isoRequired(row.createdAt),
        updatedAt: isoRequired(row.updatedAt),
    };
}

export function toAuditLogDto(
    row: AuditLogRow,
    performedBy?: Pick<UserRow, "id" | "name" | "phone" | "email"> | null,
): AuditLogDto {
    return {
        ...row,
        createdAt: isoRequired(row.createdAt),
        performedBy: toUserSummaryDto(performedBy),
    };
}

export function toFeedbackDto(row: FeedbackRow): FeedbackDto {
    return {
        ...row,
        createdAt: isoRequired(row.createdAt),
        updatedAt: isoRequired(row.updatedAt),
    };
}
