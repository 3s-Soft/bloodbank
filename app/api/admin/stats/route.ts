import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

export async function GET() {
    try {
        const totalOrganizations = (await adminDb.collection(COLLECTIONS.ORGANIZATIONS).count().get()).data().count;
        const activeOrganizations = (await adminDb.collection(COLLECTIONS.ORGANIZATIONS).where("isActive", "==", true).count().get()).data().count;
        const totalDonors = (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).count().get()).data().count;
        const totalUsers = (await adminDb.collection(COLLECTIONS.USERS).count().get()).data().count;
        const totalRequests = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).count().get()).data().count;
        const pendingRequests = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("status", "==", "pending").count().get()).data().count;
        const fulfilledRequests = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("status", "==", "fulfilled").count().get()).data().count;

        // Get recent organizations
        const recentOrgsSnap = await adminDb.collection(COLLECTIONS.ORGANIZATIONS)
            .orderBy("createdAt", "desc")
            .limit(5)
            .get();
        const recentOrganizations = recentOrgsSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

        // Get organization stats with donor/request counts
        const orgsSnap = await adminDb.collection(COLLECTIONS.ORGANIZATIONS).get();
        const organizations = orgsSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
        const orgStats = await Promise.all(
            organizations.map(async (org) => {
                const donorCount = (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("organization", "==", org._id).count().get()).data().count;
                const requestCount = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", org._id).count().get()).data().count;
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
    } catch (error: unknown) {
        console.error("Fetch admin stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
