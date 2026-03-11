import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

export async function POST(req: Request) {
    try {
        const { donorId, isVerified } = await req.json();

        if (!donorId) {
            return NextResponse.json({ error: "Donor ID is required" }, { status: 400 });
        }

        const donorRef = adminDb.collection(COLLECTIONS.DONOR_PROFILES).doc(donorId);
        const doc = await donorRef.get();
        
        if (!doc.exists) {
            return NextResponse.json({ error: "Donor not found" }, { status: 404 });
        }
        
        await donorRef.update({ isVerified, updatedAt: new Date() });

        return NextResponse.json({ message: "Donor status updated", donor: { _id: donorId, ...doc.data(), isVerified } });
    } catch (error: unknown) {
        console.error("Donor verification error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
