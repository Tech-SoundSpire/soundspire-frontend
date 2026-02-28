"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import BaseText from "@/components/BaseText/BaseText";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface NotificationItem {
    notification_id: string;
    type: string;
    message: string;
    link: string;
    is_read: boolean;
    created_at: string;
}

function groupByTime(notifications: NotificationItem[]) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const groups = { today: [] as NotificationItem[], week: [] as NotificationItem[], earlier: [] as NotificationItem[] };
    for (const n of notifications) {
        const d = new Date(n.created_at);
        if (d >= today) groups.today.push(n);
        else if (d >= weekAgo) groups.week.push(n);
        else groups.earlier.push(n);
    }
    return groups;
}

function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const res = await fetch("/api/notifications", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);
                }
                // Mark all as read
                await fetch("/api/notifications", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ notificationIds: "all" }),
                });
                // Tell Navbar to refresh count
                window.dispatchEvent(new Event("notifications-read"));
            } catch { /* ignore */ }
            finally { setLoading(false); }
        })();
    }, [user]);

    const groups = groupByTime(notifications);

    const handleClick = (n: NotificationItem) => {
        router.push(n.link);
    };

    const renderGroup = (items: NotificationItem[]) => {
        if (items.length === 0) return <BaseText textColor="#6b7280" fontSize="small">No notifications</BaseText>;
        return items.map((n) => (
            <div
                key={n.notification_id}
                onClick={() => handleClick(n)}
                className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition hover:bg-[#2d2838] ${!n.is_read ? "bg-[#2d2838]/50" : ""}`}
            >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${!n.is_read ? "bg-[#FF4E27]" : "bg-transparent"}`} />
                <BaseText fontSize="normal" className="flex-1">{n.message}</BaseText>
                <BaseText textColor="#9ca3af" fontSize="small">{timeAgo(n.created_at)}</BaseText>
            </div>
        ));
    };

    if (loading) {
        return (
            <div className="ml-16 px-8 py-6 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4E27]" />
            </div>
        );
    }

    return (
        <div className="ml-16 px-8 py-6 flex flex-col text-white min-h-screen">
            <div className="flex items-center justify-between mb-6">
                <BaseHeading fontSize="large" fontWeight={700}>Notifications</BaseHeading>
                {notifications.length > 0 && (
                    <BaseText textColor="#9ca3af" fontSize="small">{notifications.filter(n => !n.is_read).length} unread</BaseText>
                )}
            </div>
            <div className="mx-auto w-full max-w-3xl">
                <Accordion type="multiple" defaultValue={["today", "week", "earlier"]} className="space-y-2">
                    {[
                        { key: "today", label: "Today", items: groups.today },
                        { key: "week", label: "This Week", items: groups.week },
                        { key: "earlier", label: "Earlier", items: groups.earlier },
                    ].map(({ key, label, items }) => (
                        <AccordionItem key={key} value={key} className="border-b-0">
                            <AccordionTrigger className="text-xl font-semibold">
                                {label} {items.length > 0 && <span className="text-sm text-gray-400 ml-2">({items.length})</span>}
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-1">{renderGroup(items)}</div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
