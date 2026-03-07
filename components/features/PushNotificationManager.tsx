"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { urlBase64ToUint8Array } from "@/lib/utils/vapid";

interface PushNotificationManagerProps {
    orgSlug: string;
    /** Optional: pre-filter subscriptions to a specific district */
    district?: string;
    /** Optional: pre-filter subscriptions to a specific blood group */
    bloodGroup?: string;
}


/**
 * Renders a small toggle button that lets a user subscribe to or
 * unsubscribe from Web Push notifications for urgent/emergency blood
 * requests in the given organisation.
 */
export default function PushNotificationManager({
    orgSlug,
    district,
    bloodGroup,
}: PushNotificationManagerProps) {
    const [supported, setSupported] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
        setSupported(true);

        // Check if already subscribed
        navigator.serviceWorker.ready.then((reg) => {
            reg.pushManager.getSubscription().then((sub) => {
                setSubscribed(!!sub);
            });
        });
    }, []);

    const subscribe = async () => {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
            toast.error("Push notifications are not configured.");
            return;
        }

        setLoading(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                toast.error("Notification permission denied.");
                return;
            }

            const reg = await navigator.serviceWorker.ready;
            const subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });

            const res = await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subscription, orgSlug, district, bloodGroup }),
            });

            if (!res.ok) throw new Error("Failed to save subscription");
            setSubscribed(true);
            toast.success("You'll be notified about urgent blood requests!");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to subscribe to notifications.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = async () => {
        setLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;
            const subscription = await reg.pushManager.getSubscription();
            if (subscription) {
                await fetch("/api/push/subscribe", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                });
                await subscription.unsubscribe();
            }
            setSubscribed(false);
            toast.success("You've unsubscribed from push notifications.");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to unsubscribe.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!supported) return null;

    return (
        <button
            onClick={subscribed ? unsubscribe : subscribe}
            disabled={loading}
            title={subscribed ? "Disable push notifications" : "Enable push notifications for urgent requests"}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-60 ${
                subscribed
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
            }`}
        >
            {subscribed ? (
                <>
                    <Bell className="w-4 h-4" />
                    {loading ? "..." : "Notifications On"}
                </>
            ) : (
                <>
                    <BellOff className="w-4 h-4" />
                    {loading ? "..." : "Enable Notifications"}
                </>
            )}
        </button>
    );
}
