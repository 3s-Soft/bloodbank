import { ok, withErrorHandling } from "@/lib/api/responses";
import { requireSuperAdmin } from "@/lib/auth/guards";
import * as organizationsRepo from "@/lib/repositories/organizations";

/** GET /api/admin/stats — platform-wide counters. */
export const GET = withErrorHandling(async () => {
    await requireSuperAdmin();

    return ok(await organizationsRepo.getPlatformStats());
});
