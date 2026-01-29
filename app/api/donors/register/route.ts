import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { User, UserRole, DonorProfile } from "@/lib/models/User";
import { Organization } from "@/lib/models/Organization";

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, phone, age, gender, bloodGroup, district, upazila, village, lastDonationDate, orgSlug } = body;

        // Find organization
        const organization = await Organization.findOne({ slug: orgSlug });
        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        // Check if user already exists
        let user = await User.findOne({ phone, organization: organization._id });

        if (!user) {
            // Create user for the organization
            user = await User.create({
                name,
                phone,
                role: UserRole.DONOR,
                organization: organization._id,
            });
        }

        // Create or update donor profile
        const donorProfile = await DonorProfile.findOneAndUpdate(
            { user: user._id, organization: organization._id },
            {
                bloodGroup,
                district,
                upazila,
                village,
                lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : undefined,
                isAvailable: true,
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: "Registration successful", user, donorProfile }, { status: 201 });
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
