import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { DonorProfile } from "@/lib/models/User";
import { BloodRequest } from "@/lib/models/BloodRequest";
import { Organization } from "@/lib/models/Organization";
import { BLOOD_COMPATIBILITY } from "@/lib/gamification";

// POST: Find matching donors for a blood request
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { requestId, bloodGroup, district, upazila, orgSlug } = body;

        if (!bloodGroup || !orgSlug) {
            return NextResponse.json(
                { error: "bloodGroup and orgSlug are required" },
                { status: 400 }
            );
        }

        const org = await Organization.findOne({ slug: orgSlug });
        if (!org) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        // Get compatible blood types
        const compatibleTypes = BLOOD_COMPATIBILITY[bloodGroup] || [bloodGroup];

        // Build query for matching donors
        const query: Record<string, unknown> = {
            organization: org._id,
            bloodGroup: { $in: compatibleTypes },
            isAvailable: true,
        };

        // Prefer donors in same district/upazila
        const matchedDonors = await DonorProfile.find(query)
            .populate("user", "name phone")
            .sort({
                isVerified: -1,
                totalDonations: -1,
            })
            .limit(20);

        // Sort: same district first, then same upazila, then verified, then by donation count
        const sorted = matchedDonors.sort((a, b) => {
            // Same district gets priority
            const aDistrict = a.district?.toLowerCase() === district?.toLowerCase() ? 1 : 0;
            const bDistrict = b.district?.toLowerCase() === district?.toLowerCase() ? 1 : 0;
            if (aDistrict !== bDistrict) return bDistrict - aDistrict;

            // Same upazila gets priority
            const aUpazila = a.upazila?.toLowerCase() === upazila?.toLowerCase() ? 1 : 0;
            const bUpazila = b.upazila?.toLowerCase() === upazila?.toLowerCase() ? 1 : 0;
            if (aUpazila !== bUpazila) return bUpazila - aUpazila;

            // Verified donors get priority
            if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;

            // More donations = higher priority
            return (b.totalDonations || 0) - (a.totalDonations || 0);
        });

        // If requestId provided, save matched donor IDs to the request
        if (requestId) {
            await BloodRequest.findByIdAndUpdate(requestId, {
                matchedDonors: sorted.map((d) => d._id),
            });
        }

        return NextResponse.json({
            bloodGroup,
            compatibleTypes,
            totalMatched: sorted.length,
            donors: sorted,
        });
    } catch (error) {
        console.error("Error matching donors:", error);
        return NextResponse.json({ error: "Failed to match donors" }, { status: 500 });
    }
}
