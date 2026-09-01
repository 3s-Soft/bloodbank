import { ok, withErrorHandling } from "@/lib/api/responses";
import { toOrganizationDto } from "@/lib/api/serialize";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { setVerified } from "@/lib/services/organizationService";
import { idSchema } from "@/lib/validation/schemas";

type RouteContext = { params: Promise<{ id: string }> };

/** POST /api/admin/organizations/[id]/verify — approve or revoke verification. */
export const POST = withErrorHandling(async (request: Request, context: RouteContext) => {
    await requireSuperAdmin();
    const { id } = await context.params;

    const body = (await request.json().catch(() => ({}))) as { isVerified?: boolean };
    const isVerified = body.isVerified ?? true;

    const organization = await setVerified(idSchema.parse(id), isVerified);

    return ok(toOrganizationDto(organization));
});
