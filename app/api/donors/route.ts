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

        // Prefer server-side ordering; if Firestore requires a composite index, fall back safely.
        let snapshot: FirebaseFirestore.QuerySnapshot;
        try {
            snapshot = await donorsRef.orderBy("createdAt", "desc").get();
        } catch (queryError) {
            console.error("Donor query with orderBy failed, falling back to unordered query:", queryError);
            snapshot = await donorsRef.get();
        }

        // Populate user manually
        const userIds = snapshot.docs
            .map(doc => doc.data().user)
            .filter((uid): uid is string => typeof uid === "string" && uid.trim().length > 0);
        const uniqueUserIds = [...new Set(userIds)];

        const usersFetch = await Promise.all(
            uniqueUserIds.map(uid => adminDb.collection(COLLECTIONS.USERS).doc(uid).get())
        );
        const userMap: Record<string, { _id: string; name?: string; phone?: string }> = {};
        usersFetch.forEach(uDoc => {
            if (uDoc.exists) {
                userMap[uDoc.id] = { _id: uDoc.id, name: uDoc.data()?.name, phone: uDoc.data()?.phone };
            }
        });

        let donors: Array<Record<string, unknown> & { _id: string; user: { _id?: string; name?: string; phone?: string } }> =
            snapshot.docs.map(doc => {
                const data = doc.data() as Record<string, unknown>;
                const userId = typeof data.user === "string" ? data.user : null;

                return {
                    _id: doc.id,
                    ...data,
                    user: userId ? (userMap[userId] || { _id: userId, name: "Unknown" }) : { name: "Unknown" }
                };
            });

        // Ensure deterministic newest-first ordering even when fallback query is used
        donors = donors.sort((a, b) => {
            const aCreatedAt = a["createdAt"];
            const bCreatedAt = b["createdAt"];
            const aTime = aCreatedAt ? new Date(String(aCreatedAt)).getTime() : 0;
            const bTime = bCreatedAt ? new Date(String(bCreatedAt)).getTime() : 0;
            return bTime - aTime;
        });

        if (district || upazila) {
            donors = donors.filter(d => {
                const districtValue = typeof d["district"] === "string" ? d["district"].toLowerCase() : "";
                const upazilaValue = typeof d["upazila"] === "string" ? d["upazila"].toLowerCase() : "";

                let match = true;
                if (district) match = match && districtValue.includes(district.toLowerCase());
                if (upazila) match = match && upazilaValue.includes(upazila.toLowerCase());
                return match;
            });
        }

        return NextResponse.json(donors);
    } catch (error: unknown) {
        console.error("Fetch donors error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
