import mongoose, { Schema, Document, Model } from "mongoose";

export enum VehicleType {
    BICYCLE = "bicycle",
    MOTORBIKE = "motorbike",
    RICKSHAW = "rickshaw",
    CAR = "car",
    OTHER = "other"
}

export interface IRiderProfile extends Document {
    user: mongoose.Types.ObjectId;
    organization: mongoose.Types.ObjectId;
    vehicleType: VehicleType;
    vehiclePlate?: string;
    coverageDistricts: string[];
    coverageUpazila: string[];
    availabilityStatus: "available" | "busy" | "offline";
    isVerified: boolean;
    reliabilityScore: number;
    totalDeliveries: number;
    createdAt: Date;
    updatedAt: Date;
}

const RiderProfileSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        vehicleType: {
            type: String,
            enum: Object.values(VehicleType),
            default: VehicleType.MOTORBIKE
        },
        vehiclePlate: { type: String },
        coverageDistricts: { type: [String], required: true },
        coverageUpazila: { type: [String], required: true },
        availabilityStatus: {
            type: String,
            enum: ["available", "busy", "offline"],
            default: "offline"
        },
        isVerified: { type: Boolean, default: false },
        reliabilityScore: { type: Number, default: 100 },
        totalDeliveries: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// One rider profile per user per organization
RiderProfileSchema.index({ user: 1, organization: 1 }, { unique: true });
RiderProfileSchema.index({ coverageDistricts: 1 });
RiderProfileSchema.index({ coverageUpazila: 1 });
RiderProfileSchema.index({ availabilityStatus: 1 });

if (process.env.NODE_ENV === "development" && mongoose.models.RiderProfile) {
    delete (mongoose.models as any).RiderProfile;
}

export const RiderProfile: Model<IRiderProfile> =
    mongoose.models.RiderProfile || mongoose.model<IRiderProfile>("RiderProfile", RiderProfileSchema);
