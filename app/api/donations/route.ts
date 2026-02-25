import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { Donation } from "@/lib/models/Donation";
import { DonorProfile } from "@/lib/models/User";
import { Organization } from "@/lib/models/Organization";
import { calculateBadges, calculatePoints, POINTS } from "@/lib/gamification";
import { AuditLog, AuditAction } from "@/lib/models/AuditLog";

// GET: List donation history for a donor
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const donorId = searchParams.get("donorId");
        const orgSlug = searchParams.get("orgSlug");

        if (!donorId && !orgSlug) {
            return NextResponse.json({ error: "donorId or orgSlug required" }, { status: 400 });
        }

        const query: Record<string, unknown> = {};

        if (donorId) {
            query.donor = donorId;
        }

        if (orgSlug) {
            const org = await Organization.findOne({ slug: orgSlug });
            if (!org) {
                return NextResponse.json({ error: "Organization not found" }, { status: 404 });
            }
            query.organization = org._id;
        }

        const donations = await Donation.find(query)
            .populate({
                path: "donor",
                populate: { path: "user", select: "name phone" },
            })
            .sort({ donationDate: -1 })
            .limit(100);

        return NextResponse.json(donations);
    } catch (error) {
        console.error("Error fetching donations:", error);
        return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 });
    }
}

// POST: Record a new donation
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { donorProfileId, orgSlug, donationDate, location, recipientName, notes, performedBy } = body;

        if (!donorProfileId || !orgSlug || !donationDate) {
            return NextResponse.json(
                { error: "donorProfileId, orgSlug, and donationDate are required" },
                { status: 400 }
            );
        }

        const org = await Organization.findOne({ slug: orgSlug });
        if (!org) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        const donor = await DonorProfile.findById(donorProfileId);
        if (!donor) {
            return NextResponse.json({ error: "Donor not found" }, { status: 404 });
        }

        // Create donation record
        const donation = await Donation.create({
            donor: donorProfileId,
            organization: org._id,
            bloodGroup: donor.bloodGroup,
            donationDate: new Date(donationDate),
            location,
            recipientName,
            notes,
            pointsAwarded: POINTS.DONATION,
        });

        // Update donor profile
        const newTotalDonations = (donor.totalDonations || 0) + 1;
        const hasCompleteProfile = !!(donor.district && donor.upazila && donor.bloodGroup);
        const newBadges = calculateBadges(newTotalDonations, donor.isVerified);
        const newPoints = calculatePoints(newTotalDonations, donor.isVerified, donor.isAvailable, hasCompleteProfile);

        await DonorProfile.findByIdAndUpdate(donorProfileId, {
            totalDonations: newTotalDonations,
            points: newPoints,
            badges: newBadges,
            lastDonationDate: new Date(donationDate),
        });

        // Create audit log
        if (performedBy) {
            await AuditLog.create({
                action: AuditAction.DONATION_RECORDED,
                performedBy,
                organization: org._id,
                targetType: "DonorProfile",
                targetId: donorProfileId,
                details: `Recorded donation for donor on ${donationDate}`,
            });
        }

        return NextResponse.json({ success: true, donation, newBadges, newPoints });
    } catch (error) {
        console.error("Error recording donation:", error);
        return NextResponse.json({ error: "Failed to record donation" }, { status: 500 });
    }
}
