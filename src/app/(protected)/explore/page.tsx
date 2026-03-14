/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import ExploreCarousel from "@/components/ExploreCarousel";
import Link from "next/link";
import SearchDropdown from "@/components/ui/SearchDropdown";
import { getFontClass } from "@/utils/getFontClass";
import { ArtistAttributes } from "@/models/Artist";

interface Review {
    review_id: string;
    title: string;
    text_content: string;
    rating: number;
    image_urls: string[];
    created_at: string;
    user: {
        user_id: string;
        username: string;
        full_name: string;
        profile_picture_url: string;
    };
    artist: {
        artist_id: string;
        artist_name: string;
        profile_picture_url: string;
        slug?: string;
    };
}

interface Genre {
    genre_id: string;
    name: string;
}
type Artist = Pick<
    ArtistAttributes,
    | "artist_name"
    | "bio"
    | "cover_photo_url"
    | "profile_picture_url"
    | "slug"
    | "artist_id"
>;
const carouselItems = [
    {
        title: "INDIE FOLK MUSIC COLLECTION",
        description:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
        price: "49.99$$",
        image: getImageUrl(DEFAULT_PROFILE_IMAGE),
    },
    {
        title: "ELECTRONIC BEATS VOL. 2",
        description:
            "Experience the cutting edge of electronic music with our latest collection",
        price: "39.99$$",
        image: getImageUrl(DEFAULT_PROFILE_IMAGE),
    },
    {
        title: "JAZZ CLASSICS REMASTERED",
        description:
            "Timeless jazz recordings remastered for the modern audiophile",
        price: "59.99$$",
        image: getImageUrl(DEFAULT_PROFILE_IMAGE),
    },
];

export default function ExplorePage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [suggestedArtists, setSuggestedArtists] = useState<any[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAllArtists, setShowAllArtists] = useState(false);
    const [allArtists, setAllArtists] = useState<any[]>([]);
    const { user } = useAuth();
    const router = useRouter();
    const montserrat = getFontClass("montserrat");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetches: Promise<Response>[] = [
                    fetch("/api/explore/reviews"),
                    fetch("/api/explore/artists"),
                    fetch("/api/explore/genres"),
                ];
                if (user?.id) {
                    fetches.push(fetch(`/api/explore/suggested?userId=${user.id}`));
                }
                const [reviewsRes, artistsRes, genresRes, suggestedRes] = await Promise.all(fetches);
                if (reviewsRes.ok) setReviews(await reviewsRes.json());
                if (artistsRes.ok) setArtists(await artistsRes.json());
                if (genresRes.ok) setGenres(await genresRes.json());
                if (suggestedRes?.ok) {
                    const suggestedData = await suggestedRes.json();
                    setSuggestedArtists(suggestedData.artists || []);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.id]);

    return (
        <div className="min-h-screen">
            <main className="md:ml-[54px] px-4 md:px-8 py-6">
                {/* Header: Title + Search */}
                <div className="flex flex-col md:flex-row items-start md:items-center mb-8 gap-4">
                    <h1 className={`${montserrat} text-[#FFD3C9] text-[32px] md:text-[47px] font-bold leading-[40px] md:leading-[56px] flex-shrink-0`}>
                        Explore
                    </h1>
                    <div className="flex-1 flex justify-center">
                        <div className="w-full max-w-[437px]" style={{ marginRight: "300px" }}>
                            <SearchDropdown apiEndpoint="/api/search" placeholder="Search artists, reviews, communities..." />
                        </div>
                    </div>
                </div>

                <ExploreCarousel items={carouselItems} />

                {/* Suggested Artists */}
                <section className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`${montserrat} text-[#FFD3C9] text-[28px] md:text-[47px] font-bold leading-[36px] md:leading-[56px]`}>
                            SUGGESTED ARTISTS
                        </h2>
                        <button
                            onClick={async () => {
                                if (!showAllArtists && allArtists.length === 0) {
                                    try {
                                        const [dbRes, sugRes] = await Promise.all([
                                            fetch("/api/explore/artists?q="),
                                            user?.id ? fetch(`/api/explore/suggested?userId=${user.id}`) : Promise.resolve(null),
                                        ]);
                                        const dbData = dbRes.ok ? await dbRes.json() : [];
                                        const sugData = sugRes?.ok ? (await sugRes.json()).artists || [] : [];
                                        const sugIds = new Set(sugData.map((a: any) => a.artist_id));
                                        const merged = [...sugData, ...dbData.filter((a: any) => !sugIds.has(a.artist_id)).map((a: any) => ({
                                            artist_id: a.artist_id, name: a.artist_name, imageUrl: a.profile_picture_url, slug: a.slug, onSoundSpire: true,
                                        }))];
                                        setAllArtists(merged);
                                    } catch { /* ignore */ }
                                }
                                setShowAllArtists(!showAllArtists);
                            }}
                            className={`${montserrat} text-[#F7F7F7] text-[16px] font-medium hover:text-[#FFD3C9] transition-colors`}
                        >
                            {showAllArtists ? "Show Less" : "See More"}
                        </button>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                        </div>
                    ) : showAllArtists ? (
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 pb-4">
                            {allArtists.map((artist: any) => {
                                const href = artist.onSoundSpire === false
                                    ? `/community/sc/${artist.soundcharts_uuid}`
                                    : `/community/${artist.slug}/`;
                                const imgSrc = getImageUrl(artist.imageUrl || artist.profile_picture_url || DEFAULT_PROFILE_IMAGE);
                                const name = artist.name || artist.artist_name;
                                return (
                                    <Link key={artist.artist_id} className="text-center" href={href}>
                                        <img src={imgSrc} alt={name} className="w-[80px] h-[80px] md:w-[138px] md:h-[138px] rounded-full object-cover mb-2 mx-auto" />
                                        <span className={`${montserrat} text-white text-[16px] font-medium truncate block`}>{name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex gap-6 overflow-x-auto pb-4">
                            {(suggestedArtists.length > 0 ? suggestedArtists : artists).map((artist: any) => {
                                const href = artist.onSoundSpire === false
                                    ? `/community/sc/${artist.soundcharts_uuid}`
                                    : `/community/${artist.slug}/`;
                                const imgSrc = getImageUrl(artist.imageUrl || artist.profile_picture_url || DEFAULT_PROFILE_IMAGE);
                                const name = artist.name || artist.artist_name;
                                return (
                                    <Link key={artist.artist_id} className="flex-shrink-0 text-center" href={href}>
                                        <img src={imgSrc} alt={name} className="w-[80px] h-[80px] md:w-[138px] md:h-[138px] rounded-full object-cover mb-2" />
                                        <span className={`${montserrat} text-white text-[16px] font-medium max-w-[138px] truncate block`}>{name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Reviews */}
                <section className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`${montserrat} text-[#FFD3C9] text-[28px] md:text-[47px] font-bold leading-[36px] md:leading-[56px]`}>
                            REVIEWS
                        </h2>
                        <Link href="/reviews" className={`${montserrat} text-[#F7F7F7] text-[16px] font-medium hover:text-[#FFD3C9] transition-colors`}>
                            See All
                        </Link>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.slice(0, 3).map((review) => (
                                <div
                                    key={review.review_id}
                                    className="flex flex-col bg-[#1e1529] rounded-[13px] overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                >
                                    <img
                                        src={review.image_urls?.length > 0 ? review.image_urls[0] : getImageUrl(DEFAULT_PROFILE_IMAGE)}
                                        alt={review.title}
                                        className="w-[calc(100%-32px)] h-[288px] object-cover rounded-lg border border-[#F7F7F7] mx-auto mt-4"
                                    />
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <p className={`${montserrat} text-[#F7F7F7] text-[16px] font-bold leading-[19px] mb-2 line-clamp-3`}>
                                                {review.title}
                                            </p>
                                            <p className={`${montserrat} text-[#FF7151] text-[16px] font-medium leading-[19px] mb-2`}>
                                                {review.artist?.slug ? (
                                                    <a href={`/community/${review.artist.slug}`} className="hover:text-[#FF4E27] transition">
                                                        {review.artist?.artist_name || "Unknown Artist"}
                                                    </a>
                                                ) : (
                                                    review.artist?.artist_name || "Unknown Artist"
                                                )}
                                            </p>
                                            <p className={`${montserrat} text-[#d1d5db] text-[14px] line-clamp-3 mb-4`}>
                                                {review.text_content.length > 100
                                                    ? `${review.text_content.substring(0, 100)}...`
                                                    : review.text_content}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/reviews/${review.review_id}`}
                                            className={`${montserrat} mt-auto bg-[#FF4E27] hover:bg-[#e5431f] text-[#F7F7F7] px-4 py-2.5 rounded-[5px] text-[16px] font-medium w-fit inline-block`}
                                        >
                                            Read More
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Discover by Genre */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`${montserrat} text-[#FFD3C9] text-[28px] md:text-[47px] font-bold leading-[36px] md:leading-[56px]`}>
                            DISCOVER BY GENRE
                        </h2>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {genres.map((genre) => (
                                <div
                                    key={genre.genre_id}
                                    className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#2d2838] cursor-pointer hover:scale-105 transition-transform duration-200"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <img
                                        src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
                                        alt={genre.name}
                                        className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                                    />
                                    <div className="absolute bottom-4 left-4">
                                        <h3 className={`${montserrat} text-white text-[20px] font-bold`}>
                                            {genre.name.toUpperCase()}
                                        </h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
