"use client";

import { getImageUrl, getLogoUrl } from "@/utils/userProfileImageUtils";
import Image from "next/image";
import useRedirectIfAuthenticated from "@/hooks/useRedirectIfAuthenticated";
import BaseText from "@/components/BaseText/BaseText";

export const dynamic = "force-dynamic";

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
                        <div className="w-28 h-28 mr-3 relative">
                            <Image
                                fill
                                src={getLogoUrl()}
                                alt="SoundSpire Logo"
                                objectFit="contain"
                            />
                        </div>
                        <BaseText
                            wrapper="span"
                            textColor="#ffffff"
                            fontSize="normal"
                            fontWeight={700}
                        >
                            SoundSpire
                        </BaseText>
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
