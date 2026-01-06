"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
    getLogoUrl,
} from "@/utils/userProfileImageUtils";

import { FaYoutube, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import BaseText from "@/components/BaseText/BaseText";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import { useAuth } from "@/context/AuthContext";

interface CommunityData {
    community_id: string;
    name: string;
    description?: string | null;
    subscription_fee: number;
    subscription_interval: string;
}

interface ArtistData {
    artist_id: string;
    artist_name: string;
    bio: string;
    profile_picture_url: string;
    cover_photo_url: string;
    socials?: { platform: string; url: string }[];
    community?: CommunityData | null;
}

const default_image_link = getImageUrl(DEFAULT_PROFILE_IMAGE);

export default function ArtistDashboard() {
    const router = useRouter();
    const { logout } = useAuth();
    const [artist, setArtist] = useState<ArtistData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/artist/me");
                if (!res.ok) throw new Error("Unable to fetch artist data");
                const data = await res.json();
                setArtist(data.artist);
            } catch (err: any) {
                toast.error(err.message || "Failed to load dashboard");
                router.replace("/find-artist-profile");
            } finally {
                setLoading(false);
            }
        })();
    }, [router]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            router.push("/artist-onboarding");
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Failed to logout");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1625] flex items-center justify-center text-white">
                Loading artist dashboard...
            </div>
        );
    }

    if (!artist) {
        return (
            <div className="min-h-screen bg-[#1a1625] text-white flex flex-col items-center justify-center">
                <BaseText>No artist data found.</BaseText>
                <button
                    onClick={() => router.push("/find-artist-profile")}
                    className="mt-4 px-4 py-2 bg-[#FA6400] rounded-lg hover:bg-[#ff7f32]"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const profile_image = artist?.profile_picture_url
        ? getImageUrl(artist.profile_picture_url)
        : getImageUrl(DEFAULT_PROFILE_IMAGE);

    const cover_image = artist?.cover_photo_url
        ? getImageUrl(artist.cover_photo_url)
        : getImageUrl(DEFAULT_PROFILE_IMAGE);

    return (
        <div className="min-h-screen bg-[#1a1625] text-white flex flex-col">
            {/* HEADER */}
            <header className="w-full bg-[#1a1625]/90 backdrop-blur-md py-4 px-8 flex items-center justify-between fixed top-0 left-0 z-50">
                {/* Left: Logo */}
                <div className="flex items-center gap-2">
                    <img
                        src={getLogoUrl()}
                        alt="SoundSpire Logo"
                        width={32}
                        height={32}
                        className="object-contain"
                    />
                </div>

                {/* Navigation Buttons */}
                <nav className="flex items-center gap-8">
                    <button className="text-[#FA6400] font-semibold">
                        Home
                    </button>
                    <button className="hover:text-[#FA6400] transition">
                        Artist Forum
                    </button>
                    <button 
                        onClick={() => artist?.community?.community_id && router.push(`/community/${artist.community.community_id}/all-chat`)}
                        className={`hover:text-[#FA6400] transition ${!artist?.community?.community_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!artist?.community?.community_id}
                    >
                        All Chat
                    </button>
                    <button 
                        onClick={() => artist?.community?.community_id && router.push(`/community/${artist.community.community_id}/fan-art`)}
                        className={`hover:text-[#FA6400] transition ${!artist?.community?.community_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!artist?.community?.community_id}
                    >
                        Fan Art
                    </button>
                    <button className="hover:text-[#FA6400] transition">
                        Suggestions
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="px-6 py-2 bg-[#FA6400] hover:bg-[#e55a00] text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
                    >
                        Logout
                    </button>
                </nav>

                {/* Community Name */}
                {artist.community?.name ? (
                    <BaseText
                        wrapper="span"
                        textColor="#9ca3af"
                        fontStyle="italic"
                        fontWeight={500}
                    >
                        {artist.community.name}
                    </BaseText>
                ) : (
                    <BaseText
                        wrapper="span"
                        textColor="#6b7280"
                        fontStyle="italic"
                    >
                        No Community
                    </BaseText>
                )}
            </header>

            {/* COVER SECTION */}
            <div className="relative w-full flex justify-center items-center mt-28 mb-16 px-8 bg-[#1a1625]">
                {/* Cover Image Block */}
                <div
                    className="relative w-[85%] h-[450px] rounded-2xl overflow-hidden shadow-2xl"
                    style={{
                        backgroundImage: `url(${cover_image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1625]/80 via-transparent to-[#1a1625]/30"></div>

                    {/* Artist Name */}
                    <div className="absolute top-6 right-6 z-10">
                        <BaseHeading
                            headingLevel="h1"
                            fontSize="large"
                            fontWeight={700}
                            className=" bg-[#1a1625]/70 px-5 py-2 rounded-lg"
                        >
                            {artist.artist_name}
                        </BaseHeading>
                    </div>
                </div>

                {/* Social Icons Beside Cover */}
                {artist.socials && artist.socials.length > 0 && (
                    <div
                        className="
                            absolute 
                            right-[6%]
                            top-1/2 
                            -translate-y-1/2 
                            flex flex-col 
                            gap-5 
                            z-30
                        "
                    >
                        {artist.socials.map((s, i) => {
                            let Icon: any = null;
                            switch (s.platform.toLowerCase()) {
                                case "youtube":
                                    Icon = FaYoutube;
                                    break;
                                case "instagram":
                                    Icon = FaInstagram;
                                    break;
                                case "twitter":
                                case "x":
                                    Icon = FaXTwitter;
                                    break;
                                case "facebook":
                                    Icon = FaFacebook;
                                    break;
                                case "tiktok":
                                    Icon = FaTiktok;
                                    break;
                                default:
                                    return null;
                            }
                            return (
                                <a
                                    key={i}
                                    href={s.url}
                                    target="_blank"
                                    className="text-white hover:text-[#FA6400] transition text-3xl"
                                >
                                    <Icon />
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* MAIN CONTENT */}
            <div className="flex flex-col items-center px-8 py-16 bg-[#1a1625]">
                <div className="w-[85%] flex flex-col space-y-10">
                    {/* About Section */}
                    <div className="p-8 rounded-2xl bg-[#1a1625]">
                        <BaseHeading
                            fontWeight={600}
                            fontSize="normal"
                            className="mb-3"
                        >
                            About
                        </BaseHeading>
                        {artist.bio ? (
                            <div
                                className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: artist.bio }}
                            />
                        ) : (
                            <BaseText
                                textColor="#d1d5db"
                                className="leading-relaxed"
                            >
                                No bio available yet.
                            </BaseText>
                        )}
                    </div>

                    {/* Community Section */}
                    {artist.community && (
                        <div className="p-8 rounded-2xl bg-[#1a1625]">
                            <BaseHeading
                                fontSize="normal"
                                fontWeight={600}
                                className="mb-3"
                            >
                                Highlights of Community
                            </BaseHeading>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    "Be a part of the TRIBE",
                                    "Get Access to the Screens",
                                    "Tap into the Global Community",
                                ].map((title, idx) => (
                                    <div
                                        key={idx}
                                        className="relative h-64 rounded-xl overflow-hidden shadow-lg"
                                        style={{
                                            backgroundImage: `url(${default_image_link})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1625]/90 via-transparent to-[#1a1625]/30"></div>
                                        <div className="absolute bottom-4 right-4 z-10">
                                            <BaseHeading
                                                headingLevel="h1"
                                                fontSize="small"
                                                fontWeight={600}
                                                className=" bg-[#1a1625]/70 px-3 py-2 rounded-lg"
                                            >
                                                {title}
                                            </BaseHeading>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Artist Profile Section */}
                    <div className="p-8 rounded-2xl bg-[#1a1625] flex flex-col">
                        <BaseHeading
                            headingLevel="h2"
                            fontSize="normal"
                            fontWeight={600}
                            className="mb-3"
                        >
                            Artist Profile
                        </BaseHeading>
                        <div className="w-48 h-48 rounded-xl overflow-hidden relative">
                            <img
                                src={profile_image}
                                alt="Artist"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Reviews Section - SoundSpire Team */}
                    <div className="p-8 rounded-2xl bg-[#1a1625] flex flex-col">
                        <BaseHeading
                            headingLevel="h2"
                            fontSize="small"
                            fontWeight={600}
                            className="mb-6"
                        >
                            Reviews by the Sound Spire Team
                        </BaseHeading>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="bg-[#221c2f] border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition"
                                >
                                    {/* Artist Review image */}
                                    <div className="w-48 h-48 rounded-xl overflow-hidden">
                                        <img
                                            src={profile_image}
                                            alt="Artist profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Review text */}
                                    <BaseText
                                        textColor="#d1d5db"
                                        fontSize="small"
                                        textAlign="left"
                                        className="mb-4"
                                    >
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit. Sed feugiat nunc vitae
                                        mi facilisis, sit amet sodales velit
                                        luctus.
                                    </BaseText>

                                    {/* Reviewer */}
                                    <BaseText
                                        textColor="#fa6400"
                                        fontSize="very small"
                                        textAlign="left"
                                        fontWeight={500}
                                    >
                                        Ashish Paul • 20 Dec
                                    </BaseText>

                                    {/* Button */}
                                    <button className="bg-[#FA6400] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#ff832e] transition text-left">
                                        Read More
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
