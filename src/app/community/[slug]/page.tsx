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
    getLogoUrl,
} from "@/utils/userProfileImageUtils";
import { useAuth } from "@/context/AuthContext";
import { communitySubscriptionData } from "@/types/communitySubscription";
import styles from "./community_profile.module.css";
import Navbar from "@/components/Navbar";
import CommunityHeader from "@/components/CommunityHeader";
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
                <Navbar></Navbar>
                <div>
                    <BaseHeading>User not found...</BaseHeading>
                </div>
            </>
        );
    if (loading) {
        return (
            <>
                <Navbar></Navbar>
                <div>
                    <BaseHeading>Loading...</BaseHeading>
                </div>
            </>
        );
    }
    if (!artist) {
        return (
            <>
                <Navbar></Navbar>

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
        endDate.setMonth(endDate.getMonth() + 1); // Add 1 month
        
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
    const isOwnCommunity = !!(user?.isAlsoArtist && artist?.artist_id && user?.artistId === artist?.artist_id);
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
            <Navbar></Navbar>
            <div className="min-h-screen bg-[#1a1625] text-white flex flex-col">
                <CommunityHeader
                    slug={slug as string}
                    communityName={artist.community?.name}
                    isSubscribed={alreadySubscribed}
                    currentPage="about"
                />
                <div className="relative w-full mt-16">
                    {/* Cover image - full width */}
                    <div className="w-full h-56 md:h-72 overflow-hidden">
                        <img
                            src={cover_image}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Profile photo overlapping bottom of cover */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 z-10">
                        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-[#1a1625] overflow-hidden bg-gray-700 shadow-xl">
                            <img src={profile_image} alt={artist.artist_name} className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* Name + Social icons */}
                <div className="mt-20 text-center">
                    <BaseHeading fontSize="large" fontWeight={700}>
                        {artist.artist_name}
                    </BaseHeading>
                    {artist.community?.name && (
                        <BaseText textColor="#9ca3af" fontSize="small" fontStyle="italic" className="mt-1">
                            {artist.community.name}
                        </BaseText>
                    )}
                    {artist.socials && artist.socials.length > 0 && (
                        <div className="flex justify-center gap-4 mt-3">
                            {artist.socials.map((s, i) => {
                                let Icon: IconType | null = null;
                                switch (s.platform.toLowerCase()) {
                                    case "youtube": Icon = FaYoutube; break;
                                    case "instagram": Icon = FaInstagram; break;
                                    case "twitter": case "x": Icon = FaXTwitter; break;
                                    case "facebook": Icon = FaFacebook; break;
                                    case "tiktok": Icon = FaTiktok; break;
                                    default: return null;
                                }
                                return (
                                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#FA6400] transition text-2xl">
                                        <Icon />
                                    </a>
                                );
                            })}
                        </div>
                    )}
                </div>
                {/* MAIN CONTENT */}
                <div className="max-w-4xl w-full mx-auto px-6 py-8 space-y-8">
                    {/* About */}
                    <div className="p-6 rounded-2xl bg-[#221c2f] border border-gray-800">
                        <BaseHeading fontWeight={600} fontSize="normal" className="mb-3">About</BaseHeading>
                        {artist.bio ? (
                            <BaseText className="leading-relaxed" textColor="#d1d5db" fontSize="normal">
                                {artist.bio}
                            </BaseText>
                        ) : (
                            <BaseText textColor="#6b7280">No bio available yet.</BaseText>
                        )}
                    </div>

                    {/* Community Highlights */}
                    {artist.community && (
                        <div className="p-6 rounded-2xl bg-[#221c2f] border border-gray-800">
                            <BaseHeading fontSize="normal" fontWeight={600} className="mb-3">Community Highlights</BaseHeading>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {["Be a part of the TRIBE", "Get Access to the Screens", "Tap into the Global Community"].map((title, idx) => (
                                    <div key={idx} className="relative h-40 rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-[#1a1625] border border-gray-700 flex items-end p-4">
                                        <BaseText fontWeight={600} fontSize="small">{title}</BaseText>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reviews */}
                    <div className="p-6 rounded-2xl bg-[#221c2f] border border-gray-800">
                        <BaseHeading headingLevel="h2" fontSize="normal" fontWeight={600} className="mb-6">Reviews by the SoundSpire Team</BaseHeading>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-[#1a1625] border border-gray-700 rounded-xl p-5 shadow-lg hover:shadow-xl transition space-y-3">
                                    <div className="w-full h-32 rounded-lg overflow-hidden">
                                        <img src={profile_image} alt="Artist" className="w-full h-full object-cover" />
                                    </div>
                                    <BaseText textColor="#d1d5db" fontSize="small">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat nunc vitae mi facilisis.
                                    </BaseText>
                                    <BaseText textColor="#fa6400" fontSize="very small" fontWeight={500}>
                                        Ashish Paul • 20 Dec
                                    </BaseText>
                                    <button className="bg-[#FA6400] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#ff832e] transition">
                                        Read More
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {!isOwnCommunity && (
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
            )}
        </>
    );
}
