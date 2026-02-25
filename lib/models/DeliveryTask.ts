import mongoose, { Schema, Document, Model } from "mongoose";

export enum TaskStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    PICKED_UP = "picked_up",
    IN_TRANSIT = "in_transit",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}

export interface IDeliveryTask extends Document {
    bloodRequest: mongoose.Types.ObjectId;
    organization: mongoose.Types.ObjectId;
    rider?: mongoose.Types.ObjectId;
    status: TaskStatus;
    sourceName: string;
    sourceAddress: string;
    sourceLocation?: {
        lat: number;
        lng: number;
    };
    destinationName: string;
    destinationAddress: string;
    destinationLocation?: {
        lat: number;
        lng: number;
    };
    contactPhone: string;
    estimatedDeliveryTime?: Date;
    actualDeliveryTime?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DeliveryTaskSchema: Schema = new Schema(
    {
        bloodRequest: { type: Schema.Types.ObjectId, ref: "BloodRequest", required: true },
        organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        rider: { type: Schema.Types.ObjectId, ref: "User" },
        status: {
            type: String,
            enum: Object.values(TaskStatus),
            default: TaskStatus.PENDING
        },
        sourceName: { type: String, required: true },
        sourceAddress: { type: String, required: true },
        sourceLocation: {
            lat: { type: Number },
            lng: { type: Number }
        },
        destinationName: { type: String, required: true },
        destinationAddress: { type: String, required: true },
        destinationLocation: {
            lat: { type: Number },
            lng: { type: Number }
        },
        contactPhone: { type: String, required: true },
        estimatedDeliveryTime: { type: Date },
        actualDeliveryTime: { type: Date },
        notes: { type: String },
    },
    { timestamps: true }
);

DeliveryTaskSchema.index({ organization: 1, status: 1 });
DeliveryTaskSchema.index({ rider: 1, status: 1 });
DeliveryTaskSchema.index({ bloodRequest: 1 });

if (process.env.NODE_ENV === "development" && mongoose.models.DeliveryTask) {
    delete (mongoose.models as any).DeliveryTask;
}

export const DeliveryTask: Model<IDeliveryTask> =
    mongoose.models.DeliveryTask || mongoose.model<IDeliveryTask>("DeliveryTask", DeliveryTaskSchema);
