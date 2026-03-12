"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCompass, FaUsers, FaClipboard, FaBell, FaUser } from "react-icons/fa";
import { MdOutlineDynamicFeed } from "react-icons/md";

const items = [
    { icon: FaCompass, label: "Explore", href: "/explore" },
    { icon: MdOutlineDynamicFeed, label: "Feed", href: "/feed" },
    { icon: FaUsers, label: "Communities", href: "/communities" },
    { icon: FaClipboard, label: "Reviews", href: "/reviews" },
    { icon: FaBell, label: "Alerts", href: "/notifications" },
    { icon: FaUser, label: "Profile", href: "/profile" },
];

export default function MobileNav() {
    const pathname = usePathname();
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[9999] bg-[#0a0612]/95 backdrop-blur-md border-t border-[#767474] flex justify-around items-center h-16 md:hidden">
            {items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                    <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 py-1">
                        <item.icon className={`w-5 h-5 ${isActive ? "text-[#FF4E27]" : "text-gray-400"}`} />
                        <span className={`text-[10px] ${isActive ? "text-[#FF4E27] font-semibold" : "text-gray-400"}`}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
