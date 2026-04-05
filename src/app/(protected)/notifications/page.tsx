"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaArrowLeftLong, FaChevronDown } from "react-icons/fa6";
import { getFontClass } from "@/utils/getFontClass";
import { getImageUrl, DEFAULT_PROFILE_IMAGE } from "@/utils/userProfileImageUtils";
import { useLanguage } from "@/context/LanguageContext";

interface NotificationItem {
    notification_id: string;
    type: string;
    message: string;
    link: string;
    is_read: boolean;
    actor_image?: string | null;
    thumbnail?: string | null;
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
    return `${Math.floor(hrs / 24)}d`;
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const montserrat = getFontClass("montserrat");

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const res = await fetch("/api/notifications", { credentials: "include" });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.notifications || []);
                }
                await fetch("/api/notifications", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ notificationIds: "all" }),
                });
                window.dispatchEvent(new Event("notifications-read"));
            } catch { /* ignore */ }
            finally { setLoading(false); }
        })();
    }, [user]);

    const groups = groupByTime(notifications);
    const toggleGroup = (key: string) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

    const renderGroup = (items: NotificationItem[]) => {
        if (items.length === 0) return <p className={`${montserrat} text-[#6b7280] text-[16px]`}>{t('No notifications')}</p>;
        return items.map((n) => (
            <Link
                key={n.notification_id}
                href={n.link}
                className="flex items-center gap-4 py-3 transition hover:bg-white/5 rounded-lg px-2"
            >
                {/* Avatar */}
                <img
                    src={n.actor_image ? getImageUrl(n.actor_image) : getImageUrl(DEFAULT_PROFILE_IMAGE)}
                    alt=""
                    className="w-[53px] h-[53px] rounded-full object-cover flex-shrink-0"
                />
                {/* Message */}
                <p className={`${montserrat} text-[#F7F7F7] text-[20px] leading-[24px] flex-1 min-w-0`}>
                    {n.message}
                </p>
                {/* Timestamp — far right */}
                <span className={`${montserrat} text-white/60 text-[20px] font-medium leading-[24px] flex-shrink-0`}>
                    {timeAgo(n.created_at)}
                </span>
                {/* Thumbnail */}
                {n.thumbnail && (
                    <div className="w-[42px] h-[42px] rounded-[2px] bg-white overflow-hidden flex-shrink-0">
                        <img src={getImageUrl(n.thumbnail)} alt="" className="w-full h-full object-cover" />
                    </div>
                )}
            </Link>
        ));
    };

    if (loading) {
        return (
            <div className="md:ml-[54px] px-8 py-6 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4E27]" />
            </div>
        );
    }

    const sections = [
        { key: "today", label: t("Today"), items: groups.today },
        { key: "week", label: t("This Week"), items: groups.week },
        { key: "earlier", label: t("Earlier"), items: groups.earlier },
    ];

    return (
        <div className="md:ml-[54px] px-8 py-6 flex flex-col text-white min-h-screen">
            {/* Back button + Content side by side */}
            <div className="flex gap-6">
                <button
                    onClick={() => router.back()}
                    className="p-3 flex items-center justify-center bg-[#1b1b1b] rounded-full border-[3px] border-[#ff4e50] text-white hover:bg-[#ff4e50] transition-colors duration-300 aspect-square h-fit mt-1"
                >
                    <FaArrowLeftLong />
                </button>

                <div className="w-full max-w-[954px] mx-auto flex flex-col gap-6">
                    <h1 className={`${montserrat} text-[#FFD3C9] text-[28px] md:text-[47px] font-bold leading-[36px] md:leading-[56px] mb-4`}>
                        NOTIFICATIONS
                    </h1>
                {sections.map(({ key, label, items }) => (
                    <div key={key}>
                        {/* Group header */}
                        <button
                            onClick={() => toggleGroup(key)}
                            className="w-full flex items-center justify-between mb-5"
                        >
                            <span className={`${montserrat} text-[#FFB7A6] text-[28px] font-semibold leading-[34px]`}>
                                {label}
                            </span>
                            <div
                                className="w-[40px] h-[40px] rounded-full flex items-center justify-center border border-[#5A5A5A]"
                                style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(153,153,153,0.08) 100%)" }}
                            >
                                <FaChevronDown
                                    className={`text-[#FFB7A6] w-4 h-4 transition-transform duration-200 ${collapsed[key] ? "-rotate-90" : ""}`}
                                />
                            </div>
                        </button>
                        {/* Items */}
                        {!collapsed[key] && (
                            <div className="flex flex-col gap-[28px]">{renderGroup(items)}</div>
                        )}
                    </div>
                ))}
            </div>
            </div>
        </div>
    );
}
