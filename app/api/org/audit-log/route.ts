import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

// GET: List audit logs for an organization
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");
        const action = searchParams.get("action");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const limit = parseInt(searchParams.get("limit") || "50");

        if (!orgSlug) {
            return NextResponse.json({ error: "orgSlug is required" }, { status: 400 });
        }

        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const orgSnap = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
        if (orgSnap.empty) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }
        const orgId = orgSnap.docs[0].id;

        let query = adminDb.collection(COLLECTIONS.AUDIT_LOGS).where("organization", "==", orgId);

        if (action) {
            query = query.where("action", "==", action);
        }

        if (startDate) {
            query = query.where("createdAt", ">=", new Date(startDate));
        }

        if (endDate) {
            query = query.where("createdAt", "<=", new Date(endDate));
        }

        const logsSnap = await query.orderBy("createdAt", "desc").limit(limit).get();
        
        const logs = await Promise.all(logsSnap.docs.map(async (doc) => {
            const data = doc.data();
            let performedBy = null;
            if (data.performedBy) {
                const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(data.performedBy).get();
                if (userDoc.exists) {
                    performedBy = { _id: userDoc.id, name: userDoc.data()?.name, email: userDoc.data()?.email, phone: userDoc.data()?.phone };
                }
            }
            return {
               _id: doc.id,
               ...data,
               performedBy
            };
        }));

        return NextResponse.json(logs);
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
    }
}
