"use client";

// import { useAuth } from '@/context/AuthContext';
import {
  FaHome,
  FaCompass,
  FaHeadphones,
  FaUsers,
  FaClipboard,
  FaBell,
  FaUser,
  FaCog,
} from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const Navbar = () => {
  // const { logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { icon: FaHome, label: "Home", href: "/" },
    { icon: FaCompass, label: "Explore", href: "/explore" },
    { icon: FaHeadphones, label: "My Music", href: "/my-music" },
    { icon: FaUsers, label: "My Communities", href: "/communities" },
    { icon: FaClipboard, label: "Reviews", href: "/reviews" },
    { icon: FaBell, label: "Notifications", href: "/notifications" },
    { icon: FaUser, label: "Profile", href: "/profile" },
    { icon: FaCog, label: "Settings", href: "/settings" },
  ];

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
          className={`flex items-center mb-8 ${isExpanded ? "px-4" : "justify-center"}`}
        >
          <div className="relative w-8 h-8">
            <img
              src="/images/logo.png"
              alt="SoundSpire Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span
            className={`ml-3 text-white font-bold text-xl whitespace-nowrap transition-all duration-300 ${
              isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
            }`}
          >
            SoundSpire
          </span>
        </Link>

        {/* Divider */}
        <div className="w-full h-px bg-gray-800 mb-6"></div>

        {/* Navigation Items */}
        <div className="flex flex-col space-y-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 ${
                isExpanded ? "px-4" : "justify-center"
              } py-3`}
            >
              <item.icon className={`w-5 h-5 ${isExpanded ? "mr-4" : ""}`} />
              <span
                className={`whitespace-nowrap transition-all duration-300 ${
                  isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
