"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";
import { getMessaging, getToken, deleteToken } from "firebase/messaging";
import { app } from "@/lib/firebase/clientApp";

interface PushNotificationManagerProps {
    orgSlug: string;
    /** Optional: pre-filter subscriptions to a specific district */
    district?: string;
    /** Optional: pre-filter subscriptions to a specific blood group */
    bloodGroup?: string;
}

export default function PushNotificationManager({
    orgSlug,
    district,
    bloodGroup,
}: PushNotificationManagerProps) {
    const [supported, setSupported] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentToken, setCurrentToken] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
        setSupported(true);

        // Try to get existing token
        try {
             const messaging = getMessaging(app);
             getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY }).then(token => {
                 if (token) {
                     setSubscribed(true);
                     setCurrentToken(token);
                 }
             }).catch(() => {
                 // Ignore errors if permission not granted
             });
        } catch(e) { /* ignore */ }
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

            const messaging = getMessaging(app);
            const token = await getToken(messaging, {
                vapidKey: vapidPublicKey,
            });

            if (!token) {
                toast.error("Failed to generate FCM token.");
                return;
            }

            const res = await fetch("/api/push/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, orgSlug, district, bloodGroup }),
            });

            if (!res.ok) throw new Error("Failed to save subscription");
            setSubscribed(true);
            setCurrentToken(token);
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
            const messaging = getMessaging(app);
            
            if (currentToken) {
                await fetch("/api/push/subscribe", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token: currentToken }),
                });
                await deleteToken(messaging);
            }
            setSubscribed(false);
            setCurrentToken(null);
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
