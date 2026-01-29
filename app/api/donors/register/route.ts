import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { User, UserRole, DonorProfile } from "@/lib/models/User";
import { Organization } from "@/lib/models/Organization";

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, phone, password, age, gender, bloodGroup, district, upazila, village, lastDonationDate, orgSlug } = body;

        if (!name || !phone || !orgSlug) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Find organization
        const organization = await Organization.findOne({ slug: orgSlug });
        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        // Check if user already exists (globally by phone)
        let user = await User.findOne({ phone });

        if (!user) {
            // Create user for the organization
            user = await User.create({
                name,
                phone,
                password, // Store as provided (bcrypt should be used here later)
                role: UserRole.DONOR,
                organization: organization._id,
            });
        } else {
            // If user exists but is not part of this organization, 
            // and has NO organization assigned yet, we can assign this one.
            if (!user.organization) {
                user.organization = organization._id;
                await user.save();
            }
        }

        // Create or update donor profile for this specific organization
        // Note: Currently DonorProfile has unique: true on user, which prevents multi-org.
        // We will try to update it if it exists.
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
