import { HttpError } from "@/lib/api/responses";
import { db } from "@/lib/db";
import { AuditAction } from "@/lib/db/enums";
import { auditLogsRepo } from "@/lib/repositories/misc";
import * as organizationsRepo from "@/lib/repositories/organizations";
import type { OrganizationRow } from "@/lib/types";
import type { OrganizationCreateInput } from "@/lib/validation/schemas";

/** Organization creation and settings changes, with their audit entries. */

export async function createOrganization(
    input: OrganizationCreateInput,
): Promise<OrganizationRow> {
    if (await organizationsRepo.slugExists(input.slug)) {
        throw new HttpError(409, "An organization with this URL slug already exists");
    }

    const id = await organizationsRepo.create({
        name: input.name,
        slug: input.slug,
        logo: input.logo || null,
        primaryColor: input.primaryColor,
        contactEmail: input.contactEmail || null,
        contactPhone: input.contactPhone || null,
        address: input.address || null,
        isActive: true,
        isVerified: false,
    });

    const organization = await organizationsRepo.findById(id);
    if (!organization) {
        throw new HttpError(500, "Organization was created but could not be read back");
    }
    return organization;
}

export async function updateOrganization(
    organizationId: number,
    input: Partial<OrganizationCreateInput> & { isActive?: boolean },
    performedById?: number,
): Promise<OrganizationRow> {
    if (input.slug && (await organizationsRepo.slugExists(input.slug, organizationId))) {
        throw new HttpError(409, "This URL slug is already taken");
    }

    // Only apply keys that were actually supplied: a partial settings form must
    // not blank out fields it did not include.
    const updates: Partial<OrganizationRow> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.slug !== undefined) updates.slug = input.slug;
    if (input.logo !== undefined) updates.logo = input.logo || null;
    if (input.primaryColor !== undefined) updates.primaryColor = input.primaryColor;
    if (input.contactEmail !== undefined) updates.contactEmail = input.contactEmail || null;
    if (input.contactPhone !== undefined) updates.contactPhone = input.contactPhone || null;
    if (input.address !== undefined) updates.address = input.address || null;
    if (input.isActive !== undefined) updates.isActive = input.isActive;

    await db.transaction(async (tx) => {
        if (Object.keys(updates).length > 0) {
            await organizationsRepo.update(organizationId, updates, tx);
        }

        if (performedById) {
            await auditLogsRepo.record(
                {
                    action: AuditAction.ORG_SETTINGS_UPDATED,
                    performedById,
                    organizationId,
                    targetType: "Organization",
                    targetId: organizationId,
                    details: `Updated: ${Object.keys(updates).join(", ") || "no changes"}`,
                },
                tx,
            );
        }
    });

    const organization = await organizationsRepo.findById(organizationId);
    if (!organization) {
        throw new HttpError(404, "Organization not found");
    }
    return organization;
}

export async function setVerified(
    organizationId: number,
    isVerified: boolean,
): Promise<OrganizationRow> {
    await organizationsRepo.update(organizationId, { isVerified });

    const organization = await organizationsRepo.findById(organizationId);
    if (!organization) {
        throw new HttpError(404, "Organization not found");
    }
    return organization;
}

export async function deleteOrganization(organizationId: number): Promise<void> {
    const organization = await organizationsRepo.findById(organizationId);
    if (!organization) {
        throw new HttpError(404, "Organization not found");
    }
    // Foreign keys cascade, so this removes the organization's donors,
    // requests, events, donations and audit trail with it.
    await organizationsRepo.remove(organizationId);
}
