import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();

        const { token, orgSlug, district, bloodGroup } = body;

        if (!token) {
            return NextResponse.json({ error: "Invalid FCM token" }, { status: 400 });
        }

        if (!orgSlug) {
            return NextResponse.json({ error: "orgSlug is required" }, { status: 400 });
        }

        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const orgSnapshot = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
        if (orgSnapshot.empty) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        const subsRef = adminDb.collection(COLLECTIONS.PUSH_SUBSCRIPTIONS);
        const existingSub = await subsRef.where("token", "==", token).limit(1).get();

        const subData = {
            token,
            organization: orgSnapshot.docs[0].id,
            user: session?.user?.id || null,
            district: district || null,
            bloodGroup: bloodGroup || null,
            updatedAt: new Date()
        };

        if (existingSub.empty) {
            await subsRef.add({ ...subData, createdAt: new Date() });
        } else {
            await subsRef.doc(existingSub.docs[0].id).update(subData);
        }

        return NextResponse.json({ message: "Subscribed successfully" }, { status: 201 });
    } catch (error) {
        console.error("Push subscribe error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ error: "token is required" }, { status: 400 });
        }

        const subsRef = adminDb.collection(COLLECTIONS.PUSH_SUBSCRIPTIONS);
        const existingSub = await subsRef.where("token", "==", token).limit(1).get();
        if (!existingSub.empty) {
            await subsRef.doc(existingSub.docs[0].id).delete();
        }
        
        return NextResponse.json({ message: "Unsubscribed successfully" });
    } catch (error) {
        console.error("Push unsubscribe error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
