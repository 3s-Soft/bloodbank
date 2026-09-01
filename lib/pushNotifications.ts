import { adminMessaging } from "@/lib/firebase/adminApp";
import { pushSubscriptionsRepo } from "@/lib/repositories/misc";
import { UrgencyLevel, type BloodGroup } from "@/lib/db/enums";

/**
 * Push delivery over Firebase Cloud Messaging.
 *
 * Firebase remains the notification transport after the move to MySQL; only the
 * subscription store changed. Subscriber selection is now a SQL query rather
 * than fetching every subscription for an organization and filtering in memory.
 */

export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    tag?: string;
}

export interface PushFilters {
    district?: string | null;
    bloodGroup?: BloodGroup | null;
}

/**
 * Sends to every matching subscriber of an organization.
 *
 * Never throws: callers treat push as fire-and-forget, because a notification
 * failure must not fail the blood request that triggered it.
 */
export async function sendPushNotifications(
    organizationId: number,
    payload: PushNotificationPayload,
    filters: PushFilters = {},
): Promise<void> {
    try {
        const subscriptions = await pushSubscriptionsRepo.findTargets(organizationId, filters);
        const tokens = subscriptions.map((subscription) => subscription.token);

        if (tokens.length === 0) return;

        const response = await adminMessaging.sendEachForMulticast({
            tokens,
            notification: {
                title: payload.title,
                body: payload.body,
            },
            data: {
                url: payload.url ?? "/",
            },
        });

        if (response.failureCount === 0) return;

        // Tokens rejected as unknown belong to uninstalled apps or cleared site
        // data; keeping them would make every future send report failures.
        const staleTokens = response.responses.flatMap((result, index) => {
            if (result.success) return [];
            const code = result.error?.code;
            const isStale =
                code === "messaging/invalid-registration-token" ||
                code === "messaging/registration-token-not-registered";
            return isStale ? [tokens[index]] : [];
        });

        if (staleTokens.length > 0) {
            await pushSubscriptionsRepo.removeTokens(staleTokens);
        }
    } catch (error) {
        console.error("Push notification dispatch failed:", error);
    }
}

/** Notification content for an urgent or emergency blood request. */
export function buildBloodRequestPayload(
    urgency: UrgencyLevel,
    bloodGroup: string,
    district: string,
    orgSlug: string,
    requestId: number,
): PushNotificationPayload {
    const urgencyLabel = urgency.charAt(0).toUpperCase() + urgency.slice(1).toLowerCase();
    const isEmergency = urgency === UrgencyLevel.EMERGENCY;

    return {
        title: isEmergency
            ? `🚨 Emergency: ${bloodGroup} Blood Needed`
            : `⚠️ Urgent: ${bloodGroup} Blood Needed`,
        body: `${urgencyLabel} blood request for ${bloodGroup} has been posted in ${district}. Tap to view details.`,
        icon: "/assets/favicon.png",
        badge: "/assets/favicon.png",
        url: `/${orgSlug}/requests`,
        tag: `blood-request-${requestId}`,
    };
}
