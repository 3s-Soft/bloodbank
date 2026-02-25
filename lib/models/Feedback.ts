import mongoose, { Schema, Document, Model } from "mongoose";

export enum FeedbackCategory {
    BUG = "bug",
    FEATURE = "feature",
    GENERAL = "general",
    COMPLAINT = "complaint",
    PRAISE = "praise",
}

export enum FeedbackStatus {
    NEW = "new",
    REVIEWED = "reviewed",
    RESOLVED = "resolved",
    DISMISSED = "dismissed",
}

export interface IFeedback extends Document {
    name: string;
    email?: string;
    category: FeedbackCategory;
    message: string;
    status: FeedbackStatus;
    organization?: mongoose.Types.ObjectId;
    user?: mongoose.Types.ObjectId;
    adminNotes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        email: { type: String },
        category: {
            type: String,
            enum: Object.values(FeedbackCategory),
            default: FeedbackCategory.GENERAL,
        },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: Object.values(FeedbackStatus),
            default: FeedbackStatus.NEW,
        },
        organization: { type: Schema.Types.ObjectId, ref: "Organization" },
        user: { type: Schema.Types.ObjectId, ref: "User" },
        adminNotes: { type: String },
    },
    { timestamps: true }
);

FeedbackSchema.index({ organization: 1, createdAt: -1 });
FeedbackSchema.index({ status: 1 });

if (process.env.NODE_ENV === "development" && mongoose.models.Feedback) {
    delete (mongoose.models as any).Feedback;
}

export const Feedback: Model<IFeedback> =
    mongoose.models.Feedback || mongoose.model<IFeedback>("Feedback", FeedbackSchema);
