import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongodb";
import { BloodRequest, UrgencyLevel } from "@/lib/models/BloodRequest";
import { Organization } from "@/lib/models/Organization";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { sendPushNotifications, buildBloodRequestPayload } from "@/lib/pushNotifications";

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
            requester: session?.user ? session.user.id : undefined, // Optional if not logged in
            organization: organization._id,
        });

        // Send push notifications for urgent and emergency requests (fire-and-forget)
        if (urgency === UrgencyLevel.URGENT || urgency === UrgencyLevel.EMERGENCY) {
            const payload = buildBloodRequestPayload(
                urgency as UrgencyLevel,
                bloodGroup,
                district,
                orgSlug,
                String(newRequest._id)
            );
            sendPushNotifications(String(organization._id), payload, { district, bloodGroup }).catch(
                (err) => console.error("Push notification error:", err)
            );
        }

        return NextResponse.json({ message: "Request posted successfully", request: newRequest }, { status: 201 });
    } catch (error) {
        console.error("Blood request creation error:", error);
        const message = error instanceof Error ? error.message : "Internal Server Error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
