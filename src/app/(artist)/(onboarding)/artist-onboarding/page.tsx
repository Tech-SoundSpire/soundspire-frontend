"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaMusic, FaRecordVinyl, FaFolder } from "react-icons/fa";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import BaseText from "@/components/BaseText/BaseText";

const roleCards = [
    {
        id: "artist",
        title: "Artist",
        description:
            "Discover your sound and grow your fanbase. Access tools that help you create, promote, and thrive.",
        icon: FaMusic,
        color: "#FA6400",
    },
    {
        id: "record-label",
        title: "Record Label",
        description:
            "Manage rosters, track releases, and amplify your reach. Built to scale with your artists' success.",
        icon: FaRecordVinyl,
        color: "#FA6400",
    },
    {
        id: "manager",
        title: "Manager",
        description:
            "Handle bookings, royalties, and team coordination. Stay in sync with your artists, always.",
        icon: FaFolder,
        color: "#FA6400",
    },
];

export default function ArtistOnboardingPage() {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const router = useRouter();

    const handleRoleSelection = (roleId: string) => {
        if (roleId !== "artist") {
            return; // Manager and Record Label are coming soon
        }
        setSelectedRole(roleId);
        router.push("/find-artist-profile");
    };

    const handleArtistLogin = () => {
        router.push("/artist/login");
    };

    return (
        <div className="min-h-screen bg-[#1a1625] text-white relative overflow-hidden">
            {/* Artist Login Button - Top Right */}
            <div className="absolute top-4 right-4 z-20">
                <button
                    onClick={handleArtistLogin}
                    className="px-6 py-2 bg-[#FA6400] hover:bg-[#e55a00] text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
                >
                    Artist Login
                </button>
            </div>

            {/* Welcome Message */}
            <div className="text-center mb-8">
                <BaseHeading
                    headingLevel="h1"
                    fontSize="sub heading"
                    fontWeight={700}
                    textColor="#FA6400"
                    className="mb-4"
                >
                    Welcome to SoundSpire
                </BaseHeading>
                <BaseText
                    fontSize="normal"
                    textColor="#ffffff"
                    className="mb-2"
                >
                    We are excited to have you{" "}
                    <BaseText wrapper="span" textColor="#FA6400">
                        on-board!
                    </BaseText>
                </BaseText>
                <BaseText fontSize="normal" textColor="#ffffff">
                    To know you better, let us which of the following best
                    describes you:
                </BaseText>
            </div>

            {/* Middle Selection Area */}
            <div className="relative z-10 px-8 mb-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {roleCards.map((card) => (
                            <div
                                key={card.id}
                                onClick={() => handleRoleSelection(card.id)}
                                className={`bg-[#2d2838] rounded-lg p-6 transition-all duration-300 relative ${
                                    card.id === "artist"
                                        ? "cursor-pointer hover:scale-105"
                                        : "opacity-60 cursor-not-allowed"
                                } ${
                                    selectedRole === card.id
                                        ? "ring-2 ring-[#FA6400]"
                                        : ""
                                }`}
                            >
                                {card.id !== "artist" && (
                                    <div className="absolute top-3 right-3 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                                        Coming Soon
                                    </div>
                                )}
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-[#FA6400] rounded-full flex items-center justify-center mx-auto mb-4">
                                        <card.icon className="text-white text-2xl" />
                                    </div>
                                    <BaseHeading
                                        headingLevel="h3"
                                        fontSize="normal"
                                        fontWeight={700}
                                        textColor="#ffffff"
                                        className="mb-4"
                                    >
                                        {card.title}
                                    </BaseHeading>
                                    <BaseText
                                        textColor="#d1d5db"
                                        fontSize="small"
                                        className="leading-relaxed"
                                    >
                                        {card.description}
                                    </BaseText>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Image Collage */}
            <div className="relative h-64 md:h-96 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2 transform rotate-12 scale-110">
                        {/* Album covers - creating a collage effect */}
                        {Array.from({ length: 24 }, (_, i) => (
                            <div
                                key={i}
                                className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg transform rotate-12 hover:rotate-0 transition-transform duration-300"
                                style={{
                                    background: `linear-gradient(45deg, 
                    hsl(${Math.random() * 360}, 70%, 60%), 
                    hsl(${Math.random() * 360}, 70%, 40%))`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
