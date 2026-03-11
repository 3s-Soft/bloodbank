import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";
import { BLOOD_COMPATIBILITY } from "@/lib/gamification";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { requestId, bloodGroup, district, upazila, orgSlug } = body;

        if (!bloodGroup || !orgSlug) {
            return NextResponse.json(
                { error: "bloodGroup and orgSlug are required" },
                { status: 400 }
            );
        }

        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const orgSnapshot = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
        if (orgSnapshot.empty) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }
        const orgId = orgSnapshot.docs[0].id;

        const compatibleTypes = BLOOD_COMPATIBILITY[bloodGroup] || [bloodGroup];

        const donorsRef = adminDb.collection(COLLECTIONS.DONOR_PROFILES);
        const snapshot = await donorsRef
            .where("organization", "==", orgId)
            .where("bloodGroup", "in", compatibleTypes)
            .where("isAvailable", "==", true)
            .get();

        if (snapshot.empty) {
            return NextResponse.json({ bloodGroup, compatibleTypes, totalMatched: 0, donors: [] });
        }

        const userIds = snapshot.docs.map(doc => doc.data().user).filter(id => id);
        const uniqueUserIds = [...new Set(userIds)];
        
        const usersFetch = await Promise.all(uniqueUserIds.map(uid => adminDb.collection(COLLECTIONS.USERS).doc(uid).get()));
        const userMap: Record<string, any> = {};
        usersFetch.forEach(uDoc => {
            if(uDoc.exists) userMap[uDoc.id] = { _id: uDoc.id, name: uDoc.data()?.name, phone: uDoc.data()?.phone };
        });

        let matchedDonors = snapshot.docs.map(doc => {
             const data = doc.data();
             return {
                 _id: doc.id,
                 ...data,
                 user: data.user ? userMap[data.user] : null
             } as any;
        });

        const sorted = matchedDonors.sort((a, b) => {
            const aDistrict = a.district?.toLowerCase() === district?.toLowerCase() ? 1 : 0;
            const bDistrict = b.district?.toLowerCase() === district?.toLowerCase() ? 1 : 0;
            if (aDistrict !== bDistrict) return bDistrict - aDistrict;

            const aUpazila = a.upazila?.toLowerCase() === upazila?.toLowerCase() ? 1 : 0;
            const bUpazila = b.upazila?.toLowerCase() === upazila?.toLowerCase() ? 1 : 0;
            if (aUpazila !== bUpazila) return bUpazila - aUpazila;

            if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1;

            return (b.totalDonations || 0) - (a.totalDonations || 0);
        }).slice(0, 20);

        if (requestId) {
            const requestRef = adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).doc(requestId);
            await requestRef.update({
                matchedDonors: sorted.map((d) => d._id),
                updatedAt: new Date()
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
