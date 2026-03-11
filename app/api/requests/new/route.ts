import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS, UrgencyLevel, RequestStatus } from "@/lib/firebase/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { sendPushNotifications, buildBloodRequestPayload } from "@/lib/pushNotifications";

export async function POST(req: Request) {
    try {
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
        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const orgSnapshot = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
        if (orgSnapshot.empty) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }
        const organizationId = orgSnapshot.docs[0].id;

        // Create the blood request
        const requestsRef = adminDb.collection(COLLECTIONS.BLOOD_REQUESTS);
        const requestData = {
            patientName,
            bloodGroup,
            location,
            district,
            upazila,
            urgency,
            requiredDate: new Date(requiredDate),
            contactNumber,
            additionalNotes: additionalNotes || null,
            status: RequestStatus.PENDING,
            requester: session?.user ? session.user.id : null,
            organization: organizationId,
            matchedDonors: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const docRef = await requestsRef.add(requestData);
        const newRequest = { _id: docRef.id, ...requestData };

        // Send push notifications for urgent and emergency requests (fire-and-forget)
        if (urgency === UrgencyLevel.URGENT || urgency === UrgencyLevel.EMERGENCY) {
            const payload = buildBloodRequestPayload(
                urgency as UrgencyLevel,
                bloodGroup,
                district,
                orgSlug,
                docRef.id
            );
            sendPushNotifications(organizationId, payload, { district, bloodGroup }).catch(
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
