/**
 * Enum values shared by the Drizzle schema and the application types.
 *
 * This module must not import anything: `lib/db/schema.ts` reads the tuples to
 * build MySQL enum columns, and `lib/types.ts` re-exports the enums, so any
 * import here would create a cycle.
 *
 * Each enum has a `*_VALUES` tuple (what MySQL stores) and a TypeScript enum
 * (what application code references). The two must stay in sync.
 */

export const USER_ROLE_VALUES = [
    "donor",
    "patient",
    "volunteer",
    "admin",
    "super_admin",
] as const;

export enum UserRole {
    DONOR = "donor",
    PATIENT = "patient",
    VOLUNTEER = "volunteer",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin",
}

export const BLOOD_GROUP_VALUES = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
] as const;

export type BloodGroup = (typeof BLOOD_GROUP_VALUES)[number];

export const REQUEST_STATUS_VALUES = ["pending", "fulfilled", "canceled"] as const;

export enum RequestStatus {
    PENDING = "pending",
    FULFILLED = "fulfilled",
    CANCELED = "canceled",
}

export const URGENCY_LEVEL_VALUES = ["normal", "urgent", "emergency"] as const;

export enum UrgencyLevel {
    NORMAL = "normal",
    URGENT = "urgent",
    EMERGENCY = "emergency",
}

export const EVENT_STATUS_VALUES = [
    "upcoming",
    "ongoing",
    "completed",
    "cancelled",
] as const;

export enum EventStatus {
    UPCOMING = "upcoming",
    ONGOING = "ongoing",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
}

export const FEEDBACK_CATEGORY_VALUES = [
    "general",
    "bug",
    "feature",
    "support",
] as const;

export enum FeedbackCategory {
    GENERAL = "general",
    BUG = "bug",
    FEATURE = "feature",
    SUPPORT = "support",
}

export const FEEDBACK_STATUS_VALUES = [
    "new",
    "in_progress",
    "resolved",
    "dismissed",
] as const;

export enum FeedbackStatus {
    NEW = "new",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved",
    DISMISSED = "dismissed",
}

/**
 * Audit actions are snake_case because the dashboard's `actionConfig` map in
 * `app/[orgSlug]/dashboard/audit-log/page.tsx` keys off these exact strings to
 * pick a label and icon. Anything else renders as a raw action name.
 */
export const AUDIT_ACTION_VALUES = [
    "donor_verified",
    "donor_unverified",
    "donor_imported",
    "request_fulfilled",
    "request_canceled",
    "request_reopened",
    "request_escalated",
    "user_role_changed",
    "user_added",
    "user_deleted",
    "org_settings_updated",
    "event_created",
    "event_updated",
    "event_deleted",
    "donation_recorded",
] as const;

export enum AuditAction {
    DONOR_VERIFIED = "donor_verified",
    DONOR_UNVERIFIED = "donor_unverified",
    DONOR_IMPORTED = "donor_imported",
    REQUEST_FULFILLED = "request_fulfilled",
    REQUEST_CANCELED = "request_canceled",
    REQUEST_REOPENED = "request_reopened",
    REQUEST_ESCALATED = "request_escalated",
    USER_ROLE_CHANGED = "user_role_changed",
    USER_ADDED = "user_added",
    USER_DELETED = "user_deleted",
    ORG_SETTINGS_UPDATED = "org_settings_updated",
    EVENT_CREATED = "event_created",
    EVENT_UPDATED = "event_updated",
    EVENT_DELETED = "event_deleted",
    DONATION_RECORDED = "donation_recorded",
}

export interface NotificationPreferences {
    emailDonationReminders: boolean;
    emailNewRequests: boolean;
    emailEventUpdates: boolean;
    inAppAlerts: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
    emailDonationReminders: true,
    emailNewRequests: true,
    emailEventUpdates: true,
    inAppAlerts: true,
};
