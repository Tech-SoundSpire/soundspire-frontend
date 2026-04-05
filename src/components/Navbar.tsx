"use client";

import {
    FaCompass,
    FaHeadphones,
    FaUsers,
    FaClipboard,
    FaBell,
    FaUser,
    FaCog,
    FaExchangeAlt,
} from "react-icons/fa";
import { MdOutlineDynamicFeed } from "react-icons/md";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { getLogoUrl } from "@/utils/userProfileImageUtils";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { getFontClass } from "@/utils/getFontClass";
import { useLanguage } from "@/context/LanguageContext";

const Navbar = () => {
    const { user, switchRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const { t } = useLanguage();
    const [isExpanded, setIsExpanded] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const montserratClass = getFontClass("montserrat");
    const azeretClass = getFontClass("azeretMono");

    // Fetch unread count
    const fetchUnread = useCallback(async () => {
        if (!user?.id) return;
        try {
            const res = await fetch("/api/notifications", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.unreadCount ?? 0);
            }
        } catch { /* ignore */ }
    }, [user?.id]);

    useEffect(() => { fetchUnread(); }, [fetchUnread]);

    useEffect(() => {
        const handler = () => setUnreadCount(0);
        window.addEventListener("notifications-read", handler);
        return () => window.removeEventListener("notifications-read", handler);
    }, []);

    // Realtime notifications
    useEffect(() => {
        if (!user) return;
        const channel = supabase
            .channel(`notifications:${user.id}`)
            .on("postgres_changes", {
                event: "INSERT",
                schema: "public",
                table: "notifications",
                filter: `user_id=eq.${user.id}`,
            }, (payload: any) => {
                setUnreadCount((prev) => prev + 1);
                toast((t) => (
                    <div className="flex items-center gap-3 max-w-sm">
                        <span className="flex-1 text-sm">{payload.new.message}</span>
                        <button onClick={() => { toast.dismiss(t.id); router.push(payload.new.link); }} className="text-[#FF4E27] font-semibold text-sm whitespace-nowrap">View</button>
                        <button onClick={() => toast.dismiss(t.id)} className="text-gray-400 hover:text-white text-lg leading-none ml-1">×</button>
                    </div>
                ), { duration: 3000, style: { background: "#1a1625", color: "#fff", border: "1px solid #FF4E27", padding: "12px 16px" } });
            })
            .subscribe();
        return () => { channel.unsubscribe(); };
    }, [user, router]);

    const menuItems = [
        { icon: FaCompass, label: t("Explore"), href: "/explore" },
        { icon: MdOutlineDynamicFeed, label: t("Feed"), href: "/feed" },
        { icon: FaHeadphones, label: t("My Music"), href: "/my-music" },
        { icon: FaUsers, label: t("My Communities"), href: "/communities" },
        { icon: FaClipboard, label: t("Reviews"), href: "/reviews" },
        { icon: FaBell, label: t("Notifications"), href: "/notifications" },
        { icon: FaUser, label: t("Profile"), href: "/profile" },
        { icon: FaCog, label: t("Settings"), href: "/settings" },
    ];

    const getHomeRoute = () => {
        if (!user) return "/";
        return user.role === "artist" ? "/artist/dashboard" : "/explore";
    };

    return (
        <nav
            className="fixed left-0 top-0 h-full z-[9999] transition-all duration-300 border-r border-[#767474]"
            style={{
                width: isExpanded ? "var(--navbar-expanded)" : "var(--navbar-collapsed)",
                background: "linear-gradient(180deg, rgba(40,21,69,0.70) 0%, rgba(15,8,25,0.80) 100%)",
                backdropFilter: "blur(10px)",
            }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="flex flex-col h-full pt-[45px] px-[7px] overflow-hidden">
                {/* Logo */}
                <Link
                    href={getHomeRoute()}
                    className="flex items-center gap-4 mb-[24px] flex-shrink-0"
                >
                    <div className="w-[40px] h-[40px] flex-shrink-0">
                        <img
                            src={getLogoUrl()}
                            alt="SoundSpire Logo"
                            width={40}
                            height={40}
                            className="object-contain w-full h-full"
                        />
                    </div>
                    <span
                        className={`${azeretClass} text-white text-[21px] font-medium leading-[25px] whitespace-nowrap overflow-hidden transition-all duration-300 ${
                            isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                        }`}
                    >
                        SoundSpire
                    </span>
                </Link>

                {/* Navigation Items */}
                <div className="flex flex-col flex-1 min-h-0 overflow-y-auto gap-[clamp(12px,4vh,48px)] scrollbar-none" style={{ scrollbarWidth: "none" }}>
                    {menuItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`flex items-center gap-4 rounded-lg transition-colors duration-200 hover:bg-white/5`}
                            >
                                {/* Circular glass icon container */}
                                <div
                                    className="w-[40px] h-[40px] flex-shrink-0 rounded-full flex items-center justify-center"
                                    style={{
                                        background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(153,153,153,0.10) 100%)",
                                    }}
                                >
                                    <div className="relative">
                                        <item.icon className={`w-5 h-5 ${isActive ? "text-[#FF4E27]" : "text-white"}`} />
                                        {item.label === "Notifications" && unreadCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-[#FF4E27] text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center leading-none px-0.5">
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Label */}
                                <span
                                    className={`${montserratClass} ${isActive ? "text-[#FF4E27]" : "text-white"} text-[20px] font-medium leading-[24px] whitespace-nowrap overflow-hidden transition-all duration-300 ${
                                        isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Role Switch Button */}
                {user && (user.isAlsoArtist || user.role === "artist") && (
                    <div className="mt-auto mb-4 flex-shrink-0">
                        <div className="w-full h-px bg-[#767474] mb-4" />
                        <button
                            onClick={async () => {
                                const newRole = user.role === "artist" ? "user" : "artist";
                                await switchRole(newRole);
                                router.push(newRole === "artist" ? "/artist/dashboard" : "/explore");
                            }}
                            className={`flex items-center gap-4 rounded-lg hover:bg-white/5 transition-colors duration-200 w-full`}
                        >
                            <div
                                className="w-[40px] h-[40px] flex-shrink-0 rounded-full flex items-center justify-center"
                                style={{
                                    background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(153,153,153,0.10) 100%)",
                                }}
                            >
                                <FaExchangeAlt className="w-5 h-5 text-[#FFB7A6]" />
                            </div>
                            <span
                                className={`${montserratClass} text-[#FFB7A6] text-[20px] font-medium leading-[24px] whitespace-nowrap overflow-hidden transition-all duration-300 ${
                                    isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                                }`}
                            >
                                {user.role === "artist" ? t("Switch to Fan") : t("Switch to Artist")}
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
