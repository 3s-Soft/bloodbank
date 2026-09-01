import { created, ok, searchParams, withErrorHandling } from "@/lib/api/responses";
import { toEventDto } from "@/lib/api/serialize";
import { requireOrgAdmin, requireOrganization } from "@/lib/auth/guards";
import { eventsRepo } from "@/lib/repositories/misc";
import { createEvent, deleteEvent, updateEvent } from "@/lib/services/eventService";
import {
    eventCreateSchema,
    eventQuerySchema,
    eventUpdateSchema,
    idSchema,
    orgSlugQuerySchema,
} from "@/lib/validation/schemas";

/** GET /api/events — public event listing for an organization. */
export const GET = withErrorHandling(async (request: Request) => {
    const query = eventQuerySchema.parse(searchParams(request));
    const organization = await requireOrganization(query.orgSlug);

    const events = await eventsRepo.listByOrganization(organization.id, {
        status: query.status,
        upcomingOnly: query.upcomingOnly,
    });

    return ok(events.map(toEventDto));
});

/** POST /api/events — create an event. Admin-only. */
export const POST = withErrorHandling(async (request: Request) => {
    const input = eventCreateSchema.parse(await request.json());
    const { user, organization } = await requireOrgAdmin(input.orgSlug);

    const event = await createEvent(input, organization.id, user.id);

    return created(toEventDto(event));
});

/**
 * PUT /api/events — update an event.
 *
 * `performedBy` is taken from the session; it used to arrive in the request
 * body, which let a caller attribute the change to anyone.
 */
export const PUT = withErrorHandling(async (request: Request) => {
    const input = eventUpdateSchema.parse(await request.json());
    const { user, organization } = await requireOrgAdmin(input.orgSlug);

    const event = await updateEvent(input.eventId, input, organization.id, user.id);

    return ok(toEventDto(event));
});

/** DELETE /api/events?eventId=&orgSlug= — remove an event. Admin-only. */
export const DELETE = withErrorHandling(async (request: Request) => {
    const params = searchParams(request);
    const eventId = idSchema.parse(params.eventId);
    const { orgSlug } = orgSlugQuerySchema.parse(params);
    const { user, organization } = await requireOrgAdmin(orgSlug);

    await deleteEvent(eventId, organization.id, user.id);

    return ok({ id: eventId, deleted: true });
});
