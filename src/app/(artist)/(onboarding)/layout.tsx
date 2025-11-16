"use client";

import { getImageUrl } from "@/utils/userProfileImageUtils";
import Image from "next/image";
import useRedirectIfAuthenticated from "@/hooks/useRedirectIfAuthenticated";

export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  useRedirectIfAuthenticated();

  return (
    <div className="min-h-screen bg-[#1a1625] text-white relative overflow-hidden">
      <div className="relative z-10 p-8 pb-0">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              // src={getImageUrl("s3://soundspirewebsiteassets/assets/ss_logo.png")}
              src={getImageUrl("s3://soundspirewebsiteassets/images/placeholder.png")}
              alt="SoundSpire Logo"
              width={100}
              height={100}
              className="mr-3 object-contain"
            />
            <span className="text-white text-2xl font-bold">SoundSpire</span>
          </div>

          {/* 🔹 Slot for page-specific header actions */}
          <div id="header-actions" />
        </div>
      </div>

      {/* 🔹 Page content */}
      {children}
    </div>
  );
}
