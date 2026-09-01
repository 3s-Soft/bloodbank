import bcrypt from "bcryptjs";

import { HttpError } from "@/lib/api/responses";
import { db } from "@/lib/db";
import { AuditAction, DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/db/enums";
import { auditLogsRepo } from "@/lib/repositories/misc";
import * as usersRepo from "@/lib/repositories/users";
import type { UserRow } from "@/lib/types";

/** Organization member management, with audit entries. */

export async function createOrgUser(
    input: {
        name: string;
        phone: string;
        email?: string | null;
        password?: string;
        role: UserRow["role"];
    },
    organizationId: number,
    performedById: number,
): Promise<UserRow> {
    if (await usersRepo.findByPhone(input.phone)) {
        throw new HttpError(409, "A user with this phone number already exists");
    }

    const userId = await db.transaction(async (tx) => {
        const id = await usersRepo.create(
            {
                name: input.name,
                phone: input.phone,
                email: input.email || null,
                password: input.password ? await bcrypt.hash(input.password, 10) : null,
                role: input.role,
                organizationId,
                onboardingCompleted: true,
                notificationPreferences: DEFAULT_NOTIFICATION_PREFERENCES,
            },
            tx,
        );

        await auditLogsRepo.record(
            {
                action: AuditAction.USER_ADDED,
                performedById,
                organizationId,
                targetType: "User",
                targetId: id,
                details: `Added ${input.name} as ${input.role}`,
            },
            tx,
        );

        return id;
    });

    const user = await usersRepo.findById(userId);
    if (!user) {
        throw new HttpError(500, "User was created but could not be read back");
    }
    return user;
}

/** Loads a user and asserts they belong to the caller's organization. */
async function requireOrgMember(userId: number, organizationId: number): Promise<UserRow> {
    const user = await usersRepo.findById(userId);
    if (!user) {
        throw new HttpError(404, "User not found");
    }
    if (user.organizationId !== organizationId) {
        throw new HttpError(403, "That user belongs to another organization");
    }
    return user;
}

export async function updateOrgUser(
    userId: number,
    input: { name?: string; phone?: string; email?: string | null; role?: UserRow["role"] },
    organizationId: number,
    performedById: number,
): Promise<UserRow> {
    const existing = await requireOrgMember(userId, organizationId);

    if (input.phone && input.phone !== existing.phone) {
        const clash = await usersRepo.findByPhone(input.phone);
        if (clash && clash.id !== userId) {
            throw new HttpError(409, "A user with this phone number already exists");
        }
    }

    const updates: Partial<UserRow> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.phone !== undefined) updates.phone = input.phone;
    if (input.email !== undefined) updates.email = input.email || null;
    if (input.role !== undefined) updates.role = input.role;

    await db.transaction(async (tx) => {
        if (Object.keys(updates).length > 0) {
            await usersRepo.update(userId, updates, tx);
        }

        // A role change is the entry worth being able to audit later, so it is
        // recorded distinctly from other edits.
        if (input.role && input.role !== existing.role) {
            await auditLogsRepo.record(
                {
                    action: AuditAction.USER_ROLE_CHANGED,
                    performedById,
                    organizationId,
                    targetType: "User",
                    targetId: userId,
                    details: `Changed ${existing.name} from ${existing.role} to ${input.role}`,
                },
                tx,
            );
        }
    });

    const user = await usersRepo.findById(userId);
    if (!user) {
        throw new HttpError(404, "User not found");
    }
    return user;
}

export async function deleteOrgUser(
    userId: number,
    organizationId: number,
    performedById: number,
): Promise<void> {
    const user = await requireOrgMember(userId, organizationId);

    if (userId === performedById) {
        throw new HttpError(400, "You cannot delete your own account");
    }

    await db.transaction(async (tx) => {
        // Donor profiles cascade with the user row.
        await usersRepo.remove(userId, tx);
        await auditLogsRepo.record(
            {
                action: AuditAction.USER_DELETED,
                performedById,
                organizationId,
                targetType: "User",
                targetId: userId,
                details: `Deleted user ${user.name}`,
            },
            tx,
        );
    });
}
