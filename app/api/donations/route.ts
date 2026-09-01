import { created, ok, searchParams, withErrorHandling } from "@/lib/api/responses";
import { toDonationDto, toDonorSummaryDto } from "@/lib/api/serialize";
import { requireOrgAdmin, requireOrganization } from "@/lib/auth/guards";
import * as donorProfilesRepo from "@/lib/repositories/donorProfiles";
import { donationsRepo } from "@/lib/repositories/misc";
import { recordDonation } from "@/lib/services/donationService";
import { donationCreateSchema, donationQuerySchema } from "@/lib/validation/schemas";

/**
 * GET /api/donations — donation history.
 *
 * By donor (public: shown on a donor profile page) or by organization.
 */
export const GET = withErrorHandling(async (request: Request) => {
    const query = donationQuerySchema.parse(searchParams(request));

    if (query.donorId) {
        const donor = await donorProfilesRepo.findById(query.donorId);
        if (!donor) return ok([]);

        const rows = await donationsRepo.listByDonor(query.donorId);
        const summary = toDonorSummaryDto(donor.profile, donor.user);
        return ok(rows.map((row) => toDonationDto(row, summary)));
    }

    const organization = await requireOrganization(query.orgSlug as string);
    const rows = await donationsRepo.listByOrganization(organization.id);

    return ok(
        rows.map((row) =>
            toDonationDto(row.donation, toDonorSummaryDto(row.donor, { id: row.donor.userId, name: row.user, phone: null, email: null })),
        ),
    );
});

/** POST /api/donations — record a donation. Admin-only. */
export const POST = withErrorHandling(async (request: Request) => {
    const input = donationCreateSchema.parse(await request.json());
    const { user, organization } = await requireOrgAdmin(input.orgSlug);

    const donation = await recordDonation(
        {
            donorProfileId: input.donorProfileId,
            donationDate: input.donationDate,
            location: input.location,
            recipientName: input.recipientName,
            notes: input.notes,
        },
        organization.id,
        user.id,
    );

    return created(toDonationDto(donation));
});
