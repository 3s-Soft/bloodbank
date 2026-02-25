import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { Event, EventStatus } from "@/lib/models/Event";
import { Organization } from "@/lib/models/Organization";
import { AuditLog, AuditAction } from "@/lib/models/AuditLog";

// GET: List events
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const orgSlug = searchParams.get("orgSlug");
        const status = searchParams.get("status");
        const upcoming = searchParams.get("upcoming");

        if (!orgSlug) {
            return NextResponse.json({ error: "orgSlug is required" }, { status: 400 });
        }

        const org = await Organization.findOne({ slug: orgSlug });
        if (!org) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        const query: Record<string, unknown> = { organization: org._id };

        if (status) {
            query.status = status;
        }

        if (upcoming === "true") {
            query.date = { $gte: new Date() };
            query.status = { $in: [EventStatus.UPCOMING, EventStatus.ONGOING] };
        }

        const events = await Event.find(query)
            .populate("createdBy", "name")
            .sort({ date: upcoming === "true" ? 1 : -1 })
            .limit(50);

        return NextResponse.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}

// POST: Create event
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { title, description, date, endDate, location, district, upazila, orgSlug, createdBy, maxParticipants, contactNumber } = body;

        if (!title || !description || !date || !location || !district || !orgSlug || !createdBy) {
            return NextResponse.json(
                { error: "title, description, date, location, district, orgSlug, and createdBy are required" },
                { status: 400 }
            );
        }

        const org = await Organization.findOne({ slug: orgSlug });
        if (!org) {
            return NextResponse.json({ error: "Organization not found" }, { status: 404 });
        }

        const event = await Event.create({
            title,
            description,
            date: new Date(date),
            endDate: endDate ? new Date(endDate) : undefined,
            location,
            district,
            upazila,
            organization: org._id,
            createdBy,
            maxParticipants,
            contactNumber,
        });

        // Audit log
        await AuditLog.create({
            action: AuditAction.EVENT_CREATED,
            performedBy: createdBy,
            organization: org._id,
            targetType: "Event",
            targetId: event._id,
            details: `Created event: ${title}`,
        });

        return NextResponse.json({ success: true, event });
    } catch (error) {
        console.error("Error creating event:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}

// PUT: Update event
export async function PUT(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { eventId, performedBy, ...updates } = body;

        if (!eventId) {
            return NextResponse.json({ error: "eventId is required" }, { status: 400 });
        }

        const event = await Event.findByIdAndUpdate(eventId, updates, { new: true });
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        if (performedBy) {
            await AuditLog.create({
                action: AuditAction.EVENT_UPDATED,
                performedBy,
                organization: event.organization,
                targetType: "Event",
                targetId: event._id,
                details: `Updated event: ${event.title}`,
            });
        }

        return NextResponse.json({ success: true, event });
    } catch (error) {
        console.error("Error updating event:", error);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

// DELETE: Delete event
export async function DELETE(req: NextRequest) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const eventId = searchParams.get("eventId");
        const performedBy = searchParams.get("performedBy");

        if (!eventId) {
            return NextResponse.json({ error: "eventId is required" }, { status: 400 });
        }

        const event = await Event.findByIdAndDelete(eventId);
        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        if (performedBy) {
            await AuditLog.create({
                action: AuditAction.EVENT_DELETED,
                performedBy,
                organization: event.organization,
                targetType: "Event",
                targetId: event._id,
                details: `Deleted event: ${event.title}`,
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
