import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

// GET - Get detailed analytics for a specific organization (org admin view)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");

        if (!orgSlug) {
            return NextResponse.json({ error: "Organization slug is required" }, { status: 400 });
        }

        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const orgSnapshot = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
        if (orgSnapshot.empty) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        const orgId = orgSnapshot.docs[0].id;
        const organization = orgSnapshot.docs[0].data();

        // Organization-scoped stats
        const totalDonors = (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("organization", "==", orgId).count().get()).data().count;
        const verifiedDonors = (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("organization", "==", orgId).where("isVerified", "==", true).count().get()).data().count;
        const unverifiedDonors = (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("organization", "==", orgId).where("isVerified", "==", false).count().get()).data().count;
        const availableDonors = (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("organization", "==", orgId).where("isAvailable", "==", true).count().get()).data().count;

        const totalRequests = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", orgId).count().get()).data().count;
        const pendingRequests = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", orgId).where("status", "==", "pending").count().get()).data().count;
        const fulfilledRequests = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", orgId).where("status", "==", "fulfilled").count().get()).data().count;
        const canceledRequests = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", orgId).where("status", "==", "canceled").count().get()).data().count;

        // Blood group distribution for this org
        const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
        const bloodGroupStats = await Promise.all(
            bloodGroups.map(async (group) => ({
                group,
                count: (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("organization", "==", orgId).where("bloodGroup", "==", group).count().get()).data().count,
            }))
        );

        // Urgency distribution for this org's pending requests
        const urgencyStats = {
            normal: (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", orgId).where("status", "==", "pending").where("urgency", "==", "normal").count().get()).data().count,
            urgent: (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", orgId).where("status", "==", "pending").where("urgency", "==", "urgent").count().get()).data().count,
            emergency: (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", orgId).where("status", "==", "pending").where("urgency", "==", "emergency").count().get()).data().count,
        };

        // District/Upazila distribution for this org
        const allOrgDonorsSnap = await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("organization", "==", orgId).select("district", "upazila").get();
        const distMap: Record<string, number> = {};
        const upMap: Record<string, number> = {};
        allOrgDonorsSnap.forEach(doc => {
             const { district, upazila } = doc.data();
             if(district) distMap[district] = (distMap[district] || 0) + 1;
             if(upazila) upMap[upazila] = (upMap[upazila] || 0) + 1;
        });

        const districtAggregation = Object.entries(distMap).map(([k, count]) => ({ district: k, count })).sort((a,b) => b.count - a.count).slice(0, 5);
        const upazilaAggregation = Object.entries(upMap).map(([k, count]) => ({ upazila: k, count })).sort((a,b) => b.count - a.count).slice(0, 5);

        // Recent activity (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const recentDonors = (await adminDb.collection(COLLECTIONS.DONOR_PROFILES)
            .where("organization", "==", orgId)
            .where("createdAt", ">=", weekAgo).count().get()).data().count;
            
        const recentRequests = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS)
            .where("organization", "==", orgId)
            .where("createdAt", ">=", weekAgo).count().get()).data().count;

        // Recent donors list
        const recentDonorsSnap = await adminDb.collection(COLLECTIONS.DONOR_PROFILES)
            .where("organization", "==", orgId)
            .orderBy("createdAt", "desc")
            .limit(5)
            .get();
        
        const recentDonorsList = await Promise.all(recentDonorsSnap.docs.map(async doc => {
            const data = doc.data();
            let userObj: { name: string; phone?: string } = { name: "Unknown" };
            if (data.user) {
                const uDoc = await adminDb.collection(COLLECTIONS.USERS).doc(data.user).get();
                if (uDoc.exists) userObj = { name: uDoc.data()?.name, phone: uDoc.data()?.phone };
            }
            return { _id: doc.id, ...data, user: userObj };
        }));

        // Recent requests list
        const recentRequestsSnap = await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS)
            .where("organization", "==", orgId)
            .orderBy("createdAt", "desc")
            .limit(5)
            .get();
        const recentRequestsList = recentRequestsSnap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));

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
            districtStats: districtAggregation,
            upazilaStats: upazilaAggregation,
            recentActivity: {
                newDonors: recentDonors,
                newRequests: recentRequests,
            },
            recentDonors: recentDonorsList,
            recentRequests: recentRequestsList,
        });
    } catch (error: unknown) {
        console.error("Fetch org analytics error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
