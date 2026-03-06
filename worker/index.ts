/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

/**
 * Custom service worker extension for Web Push notifications.
 * This file is merged with the Workbox-generated service worker by
 * @ducanh2912/next-pwa (customWorkerSrc = "worker").
 */

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
        icon: payload.icon ?? "/assets/favicon.png",
        badge: payload.badge ?? "/assets/favicon.png",
        tag: payload.tag ?? "blood-request",
        renotify: true,
        data: { url: payload.url ?? "/" },
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
    event.notification.close();
    const url: string = event.notification.data?.url ?? "/";
    event.waitUntil(
        (self.clients as Clients).matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ("focus" in client) {
                    (client as WindowClient).navigate(url);
                    return (client as WindowClient).focus();
                }
            }
            return (self.clients as Clients).openWindow(url);
        })
    );
});
