import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { BloodRequest } from "@/lib/models/BloodRequest";
import { Organization } from "@/lib/models/Organization";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
    try {
        await connectDB();
        const session = await getServerSession(authOptions);
        const body = await req.json();

        const {
            patientName,
            bloodGroup,
            location,
            district,
            upazila,
            urgency,
            requiredDate,
            contactNumber,
            additionalNotes,
            orgSlug
        } = body;

        // Find organization
        const organization = await Organization.findOne({ slug: orgSlug });
        if (!organization) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        // Create the blood request
        const newRequest = await BloodRequest.create({
            patientName,
            bloodGroup,
            location,
            district,
            upazila,
            urgency,
            requiredDate: new Date(requiredDate),
            contactNumber,
            additionalNotes,
            requester: session?.user ? (session.user as any).id : undefined, // Optional if not logged in
            organization: organization._id,
        });

        return NextResponse.json({ message: "Request posted successfully", request: newRequest }, { status: 201 });
    } catch (error: any) {
        console.error("Blood request creation error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
