import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

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

        const donorCount = (await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("organization", "==", orgId).count().get()).data().count;
        const activeRequests = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", orgId).where("status", "==", "pending").count().get()).data().count;
        const completedRequests = (await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", orgId).where("status", "==", "fulfilled").count().get()).data().count;

        // 1. Dynamic Villages Count
        const donorsSnap = await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("organization", "==", orgId).select("village").get();
        const villages = new Set();
        donorsSnap.forEach(doc => {
            const v = doc.data().village;
            if (v) villages.add(v);
        });

        // 2. Lives Helped (Calculated from completed requests + donor impact)
        // This is still a heuristic but based on real data
        const livesHelped = completedRequests * 3 + Math.floor(donorCount / 2);

        return NextResponse.json({
            donorsCount: donorCount || 0,
            livesHelped: livesHelped || 0,
            activeRequests: activeRequests || 0,
            villagesCovered: villages.size || 0
        });
    } catch (error: unknown) {
        console.error("Fetch stats error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
