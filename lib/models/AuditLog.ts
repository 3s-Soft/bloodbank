import mongoose, { Schema, Document, Model } from "mongoose";

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

export interface IAuditLog extends Document {
    action: AuditAction;
    performedBy: mongoose.Types.ObjectId;
    organization: mongoose.Types.ObjectId;
    targetType?: string;
    targetId?: mongoose.Types.ObjectId;
    details?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
    {
        action: {
            type: String,
            enum: Object.values(AuditAction),
            required: true,
        },
        performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        targetType: { type: String },
        targetId: { type: Schema.Types.ObjectId },
        details: { type: String },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

AuditLogSchema.index({ organization: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1 });

if (process.env.NODE_ENV === "development" && mongoose.models.AuditLog) {
    delete (mongoose.models as any).AuditLog;
}

export const AuditLog: Model<IAuditLog> =
    mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
