/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

/**
 * Custom service worker extension for Web Push notifications.
 * This file is merged with the Workbox-generated service worker by
 * @ducanh2912/next-pwa (customWorkerSrc = "worker").
 */

const DEFAULT_ICON = "/assets/favicon.png";
const DEFAULT_BADGE = "/assets/favicon.png";
const DEFAULT_TAG = "blood-request";

self.addEventListener("push", (event: PushEvent) => {
    if (!event.data) return;

    let payload: {
        title?: string;
        body?: string;
        icon?: string;
        badge?: string;
        url?: string;
        tag?: string;
    } = {};

    try {
        payload = event.data.json();
    } catch {
        payload = { title: "Blood Request Alert", body: event.data.text() };
    }

    const title = payload.title ?? "Blood Request Alert";
    const options: NotificationOptions = {
        body: payload.body ?? "",
        icon: payload.icon ?? DEFAULT_ICON,
        badge: payload.badge ?? DEFAULT_BADGE,
        tag: payload.tag ?? DEFAULT_TAG,
        renotify: true,
        data: { url: payload.url ?? "/" },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
    event.notification.close();
    const url: string = event.notification.data?.url ?? "/";
    event.waitUntil(
        (self.clients as Clients)
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if ("focus" in client) {
                        return (client as WindowClient)
                            .navigate(url)
                            .then((c) => c?.focus())
                            .catch(() => (self.clients as Clients).openWindow(url));
                    }
                }
                return (self.clients as Clients).openWindow(url);
            })
    );
});
