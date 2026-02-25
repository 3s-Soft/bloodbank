import mongoose, { Schema, Document, Model } from "mongoose";

export enum EventStatus {
    UPCOMING = "upcoming",
    ONGOING = "ongoing",
    COMPLETED = "completed",
    CANCELED = "canceled",
}

export interface IEvent extends Document {
    title: string;
    description: string;
    date: Date;
    endDate?: Date;
    location: string;
    district: string;
    upazila?: string;
    organization: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    status: EventStatus;
    maxParticipants?: number;
    contactNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        date: { type: Date, required: true },
        endDate: { type: Date },
        location: { type: String, required: true },
        district: { type: String, required: true },
        upazila: { type: String },
        organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        status: {
            type: String,
            enum: Object.values(EventStatus),
            default: EventStatus.UPCOMING,
        },
        maxParticipants: { type: Number },
        contactNumber: { type: String },
    },
    { timestamps: true }
);

EventSchema.index({ organization: 1, date: -1 });
EventSchema.index({ status: 1 });

if (process.env.NODE_ENV === "development" && mongoose.models.Event) {
    delete (mongoose.models as any).Event;
}

export const Event: Model<IEvent> =
    mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
