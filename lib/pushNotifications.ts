import webpush from "web-push";
import connectDB from "@/lib/db/mongodb";
import { PushSubscriptionModel } from "@/lib/models/PushSubscription";
import { UrgencyLevel } from "@/lib/models/BloodRequest";

// Lazy initialization flag – VAPID details are set once on first use,
// avoiding build-time crashes when env vars are not yet available.
let vapidInitialized = false;

function ensureVapidConfigured(): boolean {
    if (vapidInitialized) return true;

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
        return false;
    }

    webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || "mailto:admin@example.com",
        publicKey,
        privateKey
    );
    vapidInitialized = true;
    return true;
}

export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    tag?: string;
}

/**
 * Send push notifications to all subscribers of an organisation that match
 * optional district / blood-group filters.
 */
export async function sendPushNotifications(
    organizationId: string,
    payload: PushNotificationPayload,
    filters?: { district?: string; bloodGroup?: string }
): Promise<void> {
    if (!ensureVapidConfigured()) {
        console.warn("VAPID keys not configured – skipping push notifications.");
        return;
    }

    await connectDB();

    // Build query: include subscribers that match the filter OR have no filter set
    const query: Record<string, unknown> = { organization: organizationId };
    if (filters?.district) {
        query.$or = [{ district: filters.district }, { district: { $exists: false } }, { district: null }];
    }
    if (filters?.bloodGroup) {
        const bloodGroupConditions = [{ bloodGroup: filters.bloodGroup }, { bloodGroup: { $exists: false } }, { bloodGroup: null }];
        if (query.$or) {
            // Combine both district and bloodGroup filters with $and
            query.$and = [
                { $or: query.$or as Record<string, unknown>[] },
                { $or: bloodGroupConditions },
            ];
            delete query.$or;
        } else {
            query.$or = bloodGroupConditions;
        }
    }

    const subscriptions = await PushSubscriptionModel.find(query);

    const message = JSON.stringify(payload);

    const results = await Promise.allSettled(
        subscriptions.map((sub) =>
            webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth },
                },
                message
            )
        )
    );

    // Remove subscriptions that are no longer valid (410 Gone)
    const expiredEndpoints: string[] = [];
    results.forEach((result, index) => {
        if (result.status === "rejected") {
            const err = result.reason as { statusCode?: number };
            if (err?.statusCode === 410 || err?.statusCode === 404) {
                expiredEndpoints.push(subscriptions[index].endpoint);
            }
        }
    });

    if (expiredEndpoints.length > 0) {
        await PushSubscriptionModel.deleteMany({ endpoint: { $in: expiredEndpoints } });
    }
}

/**
 * Build a push notification payload for an urgent/emergency blood request.
 */
export function buildBloodRequestPayload(
    urgency: UrgencyLevel,
    bloodGroup: string,
    district: string,
    orgSlug: string,
    requestId: string
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
