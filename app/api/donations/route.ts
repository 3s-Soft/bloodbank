import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";
import { calculateBadges, calculatePoints, POINTS } from "@/lib/gamification";

// Audit action types (copied statically for now since mongoose model is being retired)
const AuditAction = { DONATION_RECORDED: "DONATION_RECORDED" };

// GET: List donation history for a donor
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const donorId = searchParams.get("donorId");
        const orgSlug = searchParams.get("orgSlug");

        if (!donorId && !orgSlug) {
            return NextResponse.json({ error: "donorId or orgSlug required" }, { status: 400 });
        }

        let query: FirebaseFirestore.Query = adminDb.collection(COLLECTIONS.DONATIONS);

        if (donorId) {
            query = query.where("donor", "==", donorId);
        }

        if (orgSlug) {
            const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
            const orgSnap = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
            if (orgSnap.empty) {
                return NextResponse.json({ error: "Organization not found" }, { status: 404 });
            }
            query = query.where("organization", "==", orgSnap.docs[0].id);
        }

        const donationsSnap = await query.orderBy("donationDate", "desc").limit(100).get();
        // Resolve nested donor + user lookups
        const donations = await Promise.all(donationsSnap.docs.map(async (doc) => {
            const data = doc.data();
            let donorObj = null;
            if (data.donor) {
                 const dDoc = await adminDb.collection(COLLECTIONS.DONOR_PROFILES).doc(data.donor).get();
                 if (dDoc.exists) {
                      donorObj = { _id: dDoc.id, ...(dDoc.data() as { user?: string }) };
                      if (donorObj.user) {
                           const uDoc = await adminDb.collection(COLLECTIONS.USERS).doc(donorObj.user).get();
                           if (uDoc.exists) donorObj.user = { _id: uDoc.id, name: uDoc.data()?.name, phone: uDoc.data()?.phone } as unknown as string;
                      }
                 }
            }
            return { _id: doc.id, ...data, donor: donorObj };
        }));

        return NextResponse.json(donations);
    } catch (error) {
        console.error("Error fetching donations:", error);
        return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 });
    }
}

// POST: Record a new donation
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { donorProfileId, orgSlug, donationDate, location, recipientName, notes, performedBy } = body;

        if (!donorProfileId || !orgSlug || !donationDate) {
            return NextResponse.json(
                { error: "donorProfileId, orgSlug, and donationDate are required" },
                { status: 400 }
            );
        }

        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const orgSnap = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
        if (orgSnap.empty) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }
        const orgId = orgSnap.docs[0].id;

        const donorRef = adminDb.collection(COLLECTIONS.DONOR_PROFILES).doc(donorProfileId);
        const donorSnap = await donorRef.get();
        if (!donorSnap.exists) {
            return NextResponse.json({ error: "Donor not found" }, { status: 404 });
        }
        const donor = donorSnap.data()!;

        // Create donation record
        const donationData = {
            donor: donorProfileId,
            organization: orgId,
            bloodGroup: donor.bloodGroup,
            donationDate: new Date(donationDate),
            location,
            recipientName,
            notes,
            pointsAwarded: POINTS.DONATION,
            createdAt: new Date()
        };
        const donationRef = await adminDb.collection(COLLECTIONS.DONATIONS).add(donationData);

        // Update donor profile
        const newTotalDonations = (donor.totalDonations || 0) + 1;
        const hasCompleteProfile = !!(donor.district && donor.upazila && donor.bloodGroup);
        const newBadges = calculateBadges(newTotalDonations, donor.isVerified);
        const newPoints = calculatePoints(newTotalDonations, donor.isVerified, donor.isAvailable, hasCompleteProfile);

        await donorRef.update({
            totalDonations: newTotalDonations,
            points: newPoints,
            badges: newBadges,
            lastDonationDate: new Date(donationDate),
            updatedAt: new Date()
        });

        // Create audit log
        if (performedBy) {
            await adminDb.collection(COLLECTIONS.AUDIT_LOGS).add({
                action: AuditAction.DONATION_RECORDED,
                performedBy,
                organization: orgId,
                targetType: "DonorProfile",
                targetId: donorProfileId,
                details: `Recorded donation for donor on ${donationDate}`,
                createdAt: new Date()
            });
        }

        return NextResponse.json({ success: true, donation: { _id: donationRef.id, ...donationData }, newBadges, newPoints });
    } catch (error) {
        console.error("Error recording donation:", error);
        return NextResponse.json({ error: "Failed to record donation" }, { status: 500 });
    }
}
