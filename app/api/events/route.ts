import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";

// Event statuses replicated statically
const EventStatus = { UPCOMING: "upcoming", ONGOING: "ongoing", COMPLETED: "completed", CANCELLED: "cancelled" };
const AuditAction = { EVENT_CREATED: "EVENT_CREATED", EVENT_UPDATED: "EVENT_UPDATED", EVENT_DELETED: "EVENT_DELETED" };

// GET: List events
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");
        const status = searchParams.get("status");
        const upcoming = searchParams.get("upcoming");

        if (!orgSlug) {
            return NextResponse.json({ error: "orgSlug is required" }, { status: 400 });
        }

        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const orgSnap = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
        if (orgSnap.empty) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }
        const orgId = orgSnap.docs[0].id;

        let query: any = adminDb.collection(COLLECTIONS.EVENTS).where("organization", "==", orgId);

        if (status) {
            query = query.where("status", "==", status);
        }

        if (upcoming === "true") {
            query = query.where("date", ">=", new Date());
            query = query.where("status", "in", [EventStatus.UPCOMING, EventStatus.ONGOING]);
        }

        const eventsSnap = await query.orderBy("date", upcoming === "true" ? "asc" : "desc").limit(50).get();
        const events = await Promise.all(eventsSnap.docs.map(async (doc: any) => {
             const data = doc.data();
             let createdBy = null;
             if (data.createdBy) {
                  const uDoc = await adminDb.collection(COLLECTIONS.USERS).doc(data.createdBy).get();
                  if (uDoc.exists) createdBy = { _id: uDoc.id, name: uDoc.data()?.name };
             }
             return { _id: doc.id, ...data, createdBy };
        }));

        return NextResponse.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

// POST: Create event
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, description, date, endDate, location, district, upazila, orgSlug, createdBy, maxParticipants, contactNumber } = body;

        if (!title || !description || !date || !location || !district || !orgSlug || !createdBy) {
            return NextResponse.json(
                { error: "title, description, date, location, district, orgSlug, and createdBy are required" },
                { status: 400 }
            );
        }

        const orgsRef = adminDb.collection(COLLECTIONS.ORGANIZATIONS);
        const orgSnap = await orgsRef.where("slug", "==", orgSlug).limit(1).get();
        if (orgSnap.empty) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }
        const orgId = orgSnap.docs[0].id;

        const eventData = {
            title,
            description,
            date: new Date(date),
            endDate: endDate ? new Date(endDate) : null,
            location,
            district,
            upazila,
            organization: orgId,
            createdBy,
            maxParticipants,
            contactNumber,
            status: EventStatus.UPCOMING,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        // Remove undefined fields
        Object.keys(eventData).forEach(key => (eventData as any)[key] === undefined && delete (eventData as any)[key]);
        const eventRef = await adminDb.collection(COLLECTIONS.EVENTS).add(eventData);

        // Audit log
        await adminDb.collection(COLLECTIONS.AUDIT_LOGS).add({
            action: AuditAction.EVENT_CREATED,
            performedBy: createdBy,
            organization: orgId,
            targetType: "Event",
            targetId: eventRef.id,
            details: `Created event: ${title}`,
            createdAt: new Date()
        });

        return NextResponse.json({ success: true, event: { _id: eventRef.id, ...eventData } });
    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}

// PUT: Update event
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { eventId, performedBy, ...updates } = body;

        if (!eventId) {
            return NextResponse.json({ error: "eventId is required" }, { status: 400 });
        }

        const objUpdates: any = { ...updates, updatedAt: new Date() };
        Object.keys(objUpdates).forEach(key => objUpdates[key] === undefined && delete objUpdates[key]);

        const eventRef = adminDb.collection(COLLECTIONS.EVENTS).doc(eventId);
        const eventSnap = await eventRef.get();
        
        if (!eventSnap.exists) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }
        
        await eventRef.update(objUpdates);
        const evtFresh = await eventRef.get();

        if (performedBy) {
            await adminDb.collection(COLLECTIONS.AUDIT_LOGS).add({
                action: AuditAction.EVENT_UPDATED,
                performedBy,
                organization: eventSnap.data()!.organization,
                targetType: "Event",
                targetId: eventId,
                details: `Updated event: ${eventSnap.data()!.title}`,
                createdAt: new Date()
            });
        }

        return NextResponse.json({ success: true, event: { _id: evtFresh.id, ...evtFresh.data() } });
    } catch (error) {
        console.error("Error updating event:", error);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

// DELETE: Delete event
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get("eventId");
        const performedBy = searchParams.get("performedBy");

        if (!eventId) {
            return NextResponse.json({ error: "eventId is required" }, { status: 400 });
        }

        const eventRef = adminDb.collection(COLLECTIONS.EVENTS).doc(eventId);
        const eventSnap = await eventRef.get();
        
        if (!eventSnap.exists) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }
        const eventData = eventSnap.data()!;
        
        await eventRef.delete();

        if (performedBy) {
            await adminDb.collection(COLLECTIONS.AUDIT_LOGS).add({
                action: AuditAction.EVENT_DELETED,
                performedBy,
                organization: eventData.organization,
                targetType: "Event",
                targetId: eventId,
                details: `Deleted event: ${eventData.title}`,
                createdAt: new Date()
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
