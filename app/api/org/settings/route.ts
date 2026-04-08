import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

// GET - Get organization settings by slug
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

        return NextResponse.json({ _id: orgSnapshot.docs[0].id, ...orgSnapshot.docs[0].data() });
    } catch (error: unknown) {
        console.error("Fetch organization error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT - Update organization settings
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { orgSlug, name, slug, logo, primaryColor, contactEmail, contactPhone, address } = body;

        if (!orgSlug) {
            return NextResponse.json({ error: "Organization slug is required" }, { status: 400 });
        }

        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const currentOrgSnap = await orgsRef.where("slug", "==", orgSlug).limit(1).get();

        if (currentOrgSnap.empty) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        const orgId = currentOrgSnap.docs[0].id;
        const updateData: Record<string, unknown> = {
            name,
            logo,
            primaryColor,
            contactEmail,
            contactPhone,
            address,
            updatedAt: new Date()
        };

        // If slug is being updated
        if (slug && slug !== orgSlug) {
            const normalizedSlug = slug.toLowerCase().trim();
            // Check if new slug is already taken
            const existing = await orgsRef.where("slug", "==", normalizedSlug).limit(1).get();
            if (!existing.empty && existing.docs[0].id !== orgId) {
                return NextResponse.json({ error: "This URL slug is already taken" }, { status: 400 });
            }
            updateData.slug = normalizedSlug;
        }

        // Remove undefined fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        await orgsRef.doc(orgId).update(updateData);
        const freshSnap = await orgsRef.doc(orgId).get();

        return NextResponse.json({ message: "Organization updated successfully", organization: { _id: freshSnap.id, ...freshSnap.data() } });
    } catch (error: unknown) {
        console.error("Update organization error:", error);
        return NextResponse.json({ error: (error instanceof Error ? error.message : "Internal Server Error") }, { status: 500 });
    }
}
