import * as admin from "firebase-admin";

/**
 * Firebase Admin, used only for Cloud Messaging.
 *
 * Application data lives in MySQL (see `lib/db`). Firebase remains solely as
 * the push-notification transport, so Firestore is deliberately not exported
 * from here.
 *
 * Initialisation is deferred to first use. Calling `admin.messaging()` at
 * module scope throws "The default Firebase app does not exist" whenever
 * credentials are absent, which broke `next build` in any environment without
 * secrets — CI, a fresh clone, or a Vercel project missing one variable. A
 * missing key should degrade push notifications at send time, not fail the
 * build.
 */

let initialised = false;

function ensureApp(): void {
    if (initialised || admin.apps.length > 0) {
        initialised = true;
        return;
    }

    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // The private key is stored with escaped newlines in the environment.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Firebase Admin is not configured. Set NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY to enable push notifications.",
        );
    }

    admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    initialised = true;
}

/**
 * Lazy proxies: the underlying service is resolved on first property access,
 * so importing this module never touches Firebase.
 */
function lazyService<T extends object>(resolve: () => T): T {
    return new Proxy({} as T, {
        get(_target, property) {
            ensureApp();
            const service = resolve();
            const value = Reflect.get(service as object, property) as unknown;
            return typeof value === "function" ? value.bind(service) : value;
        },
    });
}

export const adminAuth = lazyService(() => admin.auth());
export const adminMessaging = lazyService(() => admin.messaging());

/** True when push credentials are present, for callers that want to skip work. */
export function isPushConfigured(): boolean {
    return Boolean(
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
            process.env.FIREBASE_CLIENT_EMAIL &&
            process.env.FIREBASE_PRIVATE_KEY,
    );
}
