import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Organization } from "@/lib/models/Organization";
import { User, DonorProfile } from "@/lib/models/User";
import { BloodRequest } from "@/lib/models/BloodRequest";

// GET - Get detailed analytics for super admin
export async function GET() {
    try {
        await connectDB();

        // Overall stats
        const totalOrganizations = await Organization.countDocuments({});
        const activeOrganizations = await Organization.countDocuments({ isActive: true });
        const totalDonors = await DonorProfile.countDocuments({});
        const verifiedDonors = await DonorProfile.countDocuments({ isVerified: true });
        const availableDonors = await DonorProfile.countDocuments({ isAvailable: true });
        const totalUsers = await User.countDocuments({});
        const totalRequests = await BloodRequest.countDocuments({});
        const pendingRequests = await BloodRequest.countDocuments({ status: "pending" });
        const fulfilledRequests = await BloodRequest.countDocuments({ status: "fulfilled" });
        const canceledRequests = await BloodRequest.countDocuments({ status: "canceled" });

        // Blood group distribution (across all orgs)
        const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
        const bloodGroupStats = await Promise.all(
            bloodGroups.map(async (group) => ({
                group,
                count: await DonorProfile.countDocuments({ bloodGroup: group }),
            }))
        );

        // Urgency distribution for pending requests
        const urgencyStats = {
            normal: await BloodRequest.countDocuments({ status: "pending", urgency: "normal" }),
            urgent: await BloodRequest.countDocuments({ status: "pending", urgency: "urgent" }),
            emergency: await BloodRequest.countDocuments({ status: "pending", urgency: "emergency" }),
        };

        // Per-organization stats
        const organizations = await Organization.find({}).lean();
        const orgStats = await Promise.all(
            organizations.map(async (org) => {
                const donorCount = await DonorProfile.countDocuments({ organization: org._id });
                const verifiedCount = await DonorProfile.countDocuments({ organization: org._id, isVerified: true });
                const requestCount = await BloodRequest.countDocuments({ organization: org._id });
                const pendingCount = await BloodRequest.countDocuments({ organization: org._id, status: "pending" });
                const fulfilledCount = await BloodRequest.countDocuments({ organization: org._id, status: "fulfilled" });

                return {
                    _id: org._id,
                    name: org.name,
                    slug: org.slug,
                    primaryColor: org.primaryColor,
                    isActive: org.isActive,
                    donorCount,
                    verifiedCount,
                    requestCount,
                    pendingCount,
                    fulfilledCount,
                    fulfillmentRate: requestCount > 0 ? Math.round((fulfilledCount / requestCount) * 100) : 0,
                };
            })
        );

        // District distribution
        const districtAggregation = await DonorProfile.aggregate([
            { $group: { _id: "$district", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Recent activity (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const recentDonors = await DonorProfile.countDocuments({ createdAt: { $gte: weekAgo } });
        const recentRequests = await BloodRequest.countDocuments({ createdAt: { $gte: weekAgo } });

        return NextResponse.json({
            overview: {
                totalOrganizations,
                activeOrganizations,
                totalDonors,
                verifiedDonors,
                availableDonors,
                totalUsers,
                totalRequests,
                pendingRequests,
                fulfilledRequests,
                canceledRequests,
                fulfillmentRate: totalRequests > 0 ? Math.round((fulfilledRequests / totalRequests) * 100) : 0,
            },
            bloodGroupStats,
            urgencyStats,
            orgStats,
            districtStats: districtAggregation.map(d => ({ district: d._id, count: d.count })),
            recentActivity: {
                newDonors: recentDonors,
                newRequests: recentRequests,
            },
        });
    } catch (error: any) {
        console.error("Fetch analytics error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
