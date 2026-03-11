import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

export async function POST(req: Request) {
    try {
        const { requestId, status } = await req.json();

        if (!requestId || !status) {
            return NextResponse.json({ error: "Request ID and Status are required" }, { status: 400 });
        }

        const requestRef = adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).doc(requestId);
        const doc = await requestRef.get();
        if(!doc.exists) {
            return NextResponse.json({ error: "Blood request not found" }, { status: 404 });
        }

        await requestRef.update({ status, updatedAt: new Date() });

        return NextResponse.json({ message: "Request status updated", request: { _id: requestId, ...doc.data(), status } });
    } catch (error: unknown) {
        console.error("Request status update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
