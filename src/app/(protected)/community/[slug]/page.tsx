"use client";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArtistData } from "@/app/(artist)/artist/dashboard/page";
import toast from "react-hot-toast";
import BaseText from "@/components/BaseText/BaseText";
import { sanitizeURL } from "@/utils/sanitizeURL";
import {
    getDefaultProfileImageUrl,
    getImageUrl,
} from "@/utils/userProfileImageUtils";
import { useAuth } from "@/context/AuthContext";
import { communitySubscriptionData } from "@/types/communitySubscription";
import styles from "./community_profile.module.css";
import Navbar from "@/components/Navbar";
import { FaFacebook, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { IconType } from "react-icons/lib";
const default_image = getDefaultProfileImageUrl();
export default function ArtistCommunityProfile() {
    const params = useParams();
    const slug = params.slug;
    const [artist, setArtist] = useState<ArtistData | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingSubscription, setSavingSubscription] = useState(false);

    const [alreadySubscribed, setAlreadySubscribed] = useState(false);
    const { user } = useAuth();
    useEffect(() => {
        if (!slug || !user) return;
        (async () => {
            try {
                const res = await fetch(`/api/community/${slug}`);
                if (!res.ok) throw new Error("Error fetching Artist!!!!");
                const json = await res.json();
                setArtist(json.artist);
            } catch (err: any) {
                toast.error(err.message || "Failed to load profile");
            }
        })();
    }, [slug, user]);
    useEffect(() => {
        if (!artist || !user) return;
        (async () => {
            try {
                const res = await fetch(
                    `/api/community/subscribe?community_id=${artist.community?.community_id}&user_id=${user.id}`
                );
                if (!res.ok)
                    throw new Error("Error fetching subscription data!!!!");
                const json = await res.json();
                setAlreadySubscribed(json.subscribed);
            } catch (err: any) {
                toast.error(err.message || "Failed to load subscription data");
            } finally {
                setLoading(false);
            }
        })();
    }, [artist, user]);

    if (!user)
        return (
            <>
                <div>
                    <BaseHeading>User not found...</BaseHeading>
                </div>
            </>
        );
    if (loading) {
        return (
            <>
                <div className="w-full pl-[var(--navbar-collapsed)] h-dvh flex items-center justify-center flex-col gap-2">
                    <div className="flex justify-center items-center w-32 h-32">
                        <div className="animate-spin rounded-full h-full w-full border-b-2 border-purple-500"></div>
                    </div>
                    <BaseHeading>Loading...</BaseHeading>
                </div>
            </>
        );
    }
    if (!artist) {
        return (
            <>
                <div className="min-h-screen bg-[#1a1625] text-white flex flex-col items-center justify-center">
                    <BaseText>No artist data found.</BaseText>
                </div>
            </>
        );
    }
    const artistImage = artist.profile_picture_url
        ? getImageUrl(artist.profile_picture_url)
        : getDefaultProfileImageUrl();
    const profile_image = sanitizeURL(artistImage);
    const unsubscribe = async () => {
        setSavingSubscription(true);
        try {
            const res = await fetch(
                `/api/community/subscribe?user_id=${user.id}&community_id=${artist.community?.community_id}`,
                {
                    method: "DELETE",
                }
            );
            if (!res.ok)
                throw new Error("Error trying to fetch route for delete");
            const data = await res.json();
            if (!data.subscribed) {
                setAlreadySubscribed(false);
            }
        } catch (err) {
            toast.error(`Error trying to unsubscribe: ${err}`);
        } finally {
            setSavingSubscription(false);
        }
    };
    const subscribe = async () => {
        if (!artist.community) return;
        setSavingSubscription(true);
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(now.getMonth() + 1);
        const post: communitySubscriptionData = {
            auto_renew: true,
            community_id: artist.community.community_id,
            created_at: now.toISOString(),
            end_date: endDate.toISOString(),
            is_active: true,
            payment_id: null,
            start_date: now.toISOString(),
            updated_at: now.toISOString(),
            user_id: user.id,
        };
        try {
            const res = await fetch("/api/community/subscribe", {
                method: "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(post),
            });
            if (!res.ok) {
                console.error(`Request failed: ${res.status}`);
            }
            const data = await res.json();
            if (data.subscription) {
                setAlreadySubscribed(true);
            }
        } catch (err: any) {
            toast.error(
                err.message || "Error trying to fetch the subscription route "
            );
        } finally {
            setSavingSubscription(false);
        }
    };
    const handleSubscribe = async () => {
        if (savingSubscription) return;
        if (alreadySubscribed) {
            await unsubscribe();
        } else {
            await subscribe();
        }
    };
    const cover_image = getImageUrl(artist.cover_photo_url);
    const buttonText =
        savingSubscription && !alreadySubscribed
            ? "Subscribing..."
            : savingSubscription && alreadySubscribed
            ? "Unsubscribing..."
            : alreadySubscribed
            ? `Unsubscribe from ${
                  artist.community
                      ? `the ${artist.community.name} community`
                      : `${artist.artist_name}'s community`
              }`
            : `Subscribe to ${
                  artist.community
                      ? `the ${artist.community.name} community`
                      : `${artist.artist_name}'s community`
              }`;
    return (
        <>
            <div className="min-h-screen bg-[#1a1625] text-white flex flex-col">
                {/* HEADER */}
                <header className="w-full bg-[#1a1625]/90 backdrop-blur-md py-4 px-8 flex items-center justify-center fixed top-0 left-0 z-50">
                    {/* Navigation Buttons */}
                    <nav className="flex items-center justify-center gap-8 ml-auto">
                        <button className="text-[#FA6400] font-semibold">
                            <BaseText
                                wrapper="span"
                                textColor="inherit"
                                fontSize="normal"
                            >
                                About
                            </BaseText>
                        </button>
                        <button className="hover:text-[#FA6400] transition">
                            <BaseText
                                wrapper="span"
                                textColor="inherit"
                                fontSize="normal"
                            >
                                Artist Forum
                            </BaseText>
                        </button>
                        <button className="hover:text-[#FA6400] transition">
                            <BaseText
                                wrapper="span"
                                textColor="inherit"
                                fontSize="normal"
                            >
                                All Chat
                            </BaseText>
                        </button>
                        <button className="hover:text-[#FA6400] transition">
                            <BaseText
                                wrapper="span"
                                textColor="inherit"
                                fontSize="normal"
                            >
                                Fan Art
                            </BaseText>
                        </button>
                        <button className="hover:text-[#FA6400] transition">
                            <BaseText
                                wrapper="span"
                                textColor="inherit"
                                fontSize="normal"
                            >
                                Suggestions
                            </BaseText>
                        </button>
                    </nav>

                    {/* Community Name */}
                    {artist.community?.name ? (
                        <BaseText
                            wrapper="span"
                            textColor="#9ca3af"
                            fontStyle="italic"
                            fontWeight={500}
                            className="ml-auto"
                        >
                            {artist.community.name}
                        </BaseText>
                    ) : (
                        <BaseText
                            wrapper="span"
                            className="ml-auto"
                            textColor="#6b7280"
                            fontStyle="italic"
                        >
                            No Community
                        </BaseText>
                    )}
                </header>
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
                                fontSize="heading"
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
                                let Icon: IconType | null = null;
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
                                        href={`/${s.url}`}
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
                                fontSize="sub heading"
                                className="mb-3"
                                headingLevel="h2"
                            >
                                About
                            </BaseHeading>
                            {artist.bio ? (
                                <BaseText
                                    className="leading-relaxed prose prose-invert max-w-none"
                                    textColor="#d1d5db"
                                    fontSize="normal"
                                >
                                    {artist.bio}
                                </BaseText>
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
                                    fontWeight={600}
                                    className="mb-3"
                                    headingLevel="h2"
                                    fontSize="sub heading"
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
                                                backgroundImage: `url(${default_image})`,
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
                                fontSize="sub heading"
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
                                fontSize="sub heading"
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
                                            Lorem ipsum dolor sit amet,
                                            consectetur adipiscing elit. Sed
                                            feugiat nunc vitae mi facilisis, sit
                                            amet sodales velit luctus.
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
            <div className={styles["subscribe-banner"]}>
                <button
                    disabled={savingSubscription}
                    className={`${styles.button} ${
                        alreadySubscribed
                            ? styles.unsubscribe
                            : styles.subscribe
                    }`}
                    onClick={handleSubscribe}
                >
                    <BaseText
                        wrapper="span"
                        textColor={"#f0f0f0"}
                        fontName="inter"
                        fontSize="normal"
                    >
                        {buttonText}
                    </BaseText>
                </button>
            </div>
        </>
    );
}
