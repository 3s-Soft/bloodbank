import * as organizationsRepo from "@/lib/repositories/organizations";
import type { OrganizationRow } from "@/lib/types";

/**
 * Resolves the `[orgSlug]` route segment to an organization.
 *
 * Kept as a standalone helper because server components (notably
 * `app/[orgSlug]/layout.tsx`) call it directly, outside the API layer.
 * Inactive organizations resolve to null so their pages 404.
 */
export async function getOrganizationBySlug(slug: string): Promise<OrganizationRow | null> {
    return organizationsRepo.findBySlug(slug);
}
