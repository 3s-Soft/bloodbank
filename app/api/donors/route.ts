import { ok, searchParams, withErrorHandling } from "@/lib/api/responses";
import { toDonorProfileDto } from "@/lib/api/serialize";
import { requireOrganization } from "@/lib/auth/guards";
import * as donorProfilesRepo from "@/lib/repositories/donorProfiles";
import { donorQuerySchema } from "@/lib/validation/schemas";

/**
 * GET /api/donors — public donor directory for an organization.
 *
 * Filtering happens in SQL; the Firestore version fetched the organization's
 * whole donor set and filtered district and upazila in memory.
 */
export const GET = withErrorHandling(async (request: Request) => {
    const query = donorQuerySchema.parse(searchParams(request));
    const organization = await requireOrganization(query.orgSlug);

    const donors = await donorProfilesRepo.listByOrganization(organization.id, {
        bloodGroup: query.bloodGroup,
        district: query.district,
        upazila: query.upazila,
        availableOnly: query.availableOnly,
        donorId: query.donorId,
    });

    return ok(donors.map((donor) => toDonorProfileDto(donor.profile, donor.user)));
});
