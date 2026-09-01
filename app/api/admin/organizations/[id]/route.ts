import { ok, withErrorHandling } from "@/lib/api/responses";
import { toOrganizationDto } from "@/lib/api/serialize";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { HttpError } from "@/lib/api/responses";
import * as organizationsRepo from "@/lib/repositories/organizations";
import { deleteOrganization, updateOrganization } from "@/lib/services/organizationService";
import { idSchema, organizationUpdateSchema } from "@/lib/validation/schemas";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/admin/organizations/[id] */
export const GET = withErrorHandling(async (_request: Request, context: RouteContext) => {
    await requireSuperAdmin();
    const { id } = await context.params;

    const organization = await organizationsRepo.findById(idSchema.parse(id));
    if (!organization) throw new HttpError(404, "Organization not found");

    return ok(toOrganizationDto(organization));
});

/** PUT /api/admin/organizations/[id] */
export const PUT = withErrorHandling(async (request: Request, context: RouteContext) => {
    const admin = await requireSuperAdmin();
    const { id } = await context.params;
    const input = organizationUpdateSchema.parse(await request.json());

    const organization = await updateOrganization(idSchema.parse(id), input, admin.id);

    return ok(toOrganizationDto(organization));
});

/**
 * DELETE /api/admin/organizations/[id]
 *
 * Foreign keys cascade, so this also removes the organization's donors,
 * requests, events, donations and audit trail.
 */
export const DELETE = withErrorHandling(async (_request: Request, context: RouteContext) => {
    await requireSuperAdmin();
    const { id } = await context.params;
    const organizationId = idSchema.parse(id);

    await deleteOrganization(organizationId);

    return ok({ id: organizationId, deleted: true });
});
