import mongoose, { Schema, Document, Model } from "mongoose";

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

export interface IBloodRequest extends Document {
    patientName: string;
    bloodGroup: string;
    location: string;
    district: string;
    upazila: string;
    urgency: UrgencyLevel;
    requiredDate: Date;
    contactNumber: string;
    additionalNotes?: string;
    status: RequestStatus;
    requester: mongoose.Types.ObjectId;
    organization: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const BloodRequestSchema: Schema = new Schema(
    {
        patientName: { type: String, required: true },
        bloodGroup: { type: String, required: true },
        location: { type: String, required: true },
        district: { type: String, required: true },
        upazila: { type: String, required: true },
        urgency: {
            type: String,
            enum: Object.values(UrgencyLevel),
            default: UrgencyLevel.NORMAL,
        },
        requiredDate: { type: Date, required: true },
        contactNumber: { type: String, required: true },
        additionalNotes: { type: String },
        status: {
            type: String,
            enum: Object.values(RequestStatus),
            default: RequestStatus.PENDING,
        },
        requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
        organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    },
    { timestamps: true }
);

// In development, handle hot-reloading by clearing the model if schema changed
if (process.env.NODE_ENV === "development" && mongoose.models.BloodRequest) {
    delete (mongoose.models as any).BloodRequest;
}

export const BloodRequest: Model<IBloodRequest> =
    mongoose.models.BloodRequest || mongoose.model<IBloodRequest>("BloodRequest", BloodRequestSchema);
