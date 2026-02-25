import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { Organization } from "@/lib/models/Organization";
import { DonorProfile } from "@/lib/models/User";
import { BloodRequest } from "@/lib/models/BloodRequest";

// GET: Detect inactive organizations (no new donors or requests in 30 days)
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const daysThreshold = parseInt(searchParams.get("days") || "30");

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

        const organizations = await Organization.find({ isActive: true });

        const inactiveOrgs = [];

        for (const org of organizations) {
            // Check for recent donors
            const recentDonor = await DonorProfile.findOne({
                organization: org._id,
                createdAt: { $gte: cutoffDate },
            }).sort({ createdAt: -1 });

            // Check for recent requests
            const recentRequest = await BloodRequest.findOne({
                organization: org._id,
                createdAt: { $gte: cutoffDate },
            }).sort({ createdAt: -1 });

            if (!recentDonor && !recentRequest) {
                // Find last activity date
                const lastDonor = await DonorProfile.findOne({
                    organization: org._id,
                }).sort({ createdAt: -1 });

                const lastRequest = await BloodRequest.findOne({
                    organization: org._id,
                }).sort({ createdAt: -1 });

                const lastDonorDate = (lastDonor as any)?.createdAt || null;
                const lastRequestDate = lastRequest?.createdAt || null;

                let lastActivityDate: Date | null = null;
                if (lastDonorDate && lastRequestDate) {
                    lastActivityDate = lastDonorDate > lastRequestDate ? lastDonorDate : lastRequestDate;
                } else {
                    lastActivityDate = lastDonorDate || lastRequestDate;
                }

                const daysSinceActivity = lastActivityDate
                    ? Math.floor((Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                inactiveOrgs.push({
                    _id: org._id,
                    name: org.name,
                    slug: org.slug,
                    lastActivityDate,
                    daysSinceActivity,
                    totalDonors: await DonorProfile.countDocuments({ organization: org._id }),
                    totalRequests: await BloodRequest.countDocuments({ organization: org._id }),
                });
            }
        }

        return NextResponse.json({
            threshold: daysThreshold,
            totalInactive: inactiveOrgs.length,
            organizations: inactiveOrgs,
        });
    } catch (error) {
        console.error("Error detecting inactivity:", error);
        return NextResponse.json({ error: "Failed to detect inactive organizations" }, { status: 500 });
    }
}
