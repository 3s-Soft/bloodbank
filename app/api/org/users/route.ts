import { created, ok, searchParams, withErrorHandling } from "@/lib/api/responses";
import { toUserDto } from "@/lib/api/serialize";
import { requireOrgAdmin } from "@/lib/auth/guards";
import * as usersRepo from "@/lib/repositories/users";
import { createOrgUser } from "@/lib/services/userService";
import { orgUserCreateSchema, orgUserQuerySchema } from "@/lib/validation/schemas";

/**
 * GET /api/org/users — organization members.
 *
 * Search runs in SQL across name, phone and email. Admin-only: this returns
 * contact details for every member.
 */
export const GET = withErrorHandling(async (request: Request) => {
    const query = orgUserQuerySchema.parse(searchParams(request));
    const { organization } = await requireOrgAdmin(query.orgSlug);

    // Stats stay organization-wide regardless of the active filters, matching
    // how the dashboard tiles are meant to read.
    const [members, stats] = await Promise.all([
        usersRepo.listByOrganization(organization.id, {
            role: query.role,
            search: query.search,
        }),
        usersRepo.countByRole(organization.id),
    ]);

    return ok({ users: members.map(toUserDto), stats });
});

/** POST /api/org/users — add a member. */
export const POST = withErrorHandling(async (request: Request) => {
    const input = orgUserCreateSchema.parse(await request.json());
    const { user, organization } = await requireOrgAdmin(input.orgSlug);

    const member = await createOrgUser(
        {
            name: input.name,
            phone: input.phone,
            email: input.email || null,
            password: input.password,
            role: input.role,
        },
        organization.id,
        user.id,
    );

    return created(toUserDto(member));
});
