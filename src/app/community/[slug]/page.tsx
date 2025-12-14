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
export default function ArtistCommunityProfile() {
    const params = useParams();
    const slug = params.slug;
    const [artist, setArtist] = useState<ArtistData | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);
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
            <div>
                <BaseHeading>User not found...</BaseHeading>
            </div>
        );
    if (loading) {
        return (
            <div>
                <BaseHeading>Loading...</BaseHeading>
            </div>
        );
    }
    if (!artist) {
        return (
            <div className="min-h-screen bg-[#1a1625] text-white flex flex-col items-center justify-center">
                <BaseText>No artist data found.</BaseText>
            </div>
        );
    }
    const artistImage = artist.profile_picture_url
        ? getImageUrl(artist.profile_picture_url)
        : getDefaultProfileImageUrl();
    const sanitizedArtistImage = sanitizeURL(artistImage);

    const handleSubscribe = async () => {
        if (subscribing || alreadySubscribed) return;
        if (!artist.community) return;
        setSubscribing(true);
        const post: communitySubscriptionData = {
            auto_renew: true,
            community_id: artist.community.community_id,
            created_at: new Date().toISOString(),
            end_date: new Date().toISOString(),
            is_active: true,
            payment_id: null,
            start_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
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
            setSubscribing(false);
        }
    };
    return (
        <div className="p-4 flex w-full h-full min-h-dvh items-center justify-center ">
            <div className="p-4 flex flex-col items-center justify-center w-[50%] min-w-[300px] gap-4 rounded-lg border border-gray-800 bg-[#191919]">
                <div className="p-4 flex flex-col items-center justify-center gap-4">
                    <img
                        src={sanitizedArtistImage}
                        className="w-48 h-48 object-cover"
                    ></img>

                    <BaseHeading
                        fontName="inter"
                        fontSize="sub heading"
                        headingLevel="h1"
                        textColor="#f0f0f0"
                    >
                        {artist.artist_name}
                    </BaseHeading>
                </div>
                <div className="flex flex-col items-start justify-center gap-2 w-full">
                    <div className="w-full h-full border-b-2 border-b-[#ff4e27]">
                        <BaseText
                            wrapper="span"
                            fontName="inter"
                            fontSize="large"
                            textColor="#f0f0f0"
                        >
                            Bio
                        </BaseText>
                    </div>
                    <div className="p-4">
                        <BaseText
                            wrapper="p"
                            fontName="inter"
                            fontSize="normal"
                            textColor="#f0f0f0"
                        >
                            {artist.bio}
                        </BaseText>
                    </div>
                </div>
                <div className="flex flex-col items-start justify-center gap-2 w-full">
                    <div className="w-full h-full border-b-2 border-b-[#ff4e27]">
                        <BaseText
                            wrapper="span"
                            fontName="inter"
                            fontSize="large"
                            textColor="#f0f0f0"
                        >
                            Community
                        </BaseText>
                    </div>
                    <div className="p-4">
                        <BaseText
                            wrapper="p"
                            fontName="inter"
                            fontSize="normal"
                            textColor="#f0f0f0"
                        >
                            {artist.community?.description ?? (
                                <>
                                    Lorem ipsum dolor sit, amet consectetur
                                    adipisicing elit. Repellat esse non, sunt
                                    eius amet quam perspiciatis reiciendis nobis
                                    asperiores consequuntur dolorem repudiandae
                                    odit velit ullam minus doloremque
                                    consectetur in? Hic?
                                </>
                            )}
                        </BaseText>
                    </div>
                    <button
                        disabled={subscribing}
                        className="ml-auto mr-auto p-4 rounded-lg bg-[#ff4e27] disabled:bg-[#6e2211] transition-all duration-300 ease-out hover:bg-[#ba3a1d] hover:scale-105"
                        onClick={handleSubscribe}
                    >
                        <BaseText
                            wrapper="span"
                            textColor="black"
                            fontName="inter"
                            fontSize="normal"
                        >
                            {subscribing ? (
                                <>Subscribing...</>
                            ) : alreadySubscribed ? (
                                <>You&apos;re already subscribed!</>
                            ) : (
                                <>Subscribe to our community!</>
                            )}
                        </BaseText>
                    </button>
                </div>
            </div>
        </div>
    );
}
