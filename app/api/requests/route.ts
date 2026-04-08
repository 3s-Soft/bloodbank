import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");
        const urgency = searchParams.get("urgency");
        const status = searchParams.get("status") || "pending";

        if (!orgSlug) {
            return NextResponse.json({ error: "Organization slug is required" }, { status: 400 });
        }

        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const orgSnapshot = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
        if (orgSnapshot.empty) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }
        const organizationId = orgSnapshot.docs[0].id;

        let requestsRef: FirebaseFirestore.Query = adminDb.collection(COLLECTIONS.BLOOD_REQUESTS)
            .where("organization", "==", organizationId)
            .where("status", "==", status);

        if (urgency) requestsRef = requestsRef.where("urgency", "==", urgency);

        const snapshot = await requestsRef.get();
        
        const userIds = snapshot.docs.map(doc => doc.data().requester).filter(id => id);
        const uniqueUserIds = [...new Set(userIds)];
        
        const usersFetch = await Promise.all(uniqueUserIds.map(uid => adminDb.collection(COLLECTIONS.USERS).doc(uid).get()));
        const userMap: Record<string, unknown> = {};
        usersFetch.forEach(uDoc => {
            if(uDoc.exists) userMap[uDoc.id] = { _id: uDoc.id, name: uDoc.data()?.name };
        });

        const requests = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                _id: doc.id,
                ...data,
                requester: data.requester ? userMap[data.requester] : null
            } as Record<string, unknown>;
        });

        // Sort in memory (urgency isn't numeric here, just defaulting to time desc)
        requests.sort((a, b) => {
             type CreatedAtType = { toMillis: () => number } | string | number | undefined;
const getTime = (createdAt: CreatedAtType): number => {
    if (createdAt && typeof createdAt === 'object' && typeof (createdAt as { toMillis?: () => number }).toMillis === 'function') {
        return (createdAt as { toMillis: () => number }).toMillis();
    }
    if (typeof createdAt === 'string' || typeof createdAt === 'number') {
        return new Date(createdAt).getTime();
    }
    return 0;
};
const timeA = getTime(a.createdAt as CreatedAtType);
const timeB = getTime(b.createdAt as CreatedAtType);
             return timeB - timeA;
        });

        return NextResponse.json(requests);
    } catch (error: unknown) {
        console.error("Fetch requests error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
