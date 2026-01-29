import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Organization } from "@/lib/models/Organization";
import { User, DonorProfile } from "@/lib/models/User";
import { BloodRequest } from "@/lib/models/BloodRequest";

// GET - Get super admin dashboard stats
export async function GET() {
    try {
        await connectDB();

        const totalOrganizations = await Organization.countDocuments({});
        const activeOrganizations = await Organization.countDocuments({ isActive: true });
        const totalDonors = await DonorProfile.countDocuments({});
        const totalUsers = await User.countDocuments({});
        const totalRequests = await BloodRequest.countDocuments({});
        const pendingRequests = await BloodRequest.countDocuments({ status: "pending" });
        const fulfilledRequests = await BloodRequest.countDocuments({ status: "fulfilled" });

        // Get recent organizations
        const recentOrganizations = await Organization.find({})
            .sort({ createdAt: -1 })
            .limit(5);

        // Get organization stats with donor/request counts
        const organizations = await Organization.find({}).lean();
        const orgStats = await Promise.all(
            organizations.map(async (org) => {
                const donorCount = await DonorProfile.countDocuments({ organization: org._id });
                const requestCount = await BloodRequest.countDocuments({ organization: org._id });
                return {
                    ...org,
                    donorCount,
                    requestCount
                };
            })
        );

        return NextResponse.json({
            stats: {
                totalOrganizations,
                activeOrganizations,
                totalDonors,
                totalUsers,
                totalRequests,
                pendingRequests,
                fulfilledRequests,
            },
            recentOrganizations,
            orgStats,
        });
    } catch (error: any) {
        console.error("Fetch admin stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
