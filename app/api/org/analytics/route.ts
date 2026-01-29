import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { Organization } from "@/lib/models/Organization";
import { DonorProfile } from "@/lib/models/User";
import { BloodRequest } from "@/lib/models/BloodRequest";

// GET - Get detailed analytics for a specific organization (org admin view)
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

        const orgId = organization._id;

        // Organization-scoped stats
        const totalDonors = await DonorProfile.countDocuments({ organization: orgId });
        const verifiedDonors = await DonorProfile.countDocuments({ organization: orgId, isVerified: true });
        const unverifiedDonors = await DonorProfile.countDocuments({ organization: orgId, isVerified: false });
        const availableDonors = await DonorProfile.countDocuments({ organization: orgId, isAvailable: true });

        const totalRequests = await BloodRequest.countDocuments({ organization: orgId });
        const pendingRequests = await BloodRequest.countDocuments({ organization: orgId, status: "pending" });
        const fulfilledRequests = await BloodRequest.countDocuments({ organization: orgId, status: "fulfilled" });
        const canceledRequests = await BloodRequest.countDocuments({ organization: orgId, status: "canceled" });

        // Blood group distribution for this org
        const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
        const bloodGroupStats = await Promise.all(
            bloodGroups.map(async (group) => ({
                group,
                count: await DonorProfile.countDocuments({ organization: orgId, bloodGroup: group }),
            }))
        );

        // Urgency distribution for this org's pending requests
        const urgencyStats = {
            normal: await BloodRequest.countDocuments({ organization: orgId, status: "pending", urgency: "normal" }),
            urgent: await BloodRequest.countDocuments({ organization: orgId, status: "pending", urgency: "urgent" }),
            emergency: await BloodRequest.countDocuments({ organization: orgId, status: "pending", urgency: "emergency" }),
        };

        // District/Upazila distribution for this org
        const districtAggregation = await DonorProfile.aggregate([
            { $match: { organization: orgId } },
            { $group: { _id: "$district", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const upazilaAggregation = await DonorProfile.aggregate([
            { $match: { organization: orgId } },
            { $group: { _id: "$upazila", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Recent activity (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const recentDonors = await DonorProfile.countDocuments({
            organization: orgId,
            createdAt: { $gte: weekAgo }
        });
        const recentRequests = await BloodRequest.countDocuments({
            organization: orgId,
            createdAt: { $gte: weekAgo }
        });

        // Recent donors list
        const recentDonorsList = await DonorProfile.find({ organization: orgId })
            .populate("user", "name phone")
            .sort({ createdAt: -1 })
            .limit(5);

        // Recent requests list
        const recentRequestsList = await BloodRequest.find({ organization: orgId })
            .sort({ createdAt: -1 })
            .limit(5);

        return NextResponse.json({
            organization: {
                name: organization.name,
                slug: organization.slug,
                primaryColor: organization.primaryColor,
            },
            overview: {
                totalDonors,
                verifiedDonors,
                unverifiedDonors,
                availableDonors,
                totalRequests,
                pendingRequests,
                fulfilledRequests,
                canceledRequests,
                fulfillmentRate: totalRequests > 0 ? Math.round((fulfilledRequests / totalRequests) * 100) : 0,
                verificationRate: totalDonors > 0 ? Math.round((verifiedDonors / totalDonors) * 100) : 0,
            },
            bloodGroupStats,
            urgencyStats,
            districtStats: districtAggregation.map(d => ({ district: d._id, count: d.count })),
            upazilaStats: upazilaAggregation.map(u => ({ upazila: u._id, count: u.count })),
            recentActivity: {
                newDonors: recentDonors,
                newRequests: recentRequests,
            },
            recentDonors: recentDonorsList,
            recentRequests: recentRequestsList,
        });
    } catch (error: any) {
        console.error("Fetch org analytics error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
