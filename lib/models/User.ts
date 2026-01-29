import mongoose, { Schema, Document, Model } from "mongoose";

export enum UserRole {
    DONOR = "donor",
    PATIENT = "patient",
    VOLUNTEER = "volunteer",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin",
}

export interface IUser extends Document {
    name: string;
    phone?: string;
    email?: string;
    password?: string;
    role: UserRole;
    organization?: mongoose.Types.ObjectId;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, unique: true, sparse: true, required: false },
        email: { type: String, unique: true, sparse: true, required: false },
        password: { type: String },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.PATIENT,
        },
        organization: { type: Schema.Types.ObjectId, ref: "Organization" },
        image: { type: String },
    },
    { timestamps: true }
);

export interface IDonorProfile extends Document {
    user: mongoose.Types.ObjectId;
    organization: mongoose.Types.ObjectId;
    bloodGroup: string;
    district: string;
    upazila: string;
    village?: string;
    lastDonationDate?: Date;
    isAvailable: boolean;
    isVerified: boolean;
}

const DonorProfileSchema: Schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        organization: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
        bloodGroup: { type: String, required: true },
        district: { type: String, required: true },
        upazila: { type: String, required: true },
        village: { type: String },
        lastDonationDate: { type: Date },
        isAvailable: { type: Boolean, default: true },
        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const DonorProfile: Model<IDonorProfile> =
    mongoose.models.DonorProfile || mongoose.model<IDonorProfile>("DonorProfile", DonorProfileSchema);
