import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectToDatabase from "@/lib/db/mongodb";
import { RiderProfile } from "@/lib/models/RiderProfile";
import { User, UserRole } from "@/lib/models/User";

export async function POST(req: Request) {
    try {
        const session = (await getServerSession(authOptions as any)) as any;
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const { organizationId, vehicleType, vehiclePlate, coverageDistricts, coverageUpazila } = body;

        if (!organizationId || !vehicleType || !coverageDistricts || !coverageUpazila) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        // Ensure user exists and is a volunteer
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // If user isn't already a volunteer or admin, we might want to update their role 
        // Or keep it as is if they are specifically registering as a rider within an org.
        // For now, let's assume they MUST have the VOLUNTEER role or we upgrade them.
        if (user.role !== UserRole.VOLUNTEER && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
            user.role = UserRole.VOLUNTEER;
            await user.save();
        }

        const profile = await RiderProfile.findOneAndUpdate(
            { user: userId, organization: organizationId },
            {
                vehicleType,
                vehiclePlate,
                coverageDistricts,
                coverageUpazila,
                availabilityStatus: "available" // Default to available on first registration
            },
            { upsert: true, new: true }
        );

        return NextResponse.json(profile);
    } catch (error: any) {
        console.error("Error in Rider POST:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");
        const upazila = searchParams.get("upazila");
        const district = searchParams.get("district");

        await connectToDatabase();

        let query: any = { availabilityStatus: "available" };

        if (orgSlug) {
            // We would need to resolve orgSlug to ID if we didn't have it
            // For now let's assume filtering by location is more common for riders
        }

        if (district) query.coverageDistricts = district;
        if (upazila) query.coverageUpazila = upazila;

        const riders = await RiderProfile.find(query).populate("user", "name phone image").lean();

        return NextResponse.json(riders);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
