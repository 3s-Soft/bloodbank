import { getServerSession } from "next-auth";

import { HttpError } from "@/lib/api/responses";
import { authOptions } from "@/lib/authOptions";
import { UserRole } from "@/lib/db/enums";
import * as organizationsRepo from "@/lib/repositories/organizations";
import type { OrganizationRow } from "@/lib/types";

/**
 * Authorization for API routes.
 *
 * `proxy.ts` protects pages, not API routes, so before this module most
 * mutating endpoints — donor verification, request status changes, user
 * deletion, organization settings — could be called directly by anyone. These
 * guards close that gap.
 *
 * Each throws `HttpError`, which `withErrorHandling` converts to a response, so
 * a handler can call them as plain statements.
 */

export interface SessionUser {
    id: number;
    name?: string | null;
    email?: string | null;
    role: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    const id = Number(session.user.id);
    if (!Number.isInteger(id) || id <= 0) return null;

    return {
        id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role ?? UserRole.PATIENT,
    };
}

export async function requireSession(): Promise<SessionUser> {
    const user = await getSessionUser();
    if (!user) {
        throw new HttpError(401, "Authentication required");
    }
    return user;
}

export async function requireSuperAdmin(): Promise<SessionUser> {
    const user = await requireSession();
    if (user.role !== UserRole.SUPER_ADMIN) {
        throw new HttpError(403, "Super admin access required");
    }
    return user;
}

/** Resolves a slug to its organization, or throws 404. */
export async function requireOrganization(slug: string): Promise<OrganizationRow> {
    const organization = await organizationsRepo.findBySlug(slug);
    if (!organization) {
        throw new HttpError(404, "Organization not found");
    }
    return organization;
}

/**
 * Asserts the caller may administer the organization behind `orgSlug`.
 *
 * A super admin passes for any organization. An `admin` passes only for the
 * organization their own user record belongs to, which is what stops one
 * organization's admin from acting on another's data.
 */
export async function requireOrgAdmin(
    orgSlug: string,
): Promise<{ user: SessionUser; organization: OrganizationRow }> {
    const user = await requireSession();
    const organization = await requireOrganization(orgSlug);

    if (user.role === UserRole.SUPER_ADMIN) {
        return { user, organization };
    }

    if (user.role !== UserRole.ADMIN) {
        throw new HttpError(403, "Administrator access required");
    }

    const { findById } = await import("@/lib/repositories/users");
    const record = await findById(user.id);
    if (!record || record.organizationId !== organization.id) {
        throw new HttpError(403, "You do not administer this organization");
    }

    return { user, organization };
}

/**
 * For endpoints that are public but behave differently when signed in, such as
 * attributing a blood request to its author.
 */
export async function optionalSession(): Promise<SessionUser | null> {
    return getSessionUser();
}
