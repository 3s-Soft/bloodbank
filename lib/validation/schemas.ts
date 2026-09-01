import { z } from "zod";

import {
    BLOOD_GROUP_VALUES,
    EVENT_STATUS_VALUES,
    FEEDBACK_CATEGORY_VALUES,
    FEEDBACK_STATUS_VALUES,
    REQUEST_STATUS_VALUES,
    URGENCY_LEVEL_VALUES,
    USER_ROLE_VALUES,
} from "@/lib/db/enums";

/**
 * Input validation shared by the API routes and the forms that feed them.
 *
 * Routes previously destructured `await req.json()` with no checks, so bad
 * input surfaced as a MySQL error (or was written verbatim). Parsing here means
 * a malformed request is a 400 with field-level details.
 */

/** Bangladeshi mobile numbers: 11 digits beginning 013–019. */
export const phoneSchema = z
    .string()
    .trim()
    .regex(/^01[3-9]\d{8}$/, "Enter a valid 11-digit Bangladeshi mobile number");

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");

export const slugSchema = z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Slug is too short")
    .max(191)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only");

export const bloodGroupSchema = z.enum(BLOOD_GROUP_VALUES);
export const urgencySchema = z.enum(URGENCY_LEVEL_VALUES);
export const requestStatusSchema = z.enum(REQUEST_STATUS_VALUES);
export const userRoleSchema = z.enum(USER_ROLE_VALUES);
export const eventStatusSchema = z.enum(EVENT_STATUS_VALUES);
export const feedbackCategorySchema = z.enum(FEEDBACK_CATEGORY_VALUES);
export const feedbackStatusSchema = z.enum(FEEDBACK_STATUS_VALUES);

/** Numeric ids arrive from URLs and query strings as strings. */
export const idSchema = z.coerce.number().int().positive();

export const orgSlugQuerySchema = z.object({
    orgSlug: slugSchema,
});

/* ------------------------------------------------------------------ donors */

export const donorRegistrationSchema = z
    .object({
        name: z.string().trim().min(2, "Name is required").max(191),
        email: emailSchema.optional().or(z.literal("")),
        phone: phoneSchema.optional().or(z.literal("")),
        password: z.string().min(8, "Password must be at least 8 characters").optional(),
        bloodGroup: bloodGroupSchema,
        district: z.string().trim().min(1, "District is required").max(128),
        upazila: z.string().trim().min(1, "Upazila is required").max(128),
        village: z.string().trim().max(128).optional().or(z.literal("")),
        lastDonationDate: z.coerce.date().optional().nullable(),
        orgSlug: slugSchema,
    })
    .refine((value) => Boolean(value.phone || value.email), {
        message: "Provide either a phone number or an email address",
        path: ["phone"],
    });

export const donorQuerySchema = z.object({
    orgSlug: slugSchema,
    bloodGroup: bloodGroupSchema.optional(),
    district: z.string().trim().max(128).optional(),
    upazila: z.string().trim().max(128).optional(),
    donorId: idSchema.optional(),
    availableOnly: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => value === "true"),
});

export const donorVerifySchema = z.object({
    donorId: idSchema,
    isVerified: z.boolean(),
    orgSlug: slugSchema,
});

export const donorImportSchema = z.object({
    orgSlug: slugSchema,
    donors: z
        .array(
            z.object({
                name: z.string().trim().min(2).max(191),
                phone: phoneSchema,
                bloodGroup: bloodGroupSchema,
                district: z.string().trim().max(128).optional(),
                upazila: z.string().trim().max(128).optional(),
                village: z.string().trim().max(128).optional(),
            }),
        )
        .min(1, "Provide at least one donor")
        .max(500, "Import at most 500 donors at a time"),
});

/* ---------------------------------------------------------------- requests */

export const bloodRequestCreateSchema = z.object({
    patientName: z.string().trim().min(2, "Patient name is required").max(191),
    bloodGroup: bloodGroupSchema,
    location: z.string().trim().max(512).optional().or(z.literal("")),
    district: z.string().trim().min(1, "District is required").max(128),
    upazila: z.string().trim().min(1, "Upazila is required").max(128),
    urgency: urgencySchema.default("normal"),
    requiredDate: z.coerce.date(),
    contactNumber: phoneSchema,
    additionalNotes: z.string().trim().max(2000).optional().or(z.literal("")),
    orgSlug: slugSchema,
});

export const bloodRequestQuerySchema = z.object({
    orgSlug: slugSchema,
    status: requestStatusSchema.optional(),
    urgency: urgencySchema.optional(),
    bloodGroup: bloodGroupSchema.optional(),
});

export const bloodRequestStatusSchema = z.object({
    requestId: idSchema,
    status: requestStatusSchema,
    orgSlug: slugSchema,
    fulfilledById: idSchema.optional(),
});

export const donorMatchSchema = z.object({
    orgSlug: slugSchema,
    bloodGroup: bloodGroupSchema,
    district: z.string().trim().max(128).optional(),
    upazila: z.string().trim().max(128).optional(),
    requestId: idSchema.optional(),
});

/* --------------------------------------------------------------- donations */

export const donationCreateSchema = z.object({
    donorProfileId: idSchema,
    orgSlug: slugSchema,
    donationDate: z.coerce.date(),
    location: z.string().trim().max(512).optional().or(z.literal("")),
    recipientName: z.string().trim().max(191).optional().or(z.literal("")),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const donationQuerySchema = z
    .object({
        donorId: idSchema.optional(),
        orgSlug: slugSchema.optional(),
    })
    .refine((value) => Boolean(value.donorId || value.orgSlug), {
        message: "Provide donorId or orgSlug",
    });

/* ------------------------------------------------------------------ events */

export const eventCreateSchema = z.object({
    title: z.string().trim().min(2, "Title is required").max(191),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
    date: z.coerce.date(),
    endDate: z.coerce.date().optional().nullable(),
    location: z.string().trim().max(512).optional().or(z.literal("")),
    district: z.string().trim().max(128).optional().or(z.literal("")),
    upazila: z.string().trim().max(128).optional().or(z.literal("")),
    maxParticipants: z.coerce.number().int().positive().max(100000).optional(),
    contactNumber: phoneSchema.optional().or(z.literal("")),
    orgSlug: slugSchema,
});

export const eventUpdateSchema = eventCreateSchema.partial().extend({
    eventId: idSchema,
    orgSlug: slugSchema,
    status: eventStatusSchema.optional(),
});

export const eventQuerySchema = z.object({
    orgSlug: slugSchema,
    status: eventStatusSchema.optional(),
    upcomingOnly: z
        .enum(["true", "false"])
        .optional()
        .transform((value) => value === "true"),
});

/* ------------------------------------------------------------------- users */

export const orgUserQuerySchema = z.object({
    orgSlug: slugSchema,
    role: z.union([userRoleSchema, z.literal("all")]).optional(),
    search: z.string().trim().max(191).optional(),
});

export const orgUserCreateSchema = z.object({
    name: z.string().trim().min(2, "Name is required").max(191),
    phone: phoneSchema,
    email: emailSchema.optional().or(z.literal("")),
    // Optional: an admin may add a member record before that person has a
    // login. Without a password the account simply cannot sign in with
    // credentials, which matches the previous behaviour.
    password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
    role: userRoleSchema,
    orgSlug: slugSchema,
});

export const orgUserUpdateSchema = z.object({
    name: z.string().trim().min(2).max(191).optional(),
    phone: phoneSchema.optional(),
    email: emailSchema.optional().or(z.literal("")),
    role: userRoleSchema.optional(),
    orgSlug: slugSchema,
});

/* ----------------------------------------------------------- organizations */

export const organizationCreateSchema = z.object({
    name: z.string().trim().min(2, "Name is required").max(191),
    slug: slugSchema,
    logo: z.string().trim().url("Enter a valid URL").max(512).optional().or(z.literal("")),
    primaryColor: z
        .string()
        .trim()
        .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Enter a hex colour such as #D32F2F")
        .default("#D32F2F"),
    contactEmail: emailSchema.optional().or(z.literal("")),
    contactPhone: phoneSchema.optional().or(z.literal("")),
    address: z.string().trim().max(512).optional().or(z.literal("")),
});

export const organizationUpdateSchema = organizationCreateSchema.partial().extend({
    isActive: z.boolean().optional(),
});

export const organizationSettingsSchema = organizationCreateSchema.partial().extend({
    orgSlug: slugSchema,
});

/* ---------------------------------------------------------------- feedback */

export const feedbackCreateSchema = z.object({
    name: z.string().trim().min(2, "Name is required").max(191),
    email: emailSchema.optional().or(z.literal("")),
    category: feedbackCategorySchema.default("general"),
    message: z.string().trim().min(5, "Message is too short").max(5000),
    orgSlug: slugSchema.optional(),
});

export const feedbackQuerySchema = z.object({
    orgSlug: slugSchema.optional(),
    status: feedbackStatusSchema.optional(),
    category: feedbackCategorySchema.optional(),
});

/* -------------------------------------------------------------------- push */

export const pushSubscribeSchema = z.object({
    token: z.string().trim().min(10).max(255),
    orgSlug: slugSchema,
    district: z.string().trim().max(128).optional(),
    bloodGroup: bloodGroupSchema.optional(),
});

export const pushUnsubscribeSchema = z.object({
    token: z.string().trim().min(10).max(255),
});

/* ------------------------------------------------------------- audit / log */

export const auditLogQuerySchema = z.object({
    orgSlug: slugSchema,
    action: z.string().trim().max(64).optional(),
    limit: z.coerce.number().int().min(1).max(200).default(100),
});

export type DonorRegistrationInput = z.infer<typeof donorRegistrationSchema>;
export type BloodRequestCreateInput = z.infer<typeof bloodRequestCreateSchema>;
export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type OrganizationCreateInput = z.infer<typeof organizationCreateSchema>;
export type FeedbackCreateInput = z.infer<typeof feedbackCreateSchema>;
