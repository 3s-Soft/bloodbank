import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS, UserRole } from "@/lib/firebase/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized - Super Admin access required" }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();

        const { action } = body;

        if (!["verify", "reject"].includes(action)) {
            return NextResponse.json({ error: "Invalid action. Must be 'verify' or 'reject'" }, { status: 400 });
        }

        const orgRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS).doc(id);
        const orgDoc = await orgRef.get();
        if (!orgDoc.exists) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }
        const orgData = orgDoc.data();

        if (action === "verify") {
            await orgRef.update({
                 isVerified: true,
                 updatedAt: new Date()
            });

            if (orgData?.createdBy) {
                const userRef = adminDb.collection(COLLECTIONS.USERS).doc(orgData.createdBy);
                const uDoc = await userRef.get();
                if(uDoc.exists) {
                     await userRef.update({
                         role: UserRole.ADMIN,
                         organization: id,
                         updatedAt: new Date()
                     });
                }
            }

            return NextResponse.json({ message: "Organization verified successfully", organization: { _id: id, ...orgData, isVerified: true } });
        } else {
            await orgRef.delete();
            return NextResponse.json({ message: "Organization rejected and removed" });
        }
    } catch (error: unknown) {
        console.error("Error verifying organization:", error);
        return NextResponse.json({ error: (error instanceof Error ? error.message : "Failed to process request") }, { status: 500 });
    }
}
