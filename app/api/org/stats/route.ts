import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { BloodRequest } from "@/lib/models/BloodRequest";
import { DonorProfile } from "@/lib/models/User";
import { Organization } from "@/lib/models/Organization";

export async function GET(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");

        if (!orgSlug) {
            return NextResponse.json({ error: "Organization slug is required" }, { status: 400 });
        }

        const organization = await Organization.findOne({ slug: orgSlug });
        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        const donorCount = await DonorProfile.countDocuments({ organization: organization._id });
        const activeRequests = await BloodRequest.countDocuments({
            organization: organization._id,
            status: "pending"
        });
        const completedRequests = await BloodRequest.countDocuments({
            organization: organization._id,
            status: "completed"
        });

        // 1. Dynamic Villages Count
        const uniqueVillages = await DonorProfile.distinct("village", {
            organization: organization._id,
            village: { $ne: null, $exists: true }
        });

        // 2. Lives Helped (Calculated from completed requests + donor impact)
        // This is still a heuristic but based on real data
        const livesHelped = completedRequests * 3 + Math.floor(donorCount / 2);

        return NextResponse.json({
            donorsCount: donorCount || 0,
            livesHelped: livesHelped || 0,
            activeRequests: activeRequests || 0,
            villagesCovered: uniqueVillages.length || 0
        });
    } catch (error: any) {
        console.error("Fetch stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
