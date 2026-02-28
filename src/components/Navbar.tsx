"use client";

// import { useAuth } from '@/context/AuthContext';
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
import BaseText from "./BaseText/BaseText";
import { getLogoUrl } from "@/utils/userProfileImageUtils";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

const Navbar = () => {
    const { user, switchRole } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

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

    // Listen for read events from notifications page
    useEffect(() => {
        const handler = () => setUnreadCount(0);
        window.addEventListener("notifications-read", handler);
        return () => window.removeEventListener("notifications-read", handler);
    }, []);

    // Realtime: listen for new notifications
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
                // Persistent toast with close button
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
        // { icon: FaHome, label: 'Home', href: '/' },
        { icon: FaCompass, label: "Explore", href: "/explore" },
        { icon: MdOutlineDynamicFeed, label: "Feed", href: "/feed" },
        { icon: FaHeadphones, label: "My Music", href: "/my-music" },
        { icon: FaUsers, label: "My Communities", href: "/communities" },
        { icon: FaClipboard, label: "Reviews", href: "/reviews" },
        { icon: FaBell, label: "Notifications", href: "/notifications" },
        { icon: FaUser, label: "Profile", href: "/profile" },
        { icon: FaCog, label: "Settings", href: "/settings" },
    ];
    // Delay for opacity.
    const baseTransitionDelay = 35;

    const getHomeRoute = () => {
        if (!user) return "/";
        return user.role === "artist" ? "/artist/dashboard" : "/explore";
    };

    return (
        <nav
            className={`fixed left-0 top-0 h-full bg-black transition-all duration-300 z-[9999] ${
                isExpanded ? "w-navbar-expanded" : "w-navbar-collapsed"
            }`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="flex flex-col h-full pt-6">
                {/* Logo */}
                <Link
                    href={getHomeRoute()}
                    className={`grid items-center gap-4 mb-8 transition-all duration-300 ${
                        isExpanded
                            ? "grid-cols-[1fr_5fr]"
                            : "grid-cols-[1fr_0fr]"
                    } p-3`}
                >
                    <div className={`relative w-8 h-8`}>
                        <img
                            src={getLogoUrl()}
                            alt="SoundSpire Logo"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    </div>
                    <BaseText
                        wrapper="span"
                        textColor="#ffffff"
                        fontWeight={700}
                        fontSize="normal"
                        fontName="inter"
                        className={`whitespace-nowrap overflow-hidden	min-w-0 transition-[opacity_transform] duration-300 ${
                            isExpanded
                                ? "translate-x-0 opacity-1"
                                : "-translate-x-3 opacity-0"
                        }`}
                    >
                        SoundSpire
                    </BaseText>
                </Link>

                {/* Divider */}
                <div className="w-full h-px bg-gray-800 mb-6"></div>

                {/* Navigation Items */}
                <div className="flex flex-col space-y-2">
                    {menuItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                        <Link
                            key={index}
                            href={item.href}
                            className={`grid items-center transition-all duration-300 ${
                                isActive
                                    ? "text-[#FF4E27]"
                                    : "text-gray-400 hover:text-white hover:bg-[#3d2b5a]"
                            } ${
                                isExpanded
                                    ? "grid-cols-[1fr_5fr]"
                                    : "grid-cols-[1fr_0fr]"
                            } p-3`}
                        >
                            <div className="relative">
                                <item.icon
                                    className={`w-5 h-5 ${
                                        isExpanded ? "mr-4" : ""
                                    }`}
                                />
                                {item.label === "Notifications" && unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-[#FF4E27] text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center leading-none px-0.5">
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </div>
                            <BaseText
                                wrapper="span"
                                className={`whitespace-nowrap overflow-hidden will-change-[opacity] transition-opacity duration-300 ${
                                    isExpanded ? "opacity-1" : "opacity-0"
                                }`}
                                textColor="inherit"
                                style={{
                                    transitionDelay: `${
                                        index * baseTransitionDelay
                                    }ms`,
                                }}
                                fontSize="very small"
                                fontName="inter"
                            >
                                {item.label}
                            </BaseText>
                        </Link>
                    )})}
                </div>

                {/* Role Switch Button */}
                {user && (user.isAlsoArtist || user.role === "artist") && (
                    <>
                        <div className="mt-auto mb-4 w-full h-px bg-gray-800"></div>
                        <button
                            onClick={async () => {
                                const newRole = user.role === "artist" ? "user" : "artist";
                                await switchRole(newRole);
                                router.push(newRole === "artist" ? "/artist/dashboard" : "/explore");
                            }}
                            className={`grid items-center text-orange-400 hover:text-orange-300 hover:bg-[#3d2b5a] transition-all duration-300 mb-4 ${
                                isExpanded
                                    ? "grid-cols-[1fr_5fr]"
                                    : "grid-cols-[1fr_0fr]"
                            } p-3`}
                        >
                            <FaExchangeAlt className={`w-5 h-5 ${isExpanded ? "mr-4" : ""}`} />
                            <BaseText
                                wrapper="span"
                                className={`whitespace-nowrap overflow-hidden transition-opacity duration-300 ${
                                    isExpanded ? "opacity-1" : "opacity-0"
                                }`}
                                textColor="inherit"
                                fontSize="very small"
                                fontName="inter"
                            >
                                {user.role === "artist" ? "Switch to Fan" : "Switch to Artist"}
                            </BaseText>
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
