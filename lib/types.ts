import type { InferSelectModel } from "drizzle-orm";

import type {
    auditLogs,
    bloodRequests,
    donations,
    donorProfiles,
    events,
    feedback,
    organizations,
    pushSubscriptions,
    users,
} from "./db/schema";

export {
    AuditAction,
    BLOOD_GROUP_VALUES,
    DEFAULT_NOTIFICATION_PREFERENCES,
    EventStatus,
    FeedbackCategory,
    FeedbackStatus,
    RequestStatus,
    UrgencyLevel,
    UserRole,
} from "./db/enums";
export type { BloodGroup, NotificationPreferences } from "./db/enums";

/* -------------------------------------------------------------------------- */
/* Row types (what the database returns)                                      */
/* -------------------------------------------------------------------------- */

export type OrganizationRow = InferSelectModel<typeof organizations>;
export type UserRow = InferSelectModel<typeof users>;
export type DonorProfileRow = InferSelectModel<typeof donorProfiles>;
export type BloodRequestRow = InferSelectModel<typeof bloodRequests>;
export type DonationRow = InferSelectModel<typeof donations>;
export type EventRow = InferSelectModel<typeof events>;
export type AuditLogRow = InferSelectModel<typeof auditLogs>;
export type FeedbackRow = InferSelectModel<typeof feedback>;
export type PushSubscriptionRow = InferSelectModel<typeof pushSubscriptions>;

/* -------------------------------------------------------------------------- */
/* DTOs (what the API returns)                                                */
/* -------------------------------------------------------------------------- */

/**
 * Dates cross the API as ISO 8601 strings. Rows carry `Date` objects, so every
 * DTO restates its date fields as strings rather than inheriting them.
 */
type IsoDates<T, K extends keyof T> = Omit<T, K> & {
    [P in K]: T[P] extends Date ? string : T[P] extends Date | null ? string | null : T[P];
};

export type OrganizationDto = IsoDates<OrganizationRow, "createdAt" | "updatedAt">;

/** Public-facing user shape. The password hash is never serialised. */
export type UserDto = IsoDates<Omit<UserRow, "password">, "createdAt" | "updatedAt">;

/** The subset of a user embedded in donor and request payloads. */
export interface UserSummaryDto {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
}

export type DonorProfileDto = IsoDates<
    DonorProfileRow,
    "createdAt" | "updatedAt" | "lastDonationDate"
> & {
    user: UserSummaryDto | null;
};

/** The subset of a donor embedded in match results. */
export interface DonorSummaryDto {
    id: number;
    bloodGroup: DonorProfileRow["bloodGroup"];
    district: string | null;
    upazila: string | null;
    village: string | null;
    isVerified: boolean;
    totalDonations: number;
    user: UserSummaryDto | null;
}

export type BloodRequestDto = IsoDates<
    BloodRequestRow,
    "createdAt" | "updatedAt" | "requiredDate" | "escalatedAt" | "feedbackSubmittedAt"
> & {
    requester: UserSummaryDto | null;
    matchedDonors?: DonorSummaryDto[];
};

export type DonationDto = IsoDates<DonationRow, "createdAt" | "donationDate"> & {
    donor?: DonorSummaryDto | null;
};

export type EventDto = IsoDates<EventRow, "createdAt" | "updatedAt" | "date" | "endDate">;

export type AuditLogDto = IsoDates<AuditLogRow, "createdAt"> & {
    performedBy: UserSummaryDto | null;
};

export type FeedbackDto = IsoDates<FeedbackRow, "createdAt" | "updatedAt">;

export type PushSubscriptionDto = IsoDates<PushSubscriptionRow, "createdAt" | "updatedAt">;

/* -------------------------------------------------------------------------- */
/* Aggregate payloads                                                         */
/* -------------------------------------------------------------------------- */

export interface OrganizationStatsDto {
    donorsCount: number;
    activeRequests: number;
    completedRequests: number;
    livesHelped: number;
    villagesCovered: number;
}

export interface PlatformStatsDto {
    organizationsCount: number;
    donorsCount: number;
    requestsCount: number;
    fulfilledRequests: number;
}

/* -------------------------------------------------------------------------- */
/* API envelope                                                               */
/* -------------------------------------------------------------------------- */

export interface ApiSuccess<T> {
    data: T;
}

export interface ApiError {
    error: string;
    details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
