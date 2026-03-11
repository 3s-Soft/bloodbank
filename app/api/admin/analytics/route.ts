import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

export async function GET() {
    try {
        // Overall stats
        const totalOrganizations = (await adminDb.collection(COLLECTIONS.ORGANIZATIONS).count().get()).data().count;
        const activeOrganizations = (await adminDb.collection(COLLECTIONS.ORGANIZATIONS).where("isActive", "==", true).count().get()).data().count;
        const totalDonors = (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).count().get()).data().count;
        const verifiedDonors = (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("isVerified", "==", true).count().get()).data().count;
        const availableDonors = (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("isAvailable", "==", true).count().get()).data().count;
        const totalUsers = (await adminDb.collection(COLLECTIONS.USERS).count().get()).data().count;
        const totalRequests = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).count().get()).data().count;
        const pendingRequests = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("status", "==", "pending").count().get()).data().count;
        const fulfilledRequests = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("status", "==", "fulfilled").count().get()).data().count;
        const canceledRequests = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("status", "==", "canceled").count().get()).data().count;

        // Blood group distribution (across all orgs)
        const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
        const bloodGroupStats = await Promise.all(
            bloodGroups.map(async (group) => ({
                group,
                count: (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("bloodGroup", "==", group).count().get()).data().count,
            }))
        );

        // Urgency distribution for pending requests
        const urgencyStats = {
            normal: (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("status", "==", "pending").where("urgency", "==", "normal").count().get()).data().count,
            urgent: (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("status", "==", "pending").where("urgency", "==", "urgent").count().get()).data().count,
            emergency: (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("status", "==", "pending").where("urgency", "==", "emergency").count().get()).data().count,
        };

        // Per-organization stats
        const orgsSnap = await adminDb.collection(COLLECTIONS.ORGANIZATIONS).get();
        const organizations = orgsSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() as any }));
        const orgStats = await Promise.all(
            organizations.map(async (org) => {
                const donorCount = (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("organization", "==", org._id).count().get()).data().count;
                const verifiedCount = (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("organization", "==", org._id).where("isVerified", "==", true).count().get()).data().count;
                const requestCount = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", org._id).count().get()).data().count;
                const pendingCount = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", org._id).where("status", "==", "pending").count().get()).data().count;
                const fulfilledCount = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", org._id).where("status", "==", "fulfilled").count().get()).data().count;

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
        // Firestore lacks aggregations, so we'll fetch all donors to do this grouped calculation in memory (not scalable, but works for MVP).
        const allDonorsSnap = await adminDb.collection(COLLECTIONS.DONOR_PROFILES).select("district").get();
        const districtCount: Record<string, number> = {};
        allDonorsSnap.forEach(doc => {
             const d = doc.data().district;
             if(d) districtCount[d] = (districtCount[d] || 0) + 1;
        });
        const districtAggregation = Object.entries(districtCount)
             .map(([district, count]) => ({ district, count }))
             .sort((a, b) => b.count - a.count)
             .slice(0, 10);

        // Recent activity (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const recentDonors = (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("createdAt", ">=", weekAgo).count().get()).data().count;
        const recentRequests = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("createdAt", ">=", weekAgo).count().get()).data().count;

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
            districtStats: districtAggregation,
            recentActivity: {
                newDonors: recentDonors,
                newRequests: recentRequests,
            },
        });
    } catch (error: unknown) {
        console.error("Fetch analytics error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
