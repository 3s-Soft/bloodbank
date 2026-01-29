import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { Organization } from "@/lib/models/Organization";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// PATCH - Verify or reject an organization (Super Admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== "super_admin") {
            return NextResponse.json({ error: "Unauthorized - Super Admin access required" }, { status: 403 });
        }

        const { id } = await params;
        await connectToDatabase();
        const body = await request.json();

        const { action } = body; // "verify" or "reject"

        if (!["verify", "reject"].includes(action)) {
            return NextResponse.json({ error: "Invalid action. Must be 'verify' or 'reject'" }, { status: 400 });
        }

        const organization = await Organization.findById(id);
        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        if (action === "verify") {
            organization.isVerified = true;
            await organization.save();
            return NextResponse.json({ message: "Organization verified successfully", organization });
        } else {
            // Reject = delete the organization
            await Organization.findByIdAndDelete(id);
            return NextResponse.json({ message: "Organization rejected and removed" });
        }
    } catch (error: any) {
        console.error("Error verifying organization:", error);
        return NextResponse.json({ error: error.message || "Failed to process request" }, { status: 500 });
    }
}
