import * as admin from "firebase-admin";

if (!admin.apps.length) {
    try {
        // Handle newlines in the private key based on how it's stored in .env.local
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            : undefined;

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
        console.log("Firebase Admin Initialized successfully.");
    } catch (error) {
        console.error("Firebase Admin Initialization Error", error);
    }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();
const adminMessaging = admin.messaging();

export { adminDb, adminAuth, adminMessaging };
