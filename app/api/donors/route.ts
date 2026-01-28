import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { DonorProfile } from "@/lib/models/User";
import Organization from "@/lib/models/Organization";

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");
        const bloodGroup = searchParams.get("bloodGroup");
        const district = searchParams.get("district");
        const upazila = searchParams.get("upazila");

        if (!orgSlug) {
            return NextResponse.json({ error: "Organization slug is required" }, { status: 400 });
        }

        const organization = await Organization.findOne({ slug: orgSlug });
        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        let query: any = { organization: organization._id };

        if (bloodGroup) query.bloodGroup = bloodGroup;
        if (district) query.district = new RegExp(district, "i");
        if (upazila) query.upazila = new RegExp(upazila, "i");

        const donors = await DonorProfile.find(query)
            .populate("user", "name phone")
            .sort({ createdAt: -1 });

        return NextResponse.json(donors);
    } catch (error: any) {
        console.error("Fetch donors error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
