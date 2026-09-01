import * as admin from "firebase-admin";

/**
 * Firebase Admin, used only for Cloud Messaging.
 *
 * Application data lives in MySQL (see `lib/db`). Firebase remains solely as
 * the push-notification transport, so Firestore is deliberately not exported
 * from here.
 */
if (!admin.apps.length) {
    try {
        // The private key is stored with escaped newlines in the environment.
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\n/g, "\n")
            : undefined;

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey,
            }),
        });
    } catch (error) {
        console.error("Firebase Admin initialization failed:", error);
    }
}

const adminAuth = admin.auth();
const adminMessaging = admin.messaging();

export { adminAuth, adminMessaging };
