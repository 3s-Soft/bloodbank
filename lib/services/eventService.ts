import { HttpError } from "@/lib/api/responses";
import { db } from "@/lib/db";
import { AuditAction, EventStatus } from "@/lib/db/enums";
import { auditLogsRepo, eventsRepo } from "@/lib/repositories/misc";
import type { EventRow } from "@/lib/types";
import type { EventCreateInput } from "@/lib/validation/schemas";

/** Event CRUD with audit entries. */

export async function createEvent(
    input: EventCreateInput,
    organizationId: number,
    performedById: number,
): Promise<EventRow> {
    const eventId = await db.transaction(async (tx) => {
        const id = await eventsRepo.create(
            {
                title: input.title,
                description: input.description || null,
                date: input.date,
                endDate: input.endDate ?? null,
                location: input.location || null,
                district: input.district || null,
                upazila: input.upazila || null,
                organizationId,
                createdById: performedById,
                maxParticipants: input.maxParticipants ?? null,
                contactNumber: input.contactNumber || null,
                status: EventStatus.UPCOMING,
            },
            tx,
        );

        await auditLogsRepo.record(
            {
                action: AuditAction.EVENT_CREATED,
                performedById,
                organizationId,
                targetType: "Event",
                targetId: id,
                details: `Created event: ${input.title}`,
            },
            tx,
        );

        return id;
    });

    const event = await eventsRepo.findById(eventId);
    if (!event) {
        throw new HttpError(500, "Event was created but could not be read back");
    }
    return event;
}

/** Loads an event and asserts it belongs to the caller's organization. */
async function requireOwnedEvent(eventId: number, organizationId: number): Promise<EventRow> {
    const event = await eventsRepo.findById(eventId);
    if (!event) {
        throw new HttpError(404, "Event not found");
    }
    if (event.organizationId !== organizationId) {
        throw new HttpError(403, "That event belongs to another organization");
    }
    return event;
}

export async function updateEvent(
    eventId: number,
    input: Partial<EventCreateInput> & { status?: EventRow["status"] },
    organizationId: number,
    performedById: number,
): Promise<EventRow> {
    await requireOwnedEvent(eventId, organizationId);

    const updates: Partial<EventRow> = {};
    if (input.title !== undefined) updates.title = input.title;
    if (input.description !== undefined) updates.description = input.description || null;
    if (input.date !== undefined) updates.date = input.date;
    if (input.endDate !== undefined) updates.endDate = input.endDate ?? null;
    if (input.location !== undefined) updates.location = input.location || null;
    if (input.district !== undefined) updates.district = input.district || null;
    if (input.upazila !== undefined) updates.upazila = input.upazila || null;
    if (input.maxParticipants !== undefined) updates.maxParticipants = input.maxParticipants ?? null;
    if (input.contactNumber !== undefined) updates.contactNumber = input.contactNumber || null;
    if (input.status !== undefined) updates.status = input.status;

    await db.transaction(async (tx) => {
        if (Object.keys(updates).length > 0) {
            await eventsRepo.update(eventId, updates, tx);
        }

        await auditLogsRepo.record(
            {
                action: AuditAction.EVENT_UPDATED,
                performedById,
                organizationId,
                targetType: "Event",
                targetId: eventId,
                details: `Updated event: ${input.title ?? eventId}`,
            },
            tx,
        );
    });

    const event = await eventsRepo.findById(eventId);
    if (!event) {
        throw new HttpError(404, "Event not found");
    }
    return event;
}

export async function deleteEvent(
    eventId: number,
    organizationId: number,
    performedById: number,
): Promise<void> {
    const event = await requireOwnedEvent(eventId, organizationId);

    await db.transaction(async (tx) => {
        await eventsRepo.remove(eventId, tx);
        await auditLogsRepo.record(
            {
                action: AuditAction.EVENT_DELETED,
                performedById,
                organizationId,
                targetType: "Event",
                targetId: eventId,
                details: `Deleted event: ${event.title}`,
            },
            tx,
        );
    });
}
