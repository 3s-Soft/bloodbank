import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const orgRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS).doc(id);
        const orgDoc = await orgRef.get();
        if (!orgDoc.exists) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }
        const organization = { _id: id, ...orgDoc.data() };

        const dSnap = await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("organization", "==", id).count().get();
        const rSnap = await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", id).count().get();
        const aSnap = await adminDb.collection(COLLECTIONS.BLOOD_REQUESTS).where("organization", "==", id).where("status", "==", "pending").count().get();

        return NextResponse.json({
            ...organization,
            stats: {
                donorCount: dSnap.data().count,
                requestCount: rSnap.data().count,
                activeRequests: aSnap.data().count
            }
        });
    } catch (error: unknown) {
        console.error("Fetch organization error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        const { name, slug, logo, primaryColor, contactEmail, contactPhone, address, isActive } = body;

        if (slug) {
            const snap = await adminDb.collection(COLLECTIONS.ORGANIZATIONS).where("slug", "==", slug.toLowerCase()).get();
            const exists = snap.docs.some(d => d.id !== id);
            if (exists) {
                return NextResponse.json({ error: "Organization with this slug already exists" }, { status: 400 });
            }
        }

        const orgRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS).doc(id);
        const upData: Record<string, unknown> = {
                name,
                slug: slug?.toLowerCase().trim(),
                logo,
                primaryColor,
                contactEmail,
                contactPhone,
                address,
                isActive,
                updatedAt: new Date()
        };
        // Clean undefined fields
        Object.keys(upData).forEach(key => upData[key] === undefined && delete upData[key]);

        await orgRef.update(upData);
        
        const freshSnap = await orgRef.get();

        return NextResponse.json({ message: "Organization updated successfully", organization: { _id: id, ...freshSnap.data() } });
    } catch (error: unknown) {
        console.error("Update organization error:", error);
        return NextResponse.json({ error: (error instanceof Error ? error.message : "Internal Server Error") }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const orgRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS).doc(id);
        const doc = await orgRef.get();

        if (!doc.exists) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }
        
        await orgRef.delete();

        return NextResponse.json({ message: "Organization deleted successfully" });
    } catch (error: unknown) {
        console.error("Delete organization error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
