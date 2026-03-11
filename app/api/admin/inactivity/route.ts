import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

// GET: Detect inactive organizations (no new donors or requests in X days)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const daysThreshold = parseInt(searchParams.get("days") || "30");

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

        const orgsSnap = await adminDb.collection(COLLECTIONS.ORGANIZATIONS).where("isActive", "==", true).get();
        const organizations = orgsSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() as any }));

        const inactiveOrgs = [];

        for (const org of organizations) {
            // Check for recent donors
            const recentDonorSnap = await adminDb.collection(COLLECTIONS.DONOR_PROFILES)
                .where("organization", "==", org._id)
                .where("createdAt", ">=", cutoffDate)
                .limit(1)
                .get();

            // Check for recent requests
            const recentRequestSnap = await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS)
                .where("organization", "==", org._id)
                .where("createdAt", ">=", cutoffDate)
                .limit(1)
                .get();

            if (recentDonorSnap.empty && recentRequestSnap.empty) {
                // Find last activity date
                const lastDonorSnap = await adminDb.collection(COLLECTIONS.DONOR_PROFILES)
                    .where("organization", "==", org._id)
                    .orderBy("createdAt", "desc")
                    .limit(1)
                    .get();

                const lastRequestSnap = await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS)
                    .where("organization", "==", org._id)
                    .orderBy("createdAt", "desc")
                    .limit(1)
                    .get();

                const lastDonorDate = lastDonorSnap.empty ? null : (lastDonorSnap.docs[0].data().createdAt?.toDate ? lastDonorSnap.docs[0].data().createdAt.toDate() : new Date(lastDonorSnap.docs[0].data().createdAt));
                const lastRequestDate = lastRequestSnap.empty ? null : (lastRequestSnap.docs[0].data().createdAt?.toDate ? lastRequestSnap.docs[0].data().createdAt.toDate() : new Date(lastRequestSnap.docs[0].data().createdAt));

                let lastActivityDate: Date | null = null;
                if (lastDonorDate && lastRequestDate) {
                    lastActivityDate = lastDonorDate > lastRequestDate ? lastDonorDate : lastRequestDate;
                } else {
                    lastActivityDate = lastDonorDate || lastRequestDate;
                }

                const daysSinceActivity = lastActivityDate
                    ? Math.floor((Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                const donorsCount = (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("organization", "==", org._id).count().get()).data().count;
                const requestsCount = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", org._id).count().get()).data().count;

                inactiveOrgs.push({
                    _id: org._id,
                    name: org.name,
                    slug: org.slug,
                    lastActivityDate,
                    daysSinceActivity,
                    totalDonors: donorsCount,
                    totalRequests: requestsCount,
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
