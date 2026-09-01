import { cache } from "react";

import * as organizationsRepo from "@/lib/repositories/organizations";
import type { OrganizationRow } from "@/lib/types";

/**
 * Resolves the `[orgSlug]` route segment to an organization.
 *
 * Kept as a standalone helper because server components (notably
 * `app/[orgSlug]/layout.tsx`) call it directly, outside the API layer.
 * Inactive organizations resolve to null so their pages 404.
 *
 * Wrapped in React's `cache` so `generateMetadata` and the layout body — which
 * both need the organization and run in the same render pass — cost one query
 * rather than two. On a pool that holds a single connection to shared hosting,
 * halving the per-page query count is not a micro-optimisation.
 */
export const getOrganizationBySlug = cache(
    async (slug: string): Promise<OrganizationRow | null> => {
        return organizationsRepo.findBySlug(slug);
    },
);
