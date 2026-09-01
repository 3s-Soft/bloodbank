import { ok, withErrorHandling } from "@/lib/api/responses";
import { requireSuperAdmin } from "@/lib/auth/guards";
import { getPlatformAnalytics } from "@/lib/repositories/analytics";

/** GET /api/admin/analytics — platform analytics for the super-admin dashboard. */
export const GET = withErrorHandling(async () => {
    await requireSuperAdmin();

    return ok(await getPlatformAnalytics());
});
