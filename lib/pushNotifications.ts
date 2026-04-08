import { adminMessaging, adminDb } from "@/lib/firebase/adminApp";
import { COLLECTIONS } from "@/lib/firebase/types";
import { UrgencyLevel } from "@/lib/firebase/types";

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

    // Include subscribers that match the filter OR have no filter set
    const subsRef = adminDb.collection(COLLECTIONS.PUSH_SUBSCRIPTIONS).where("organization", "==", organizationId);

    // Note: Firestore has limitations on complex OR queries. 
    // Usually it's better to fetch by org and filter in memory for complex combinations like this.
    const snapshot = await subsRef.get();
    
    const tokens: string[] = [];
    const validDocs: { id: string, token: string }[] = [];

    snapshot.docs.forEach((doc) => {
        const data = doc.data();
        let districtMatch = true;
        let bloodGroupMatch = true;

        if (filters?.district) {
             districtMatch = !data.district || data.district === filters.district;
        }
        if (filters?.bloodGroup) {
             bloodGroupMatch = !data.bloodGroup || data.bloodGroup === filters.bloodGroup;
        }

        if (districtMatch && bloodGroupMatch && data.token) {
             tokens.push(data.token);
             validDocs.push({ id: doc.id, token: data.token });
        }
    });

    if (tokens.length === 0) return;

    try {
        const messagePayload = {
             tokens,
             notification: {
                 title: payload.title,
                 body: payload.body,
             },
             data: {
                 url: payload.url || "/",
             }
        };

        const response = await adminMessaging.sendEachForMulticast(messagePayload);
        
        // Remove subscriptions that are no longer valid
        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const errCode = resp.error?.code;
                    if (errCode === 'messaging/invalid-registration-token' ||
                        errCode === 'messaging/registration-token-not-registered') {
                        failedTokens.push(tokens[idx]);
                    }
                }
            });

            if (failedTokens.length > 0) {
                 const invalidSubs = validDocs.filter(doc => failedTokens.includes(doc.token));
                 const batch = adminDb.batch();
                 invalidSubs.forEach(doc => {
                      batch.delete(adminDb.collection(COLLECTIONS.PUSH_SUBSCRIPTIONS).doc(doc.id));
                 });
                 await batch.commit();
            }
        }
    } catch(err) {
        console.error("FCM Send Error: ", err);
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
