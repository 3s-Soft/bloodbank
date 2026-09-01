import { ok, searchParams, withErrorHandling } from "@/lib/api/responses";
import { toAuditLogDto } from "@/lib/api/serialize";
import { requireOrgAdmin } from "@/lib/auth/guards";
import { auditLogsRepo } from "@/lib/repositories/misc";
import { auditLogQuerySchema } from "@/lib/validation/schemas";

/** GET /api/org/audit-log — administrative history for an organization. */
export const GET = withErrorHandling(async (request: Request) => {
    const query = auditLogQuerySchema.parse(searchParams(request));
    const { organization } = await requireOrgAdmin(query.orgSlug);

    const logs = await auditLogsRepo.listByOrganization(organization.id, {
        action: query.action,
        limit: query.limit,
    });

    return ok(logs.map((row) => toAuditLogDto(row.log, row.performedBy)));
});
