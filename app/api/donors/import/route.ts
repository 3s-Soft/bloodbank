import { ok, withErrorHandling } from "@/lib/api/responses";
import { requireOrgAdmin } from "@/lib/auth/guards";
import { importDonors } from "@/lib/services/donorService";
import { donorImportSchema } from "@/lib/validation/schemas";

/** POST /api/donors/import — admin-only bulk donor import. */
export const POST = withErrorHandling(async (request: Request) => {
    const input = donorImportSchema.parse(await request.json());
    const { user, organization } = await requireOrgAdmin(input.orgSlug);

    const result = await importDonors(input.donors, organization.id, user.id);

    return ok(result);
});
