import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPushSubscription extends Document {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    organization: mongoose.Types.ObjectId;
    user?: mongoose.Types.ObjectId;
    district?: string;
    bloodGroup?: string;
    createdAt: Date;
    updatedAt: Date;
}

const PushSubscriptionSchema: Schema = new Schema(
    {
        endpoint: { type: String, required: true, unique: true },
        keys: {
            p256dh: { type: String, required: true },
            auth: { type: String, required: true },
        },
        organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        user: { type: Schema.Types.ObjectId, ref: "User" },
        district: { type: String },
        bloodGroup: { type: String },
    },
    { timestamps: true }
);

// In development, handle hot-reloading by clearing the model if schema changed
if (process.env.NODE_ENV === "development" && mongoose.models.PushSubscription) {
    delete (mongoose.models as Record<string, unknown>).PushSubscription;
}

export const PushSubscriptionModel: Model<IPushSubscription> =
    mongoose.models.PushSubscription ||
    mongoose.model<IPushSubscription>("PushSubscription", PushSubscriptionSchema);
