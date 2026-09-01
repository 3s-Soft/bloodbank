import { ok, searchParams, withErrorHandling } from "@/lib/api/responses";
import { toUserDto } from "@/lib/api/serialize";
import { requireOrgAdmin } from "@/lib/auth/guards";
import { deleteOrgUser, updateOrgUser } from "@/lib/services/userService";
import { idSchema, orgSlugQuerySchema, orgUserUpdateSchema } from "@/lib/validation/schemas";

type RouteContext = { params: Promise<{ id: string }> };

/** PUT /api/org/users/[id] — update a member's details or role. */
export const PUT = withErrorHandling(async (request: Request, context: RouteContext) => {
    const { id } = await context.params;
    const userId = idSchema.parse(id);
    const input = orgUserUpdateSchema.parse(await request.json());
    const { user, organization } = await requireOrgAdmin(input.orgSlug);

    const updated = await updateOrgUser(
        userId,
        {
            name: input.name,
            phone: input.phone,
            email: input.email,
            role: input.role,
        },
        organization.id,
        user.id,
    );

    return ok(toUserDto(updated));
});

/**
 * DELETE /api/org/users/[id] — remove a member.
 *
 * Previously unauthenticated, so any caller could delete any user by id.
 */
export const DELETE = withErrorHandling(async (request: Request, context: RouteContext) => {
    const { id } = await context.params;
    const userId = idSchema.parse(id);
    const query = orgSlugQuerySchema.parse(searchParams(request));
    const { user, organization } = await requireOrgAdmin(query.orgSlug);

    await deleteOrgUser(userId, organization.id, user.id);

    return ok({ id: userId, deleted: true });
});
