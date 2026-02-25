import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDonation extends Document {
    donor: mongoose.Types.ObjectId;
    organization: mongoose.Types.ObjectId;
    bloodGroup: string;
    donationDate: Date;
    location?: string;
    recipientName?: string;
    notes?: string;
    pointsAwarded: number;
    createdAt: Date;
    updatedAt: Date;
}

const DonationSchema: Schema = new Schema(
    {
        donor: { type: Schema.Types.ObjectId, ref: "DonorProfile", required: true },
        organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        bloodGroup: { type: String, required: true },
        donationDate: { type: Date, required: true },
        location: { type: String },
        recipientName: { type: String },
        notes: { type: String },
        pointsAwarded: { type: Number, default: 100 },
    },
    { timestamps: true }
);

DonationSchema.index({ donor: 1, organization: 1 });
DonationSchema.index({ donationDate: -1 });

if (process.env.NODE_ENV === "development" && mongoose.models.Donation) {
    delete (mongoose.models as any).Donation;
}

export const Donation: Model<IDonation> =
    mongoose.models.Donation || mongoose.model<IDonation>("Donation", DonationSchema);
