export enum UserRole {
    DONOR = "donor",
    PATIENT = "patient",
    VOLUNTEER = "volunteer",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin",
}

export interface INotificationPreferences {
    emailDonationReminders: boolean;
    emailNewRequests: boolean;
    emailEventUpdates: boolean;
    inAppAlerts: boolean;
}

// Re-export common types from Mongoose models to adapt them
export interface IUser {
    _id?: string;
    id?: string;
    name: string;
    phone: string;
    email?: string;
    role: "super_admin" | "admin" | "donor" | "patient" | "volunteer";
    organization?: string;
    password?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IDonorProfile {
    _id?: string;
    id?: string;
    user: string;
    organization: string;
    bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
    district: string;
    upazila: string;
    village: string;
    lastDonation?: Date;
    totalDonations: number;
    isAvailable: boolean;
    isVerified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IOrganization {
    _id?: string;
    id?: string;
    name: string;
    slug: string;
    logo?: string;
    primaryColor: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export enum RequestStatus {
    PENDING = "pending",
    FULFILLED = "fulfilled",
    CANCELED = "canceled",
}

export enum UrgencyLevel {
    NORMAL = "normal",
    URGENT = "urgent",
    EMERGENCY = "emergency",
}

export interface IRequestFeedback {
    rating: number;
    notes?: string;
    submittedAt: Date | any;
}

export interface IBloodRequest {
    _id?: string;
    patientName: string;
    bloodGroup: string;
    location: string;
    district: string;
    upazila: string;
    urgency: UrgencyLevel;
    requiredDate: Date | any;
    contactNumber: string;
    additionalNotes?: string;
    status: RequestStatus;
    requester?: string; // User ID
    organization: string; // Org ID
    matchedDonors: string[]; // Array of DonorProfile IDs
    escalatedAt?: Date | any;
    fulfilledBy?: string; // DonorProfile ID
    feedback?: IRequestFeedback;
    createdAt?: Date | any;
    updatedAt?: Date | any;
}

// Collection Names
export const COLLECTIONS = {
    USERS: "users",
    DONOR_PROFILES: "donorProfiles",
    ORGANIZATIONS: "organizations",
    BLOOD_REQUESTS: "bloodRequests",
    PUSH_SUBSCRIPTIONS: "pushSubscriptions",
    AUDIT_LOGS: "auditLogs",
    DONATIONS: "donations",
    EVENTS: "events",
    FEEDBACK: "feedback",
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];
