"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Smartphone, Calendar, Droplet, Save } from "lucide-react";
import { toast } from "sonner";

interface NotificationPreference {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    enabled: boolean;
}

interface NotificationPreferencesProps {
    userId: string;
    preferences?: {
        emailDonationReminders: boolean;
        emailNewRequests: boolean;
        emailEventUpdates: boolean;
        inAppAlerts: boolean;
    };
}

export default function NotificationPreferences({ userId, preferences }: NotificationPreferencesProps) {
    const [prefs, setPrefs] = useState<NotificationPreference[]>([
        {
            id: "emailDonationReminders",
            label: "Donation Reminders",
            description: "Email reminders when you become eligible to donate again",
            icon: <Mail className="w-5 h-5 text-blue-400" />,
            enabled: preferences?.emailDonationReminders ?? true,
        },
        {
            id: "emailNewRequests",
            label: "New Blood Requests",
            description: "Get alerted when new urgent blood requests are posted",
            icon: <Droplet className="w-5 h-5 text-red-400" />,
            enabled: preferences?.emailNewRequests ?? true,
        },
        {
            id: "emailEventUpdates",
            label: "Event Updates",
            description: "Notifications about upcoming blood donation events",
            icon: <Calendar className="w-5 h-5 text-emerald-400" />,
            enabled: preferences?.emailEventUpdates ?? true,
        },
        {
            id: "inAppAlerts",
            label: "In-App Alerts",
            description: "Show alerts for important updates within the dashboard",
            icon: <Bell className="w-5 h-5 text-amber-400" />,
            enabled: preferences?.inAppAlerts ?? true,
        },
    ]);
    const [saving, setSaving] = useState(false);

    const togglePref = (id: string) => {
        setPrefs((prev) =>
            prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const prefData: Record<string, boolean> = {};
            prefs.forEach((p) => {
                prefData[p.id] = p.enabled;
            });

            const res = await fetch("/api/org/users/" + userId, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationPreferences: prefData }),
            });

            if (res.ok) {
                toast.success("Notification preferences saved!");
            } else {
                toast.error("Failed to save preferences");
            }
        } catch {
            toast.error("Failed to save preferences");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-amber-400" />
                    </div>
                    Notification Preferences
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {prefs.map((pref) => (
                        <div
                            key={pref.id}
                            className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                {pref.icon}
                                <div>
                                    <p className="text-sm font-bold text-white">{pref.label}</p>
                                    <p className="text-xs text-slate-500">{pref.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => togglePref(pref.id)}
                                className={`relative w-12 h-6 rounded-full transition-all ${pref.enabled ? "bg-red-500" : "bg-slate-600"
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${pref.enabled ? "translate-x-6" : "translate-x-0"
                                        }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? "Saving..." : "Save Preferences"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
