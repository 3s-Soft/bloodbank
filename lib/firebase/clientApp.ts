import { getApp, getApps, initializeApp } from "firebase/app";

/**
 * Firebase client app.
 *
 * Only Cloud Messaging uses this now: `PushNotificationManager` calls
 * `getMessaging(app)` to obtain a device token. Firestore and Firebase Auth are
 * no longer part of the stack - data is in MySQL and sign-in goes through
 * NextAuth.
 */
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export { app };
