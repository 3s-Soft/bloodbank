import { relations } from "drizzle-orm";
import {
    boolean,
    datetime,
    index,
    int,
    json,
    mysqlEnum,
    mysqlTable,
    primaryKey,
    text,
    timestamp,
    tinyint,
    uniqueIndex,
    varchar,
} from "drizzle-orm/mysql-core";

import {
    AUDIT_ACTION_VALUES,
    BLOOD_GROUP_VALUES,
    EVENT_STATUS_VALUES,
    FEEDBACK_CATEGORY_VALUES,
    FEEDBACK_STATUS_VALUES,
    REQUEST_STATUS_VALUES,
    URGENCY_LEVEL_VALUES,
    USER_ROLE_VALUES,
    type NotificationPreferences,
} from "./enums";

/**
 * Column helpers.
 *
 * `timestamp` is used for row bookkeeping (created/updated) and `datetime` for
 * domain dates. The MySQL TIMESTAMP range ends in 2038, which is fine for audit
 * columns but not for user-supplied dates such as an event scheduled far ahead.
 */
const createdAt = () => timestamp("created_at").notNull().defaultNow();
const updatedAt = () => timestamp("updated_at").notNull().defaultNow().onUpdateNow();

export const organizations = mysqlTable(
    "organizations",
    {
        id: int("id", { unsigned: true }).autoincrement().primaryKey(),
        name: varchar("name", { length: 191 }).notNull(),
        slug: varchar("slug", { length: 191 }).notNull(),
        logo: varchar("logo", { length: 512 }),
        primaryColor: varchar("primary_color", { length: 32 }).notNull().default("#D32F2F"),
        contactEmail: varchar("contact_email", { length: 191 }),
        contactPhone: varchar("contact_phone", { length: 32 }),
        address: varchar("address", { length: 512 }),
        isActive: boolean("is_active").notNull().default(true),
        isVerified: boolean("is_verified").notNull().default(false),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (table) => [
        uniqueIndex("organizations_slug_unique").on(table.slug),
        index("organizations_is_active_idx").on(table.isActive),
    ],
);

export const users = mysqlTable(
    "users",
    {
        id: int("id", { unsigned: true }).autoincrement().primaryKey(),
        name: varchar("name", { length: 191 }).notNull(),
        // Phone is the primary identifier in rural Bangladesh, but Google
        // sign-ups arrive with only an email, so both are nullable.
        phone: varchar("phone", { length: 32 }),
        email: varchar("email", { length: 191 }),
        password: varchar("password", { length: 255 }),
        image: varchar("image", { length: 512 }),
        role: mysqlEnum("role", USER_ROLE_VALUES).notNull().default("patient"),
        organizationId: int("organization_id", { unsigned: true })
            .references(() => organizations.id, { onDelete: "set null" }),
        onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
        notificationPreferences: json("notification_preferences").$type<NotificationPreferences>(),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (table) => [
        uniqueIndex("users_phone_unique").on(table.phone),
        uniqueIndex("users_email_unique").on(table.email),
        index("users_organization_id_idx").on(table.organizationId),
        index("users_role_idx").on(table.role),
    ],
);

export const donorProfiles = mysqlTable(
    "donor_profiles",
    {
        id: int("id", { unsigned: true }).autoincrement().primaryKey(),
        userId: int("user_id", { unsigned: true })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        organizationId: int("organization_id", { unsigned: true })
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        bloodGroup: mysqlEnum("blood_group", BLOOD_GROUP_VALUES).notNull(),
        district: varchar("district", { length: 128 }),
        upazila: varchar("upazila", { length: 128 }),
        village: varchar("village", { length: 128 }),
        lastDonationDate: datetime("last_donation_date"),
        totalDonations: int("total_donations", { unsigned: true }).notNull().default(0),
        points: int("points", { unsigned: true }).notNull().default(0),
        badges: json("badges").$type<string[]>(),
        isAvailable: boolean("is_available").notNull().default(true),
        isVerified: boolean("is_verified").notNull().default(false),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (table) => [
        // One profile per person per organization. This is what makes donor
        // re-registration an upsert instead of a duplicate row.
        uniqueIndex("donor_profiles_user_org_unique").on(table.userId, table.organizationId),
        // Drives /api/requests/match, the hottest query in the app.
        index("donor_profiles_match_idx").on(
            table.organizationId,
            table.bloodGroup,
            table.isAvailable,
        ),
        index("donor_profiles_org_created_idx").on(table.organizationId, table.createdAt),
        index("donor_profiles_district_idx").on(table.district),
    ],
);

export const bloodRequests = mysqlTable(
    "blood_requests",
    {
        id: int("id", { unsigned: true }).autoincrement().primaryKey(),
        patientName: varchar("patient_name", { length: 191 }).notNull(),
        bloodGroup: mysqlEnum("blood_group", BLOOD_GROUP_VALUES).notNull(),
        location: varchar("location", { length: 512 }),
        district: varchar("district", { length: 128 }),
        upazila: varchar("upazila", { length: 128 }),
        urgency: mysqlEnum("urgency", URGENCY_LEVEL_VALUES).notNull().default("normal"),
        requiredDate: datetime("required_date"),
        contactNumber: varchar("contact_number", { length: 32 }).notNull(),
        additionalNotes: text("additional_notes"),
        status: mysqlEnum("status", REQUEST_STATUS_VALUES).notNull().default("pending"),
        requesterId: int("requester_id", { unsigned: true })
            .references(() => users.id, { onDelete: "set null" }),
        organizationId: int("organization_id", { unsigned: true })
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        escalatedAt: timestamp("escalated_at"),
        fulfilledById: int("fulfilled_by_id", { unsigned: true })
            .references(() => donorProfiles.id, { onDelete: "set null" }),
        // Post-fulfilment feedback, flattened out of the old nested object.
        feedbackRating: tinyint("feedback_rating", { unsigned: true }),
        feedbackNotes: text("feedback_notes"),
        feedbackSubmittedAt: timestamp("feedback_submitted_at"),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (table) => [
        index("blood_requests_org_status_idx").on(table.organizationId, table.status),
        index("blood_requests_org_created_idx").on(table.organizationId, table.createdAt),
        index("blood_requests_urgency_idx").on(table.urgency),
    ],
);

/**
 * Replaces the old `matchedDonors: string[]` array field. A join table keeps
 * referential integrity and lets matches be queried from either side.
 */
export const bloodRequestMatches = mysqlTable(
    "blood_request_matches",
    {
        requestId: int("request_id", { unsigned: true })
            .notNull()
            .references(() => bloodRequests.id, { onDelete: "cascade" }),
        donorProfileId: int("donor_profile_id", { unsigned: true })
            .notNull()
            .references(() => donorProfiles.id, { onDelete: "cascade" }),
        createdAt: createdAt(),
    },
    (table) => [
        primaryKey({ columns: [table.requestId, table.donorProfileId] }),
        index("blood_request_matches_donor_idx").on(table.donorProfileId),
    ],
);

export const donations = mysqlTable(
    "donations",
    {
        id: int("id", { unsigned: true }).autoincrement().primaryKey(),
        donorProfileId: int("donor_profile_id", { unsigned: true })
            .notNull()
            .references(() => donorProfiles.id, { onDelete: "cascade" }),
        organizationId: int("organization_id", { unsigned: true })
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        bloodGroup: mysqlEnum("blood_group", BLOOD_GROUP_VALUES).notNull(),
        donationDate: datetime("donation_date").notNull(),
        location: varchar("location", { length: 512 }),
        recipientName: varchar("recipient_name", { length: 191 }),
        notes: text("notes"),
        pointsAwarded: int("points_awarded", { unsigned: true }).notNull().default(0),
        createdAt: createdAt(),
    },
    (table) => [
        index("donations_donor_idx").on(table.donorProfileId),
        index("donations_org_date_idx").on(table.organizationId, table.donationDate),
    ],
);

export const events = mysqlTable(
    "events",
    {
        id: int("id", { unsigned: true }).autoincrement().primaryKey(),
        title: varchar("title", { length: 191 }).notNull(),
        description: text("description"),
        date: datetime("date").notNull(),
        endDate: datetime("end_date"),
        location: varchar("location", { length: 512 }),
        district: varchar("district", { length: 128 }),
        upazila: varchar("upazila", { length: 128 }),
        organizationId: int("organization_id", { unsigned: true })
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        createdById: int("created_by_id", { unsigned: true })
            .references(() => users.id, { onDelete: "set null" }),
        maxParticipants: int("max_participants", { unsigned: true }),
        contactNumber: varchar("contact_number", { length: 32 }),
        status: mysqlEnum("status", EVENT_STATUS_VALUES).notNull().default("upcoming"),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (table) => [
        index("events_org_status_idx").on(table.organizationId, table.status),
        index("events_org_date_idx").on(table.organizationId, table.date),
    ],
);

export const auditLogs = mysqlTable(
    "audit_logs",
    {
        id: int("id", { unsigned: true }).autoincrement().primaryKey(),
        action: mysqlEnum("action", AUDIT_ACTION_VALUES).notNull(),
        // Never taken from the request body, always the server-side session.
        performedById: int("performed_by_id", { unsigned: true })
            .references(() => users.id, { onDelete: "set null" }),
        organizationId: int("organization_id", { unsigned: true })
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        targetType: varchar("target_type", { length: 64 }),
        targetId: int("target_id", { unsigned: true }),
        details: varchar("details", { length: 512 }),
        createdAt: createdAt(),
    },
    (table) => [
        index("audit_logs_org_created_idx").on(table.organizationId, table.createdAt),
        index("audit_logs_action_idx").on(table.action),
    ],
);

export const feedback = mysqlTable(
    "feedback",
    {
        id: int("id", { unsigned: true }).autoincrement().primaryKey(),
        name: varchar("name", { length: 191 }).notNull(),
        email: varchar("email", { length: 191 }),
        category: mysqlEnum("category", FEEDBACK_CATEGORY_VALUES).notNull().default("general"),
        message: text("message").notNull(),
        status: mysqlEnum("status", FEEDBACK_STATUS_VALUES).notNull().default("new"),
        // Nullable: the platform-level feedback form has no organization.
        organizationId: int("organization_id", { unsigned: true })
            .references(() => organizations.id, { onDelete: "cascade" }),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (table) => [
        index("feedback_org_status_idx").on(table.organizationId, table.status),
        index("feedback_category_idx").on(table.category),
    ],
);

export const pushSubscriptions = mysqlTable(
    "push_subscriptions",
    {
        id: int("id", { unsigned: true }).autoincrement().primaryKey(),
        // Firebase Cloud Messaging registration token.
        token: varchar("token", { length: 255 }).notNull(),
        organizationId: int("organization_id", { unsigned: true })
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        userId: int("user_id", { unsigned: true })
            .references(() => users.id, { onDelete: "cascade" }),
        // Optional delivery filters; NULL means "send me everything".
        district: varchar("district", { length: 128 }),
        bloodGroup: mysqlEnum("blood_group", BLOOD_GROUP_VALUES),
        createdAt: createdAt(),
        updatedAt: updatedAt(),
    },
    (table) => [
        uniqueIndex("push_subscriptions_token_unique").on(table.token),
        index("push_subscriptions_org_idx").on(table.organizationId),
    ],
);

/* -------------------------------------------------------------------------- */
/* Relations                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * IMPORTANT: do not use the relational query API (`db.query.<table>.findMany`
 * with `with: { ... }`) against this database.
 *
 * Drizzle compiles those queries into LEFT JOIN LATERAL, which MySQL 8.0.14+
 * supports but MariaDB does not. Production runs MariaDB 11.8 on Hostinger, so
 * such a query fails at runtime with ER_PARSE_ERROR (1064), not at compile time.
 *
 * Repositories therefore use explicit `db.select().innerJoin(...)` instead. The
 * relations below stay because they document the foreign keys and because
 * drizzle-kit reads them; they are not a licence to use `db.query`.
 */

export const organizationsRelations = relations(organizations, ({ many }) => ({
    users: many(users),
    donorProfiles: many(donorProfiles),
    bloodRequests: many(bloodRequests),
    donations: many(donations),
    events: many(events),
    auditLogs: many(auditLogs),
    feedback: many(feedback),
    pushSubscriptions: many(pushSubscriptions),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [users.organizationId],
        references: [organizations.id],
    }),
    donorProfiles: many(donorProfiles),
    bloodRequests: many(bloodRequests),
}));

export const donorProfilesRelations = relations(donorProfiles, ({ one, many }) => ({
    user: one(users, { fields: [donorProfiles.userId], references: [users.id] }),
    organization: one(organizations, {
        fields: [donorProfiles.organizationId],
        references: [organizations.id],
    }),
    donations: many(donations),
    matches: many(bloodRequestMatches),
}));

export const bloodRequestsRelations = relations(bloodRequests, ({ one, many }) => ({
    requester: one(users, { fields: [bloodRequests.requesterId], references: [users.id] }),
    organization: one(organizations, {
        fields: [bloodRequests.organizationId],
        references: [organizations.id],
    }),
    fulfilledBy: one(donorProfiles, {
        fields: [bloodRequests.fulfilledById],
        references: [donorProfiles.id],
    }),
    matches: many(bloodRequestMatches),
}));

export const bloodRequestMatchesRelations = relations(bloodRequestMatches, ({ one }) => ({
    request: one(bloodRequests, {
        fields: [bloodRequestMatches.requestId],
        references: [bloodRequests.id],
    }),
    donorProfile: one(donorProfiles, {
        fields: [bloodRequestMatches.donorProfileId],
        references: [donorProfiles.id],
    }),
}));

export const donationsRelations = relations(donations, ({ one }) => ({
    donorProfile: one(donorProfiles, {
        fields: [donations.donorProfileId],
        references: [donorProfiles.id],
    }),
    organization: one(organizations, {
        fields: [donations.organizationId],
        references: [organizations.id],
    }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
    organization: one(organizations, {
        fields: [events.organizationId],
        references: [organizations.id],
    }),
    createdBy: one(users, { fields: [events.createdById], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    performedBy: one(users, { fields: [auditLogs.performedById], references: [users.id] }),
    organization: one(organizations, {
        fields: [auditLogs.organizationId],
        references: [organizations.id],
    }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
    organization: one(organizations, {
        fields: [feedback.organizationId],
        references: [organizations.id],
    }),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
    organization: one(organizations, {
        fields: [pushSubscriptions.organizationId],
        references: [organizations.id],
    }),
    user: one(users, { fields: [pushSubscriptions.userId], references: [users.id] }),
}));
