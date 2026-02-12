/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import BaseText from "@/components/BaseText/BaseText";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";

interface ArtistInfo {
    name: string;
    imageUrl: string | null;
    biography: string | null;
    genres: any[];
    countryCode: string | null;
}

export default function SoundChartsArtistPage() {
    const params = useParams();
    const uuid = params.uuid as string;
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [artist, setArtist] = useState<ArtistInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [voteCount, setVoteCount] = useState(0);
    const [userVoted, setUserVoted] = useState(false);
    const [voting, setVoting] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace("/login");
        }
    }, [authLoading, user, router]);

    // Fetch artist from SoundCharts
    useEffect(() => {
        if (!uuid || !user) return;
        (async () => {
            try {
                const res = await fetch(`/api/artists/${uuid}`);
                if (res.ok) {
                    const data = await res.json();
                    setArtist(data);
                }
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        })();
    }, [uuid]);

    // Fetch vote data
    useEffect(() => {
        if (!uuid) return;
        (async () => {
            try {
                const url = `/api/artist-vote?soundcharts_uuid=${uuid}${user?.id ? `&userId=${user.id}` : ""}`;
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    setVoteCount(data.count);
                    setUserVoted(data.userVoted);
                }
            } catch {
                // ignore
            }
        })();
    }, [uuid, user?.id]);

    const handleVote = async () => {
        if (!user) {
            toast.error("Please log in to vote");
            return;
        }
        if (userVoted) return;
        setVoting(true);
        try {
            const res = await fetch("/api/artist-vote", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    soundcharts_uuid: uuid,
                    artist_name: artist?.name,
                    image_url: artist?.imageUrl,
                    userId: user.id,
                }),
            });
            if (res.ok) {
                const data = await res.json();
                setVoteCount(data.count);
                setUserVoted(true);
                toast.success("Vote recorded!");
            }
        } catch {
            toast.error("Failed to vote");
        } finally {
            setVoting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-[#1a1625] text-white flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
                </div>
            </>
        );
    }

    if (!artist) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-[#1a1625] text-white flex items-center justify-center">
                    <BaseText>Artist not found.</BaseText>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="h-screen flex flex-col bg-[#1a1625] text-white overflow-hidden">
                {/* Banner + Profile photo */}
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => router.push("/explore")}
                        className="absolute top-4 left-20 z-20 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/60 transition"
                    >
                        <FaArrowLeft className="text-white" />
                    </button>
                    {/* Cover banner — artist image blurred, or gradient fallback */}
                    <div className="h-44 overflow-hidden relative">
                        {artist.imageUrl ? (
                            <>
                                <img src={artist.imageUrl} alt="" className="w-full h-full object-cover scale-110 blur-xl brightness-50" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a1625]" />
                            </>
                        ) : (
                            <div className="w-full h-full bg-gradient-to-b from-purple-900/40 to-[#1a1625]" />
                        )}
                    </div>
                    {/* Profile photo */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#1a1625] bg-gray-700 shadow-xl">
                            {artist.imageUrl ? (
                                <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                                    {artist.name.charAt(0)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scrollable middle — name, genres, bio */}
                <div className="flex-1 min-h-0 overflow-y-auto pt-20 px-6">
                    <div className="max-w-2xl mx-auto text-center space-y-4 pb-6">
                        <BaseHeading fontSize="large" fontWeight={700}>
                            {artist.name}
                        </BaseHeading>

                        {artist.genres?.length > 0 && (
                            <div className="flex justify-center gap-2 flex-wrap">
                                {artist.genres.map((g: any, i: number) => (
                                    <span key={i} className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs">
                                        {typeof g === "string" ? g : g.root || g.name || "Genre"}
                                    </span>
                                ))}
                            </div>
                        )}

                        {artist.biography && (
                            <p className="text-gray-400 text-sm leading-relaxed text-left whitespace-pre-line">
                                {artist.biography}
                            </p>
                        )}
                    </div>
                </div>

                {/* Fixed bottom — vote section */}
                <div className="flex-shrink-0 border-t border-gray-700/50 bg-[#1a1625] px-6 py-4">
                    <div className="max-w-2xl mx-auto space-y-2">
                        <p className="text-gray-500 text-xs text-center">
                            This artist is not yet on SoundSpire. Community features are not available.
                        </p>
                        <button
                            onClick={handleVote}
                            disabled={userVoted || voting}
                            className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                                userVoted
                                    ? "bg-green-600/20 border border-green-500/40 text-green-400 cursor-default"
                                    : "bg-orange-500 hover:bg-orange-600 text-white"
                            }`}
                        >
                            {voting
                                ? "Voting..."
                                : userVoted
                                ? `✓ Voted · ${voteCount} ${voteCount === 1 ? "vote" : "votes"}`
                                : `⭐ Vote for ${artist.name} to be on SoundSpire`}
                        </button>
                        {!userVoted && voteCount > 0 && (
                            <p className="text-gray-400 text-xs text-center">
                                {voteCount} {voteCount === 1 ? "vote" : "votes"} so far
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
