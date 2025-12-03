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
} from "react-icons/fa";
import { MdOutlineDynamicFeed } from "react-icons/md";
import Link from "next/link";

import { useState } from "react";
import BaseText from "./BaseText/BaseText";
import { getLogoUrl } from "@/utils/userProfileImageUtils";

const Navbar = () => {
    // const { logout } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);

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
    return (
        <nav
            className={`fixed left-0 top-0 h-full bg-black transition-all duration-300 z-50 ${
                isExpanded ? "w-64" : "w-16"
            }`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div className="flex flex-col h-full pt-6">
                {/* Logo */}
                <Link
                    href="/"
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
                    {menuItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={`grid items-center text-gray-300 hover:text-white hover:bg-gray-800 transition-all duration-300 ${
                                isExpanded
                                    ? "grid-cols-[1fr_5fr]"
                                    : "grid-cols-[1fr_0fr]"
                            } p-3`}
                        >
                            <item.icon
                                className={`w-5 h-5 ${
                                    isExpanded ? "mr-4" : ""
                                }`}
                            />
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
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
