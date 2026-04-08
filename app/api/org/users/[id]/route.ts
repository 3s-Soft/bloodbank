import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

// GET - Get single user by ID
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(id).get();
        if (!userDoc.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        let organization = null;
        if (userDoc.data()?.organization) {
            const orgDoc = await adminDb.collection(COLLECTIONS.ORGANIZATIONS).doc(userDoc.data()!.organization).get();
            if (orgDoc.exists) organization = { _id: orgDoc.id, ...orgDoc.data() };
        }

        // Get donor profile if exists
        let donorProfile = null;
        const dpSnap = await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("user", "==", id).limit(1).get();
        if (!dpSnap.empty) {
            donorProfile = { _id: dpSnap.docs[0].id, ...dpSnap.docs[0].data() };
        }

        return NextResponse.json({
            _id: userDoc.id,
            ...userDoc.data(),
            organization,
            donorProfile,
        });
    } catch (error: unknown) {
        console.error("Fetch user error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PUT - Update user
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, phone, email, role } = body;

        // Check if phone is unique (excluding current user)
        if (phone) {
            const existingUserSnap = await adminDb.collection(COLLECTIONS.USERS).where("phone", "==", phone).limit(1).get();
            if (!existingUserSnap.empty && existingUserSnap.docs[0].id !== id) {
                return NextResponse.json({ error: "Phone number already in use" }, { status: 400 });
            }
        }
        
        const updateData: Record<string, unknown> = { name, phone, email, role, updatedAt: new Date() };
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const userRef = adminDb.collection(COLLECTIONS.USERS).doc(id);
        const userSnap = await userRef.get();
        if (!userSnap.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        
        await userRef.update(updateData);
        const updatedSnap = await userRef.get();

        return NextResponse.json({ message: "User updated successfully", user: { _id: updatedSnap.id, ...updatedSnap.data() } });
    } catch (error: unknown) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: (error instanceof Error ? error.message : "Internal Server Error") }, { status: 500 });
    }
}

// DELETE - Delete user
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const userRef = adminDb.collection(COLLECTIONS.USERS).doc(id);
        const userSnap = await userRef.get();
        if (!userSnap.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Delete associated donor profile first
        const dpSnap = await adminDb.collection(COLLECTIONS.DONOR_PROFILES).where("user", "==", id).get();
        const batch = adminDb.batch();
        dpSnap.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        await userRef.delete();

        return NextResponse.json({ message: "User deleted successfully" });
    } catch (error: unknown) {
        console.error("Delete user error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
