import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrganization extends Document {
    name: string;
    slug: string;
    logo?: string;
    primaryColor?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const OrganizationSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
        logo: { type: String },
        primaryColor: { type: String, default: "#D32F2F" },
        contactEmail: { type: String },
        contactPhone: { type: String },
        address: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const Organization: Model<IOrganization> =
    mongoose.models.Organization || mongoose.model<IOrganization>("Organization", OrganizationSchema);
