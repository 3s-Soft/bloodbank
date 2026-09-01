import { created, ok, withErrorHandling } from "@/lib/api/responses";
import { toOrganizationDto } from "@/lib/api/serialize";
import { requireSuperAdmin } from "@/lib/auth/guards";
import * as organizationsRepo from "@/lib/repositories/organizations";
import { createOrganization } from "@/lib/services/organizationService";
import { organizationCreateSchema } from "@/lib/validation/schemas";

/** GET /api/admin/organizations — every organization, including inactive. */
export const GET = withErrorHandling(async () => {
    await requireSuperAdmin();
    const rows = await organizationsRepo.listAll();

    return ok(rows.map(toOrganizationDto));
});

/** POST /api/admin/organizations — create an organization directly. */
export const POST = withErrorHandling(async (request: Request) => {
    await requireSuperAdmin();
    const input = organizationCreateSchema.parse(await request.json());

    const organization = await createOrganization(input);

    return created(toOrganizationDto(organization));
});
