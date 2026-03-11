import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");
        const bloodGroup = searchParams.get("bloodGroup");
        const district = searchParams.get("district");
        const upazila = searchParams.get("upazila");

        if (!orgSlug) {
            return NextResponse.json({ error: "Organization slug is required" }, { status: 400 });
        }

        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const orgSnapshot = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
        if (orgSnapshot.empty) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }
        const organizationId = orgSnapshot.docs[0].id;

        let donorsRef: FirebaseFirestore.Query = adminDb.collection(COLLECTIONS.DONOR_PROFILES)
            .where("organization", "==", organizationId);

        if (bloodGroup) donorsRef = donorsRef.where("bloodGroup", "==", bloodGroup);
        // Firestore doesn't support case-insensitive regex natively.
        // We will fetch and filter in memory if district or upazila is provided
        const snapshot = await donorsRef.orderBy("createdAt", "desc").get();
        
        // Populate user manually
        const userIds = snapshot.docs.map(doc => doc.data().user);
        const uniqueUserIds = [...new Set(userIds)];
        
        const usersFetch = await Promise.all(uniqueUserIds.map(uid => adminDb.collection(COLLECTIONS.USERS).doc(uid).get()));
        const userMap: Record<string, any> = {};
        usersFetch.forEach(uDoc => {
            if(uDoc.exists) userMap[uDoc.id] = { _id: uDoc.id, name: uDoc.data()?.name, phone: uDoc.data()?.phone };
        });

        let donors = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                _id: doc.id,
                ...data,
                user: userMap[data.user] || { name: "Unknown" }
            } as any;
        });

        if (district || upazila) {
            donors = donors.filter(d => {
                let match = true;
                if(district) match = match && d.district?.toLowerCase().includes(district.toLowerCase());
                if(upazila) match = match && d.upazila?.toLowerCase().includes(upazila.toLowerCase());
                return match;
            });
        }

        return NextResponse.json(donors);
    } catch (error: unknown) {
        console.error("Fetch donors error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
