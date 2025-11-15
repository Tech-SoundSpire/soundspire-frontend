"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getImageUrl, DEFAULT_PROFILE_IMAGE } from "@/utils/userProfileImageUtils";
import Image from "next/image";
import { FaYoutube, FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

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
                <p>No artist data found.</p>
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
                    <Image
                        src="/images/logo.png"
                        alt="SoundSpire Logo"
                        width={32}
                        height={32}
                        className="object-contain"
                    />
                </div>

                {/* Navigation Buttons */}
                <nav className="flex items-center gap-8">
                    <button className="text-[#FA6400] font-semibold">Home</button>
                    <button className="hover:text-[#FA6400] transition">Artist Forum</button>
                    <button className="hover:text-[#FA6400] transition">All Chat</button>
                    <button className="hover:text-[#FA6400] transition">Fan Art</button>
                    <button className="hover:text-[#FA6400] transition">Suggestions</button>
                </nav>

                {/* Community Name */}
                {artist.community?.name ? (
                    <span className="text-gray-400 italic font-medium">
                        {artist.community.name}
                    </span>
                ) : (
                    <span className="text-gray-500 italic">No Community</span>
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
                        <h1 className="text-3xl md:text-4xl font-bold bg-[#1a1625]/70 px-5 py-2 rounded-lg">
                            {artist.artist_name}
                        </h1>
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
                                case "youtube": Icon = FaYoutube; break;
                                case "instagram": Icon = FaInstagram; break;
                                case "twitter":
                                case "x": Icon = FaXTwitter; break;
                                case "facebook": Icon = FaFacebook; break;
                                case "tiktok": Icon = FaTiktok; break;
                                default: return null;
                            }
                            return (
                                <a key={i} href={s.url} target="_blank"
                                    className="text-white hover:text-[#FA6400] transition text-3xl">
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
                        <h2 className="text-xl font-semibold mb-3">About</h2>
                        {artist.bio ? (
                            <div
                                className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: artist.bio }}
                            />
                        ) : (
                            <p className="text-gray-300 leading-relaxed">
                                No bio available yet.
                            </p>
                        )}
                    </div>

                    {/* Community Section */}
                    {artist.community && (
                        <div className="p-8 rounded-2xl bg-[#1a1625]">
                            <h2 className="text-xl font-semibold mb-3">
                                Highlights of Community
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    "Be a part of the TRIBE",
                                    "Get Access to the Screens",
                                    "Tap into the Global Community"
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
                                            <h1 className="text-lg font-semibold bg-[#1a1625]/70 px-3 py-2 rounded-lg">
                                                {title}
                                            </h1>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Artist Profile Section */}
                    <div className="p-8 rounded-2xl bg-[#1a1625] flex flex-col">
                        <h2 className="text-xl font-semibold mb-3">
                            Artist Profile
                        </h2>
                        <div className="w-48 h-48 rounded-xl overflow-hidden">
                            <img src={profile_image} alt="Artist profile" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    {/* Reviews Section - SoundSpire Team */}
                    <div className="p-8 rounded-2xl bg-[#1a1625] flex flex-col">
                        <h2 className="text-xl font-semibold mb-6">Reviews by the Sound Spire Team</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="bg-[#221c2f] border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition"
                                >
                                    {/* Artist Review image */}
                                    <div className="w-28 h-28 mx-auto rounded-xl overflow-hidden mb-4">
                                        <img
                                            src={profile_image}
                                            alt="Artist"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Review text */}
                                    <p className="text-gray-300 text-sm leading-relaxed mb-4 text-left">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat nunc
                                        vitae mi facilisis, sit amet sodales velit luctus.
                                    </p>

                                    {/* Reviewer */}
                                    <p className="text-[#FA6400] text-xs mb-4 text-left font-medium">
                                        Ashish Paul • 20 Dec
                                    </p>

                                    {/* Button */}
                                    <button
                                        className="bg-[#FA6400] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#ff832e] transition text-left"
                                    >
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
