/* eslint-disable @next/next/no-img-element */
"use client";

// import Carousel from '@/components/Carousel';
// import ArtistCard from '@/components/ArtistCard';
// import ReviewCard from '@/components/ReviewCard';
// import GenreCard from '@/components/GenreCard';
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import ExploreCarousel from "@/components/ExploreCarousel";
import BaseHeading from "@/components/BaseHeading/BaseHeading";

import BaseText from "@/components/BaseText/BaseText";
import Link from "next/link";

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
    const { user, setUser } = useAuth();
    const router = useRouter();

    // Fetch data from API
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

                if (reviewsRes.ok) {
                    const reviewsData = await reviewsRes.json();
                    setReviews(reviewsData);
                }

                if (artistsRes.ok) {
                    const artistsData = await artistsRes.json();
                    setArtists(artistsData);
                }

                if (genresRes.ok) {
                    const genresData = await genresRes.json();
                    setGenres(genresData);
                }

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
        <div className="min-h-screen bg-[#1a1625]">
            <main className="ml-16 px-8 py-6">
                {/* Search Bar and Logout */}
                <div className="flex justify-between items-center mb-8">
                    <div className="relative w-full max-w-2xl items-center mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full px-4 py-2 pl-10 rounded-full bg-[#2d2838] text-white focus:outline-none focus:ring-2 focus:ring-[#FF4E27]"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>

                <ExploreCarousel items={carouselItems}></ExploreCarousel>

                {/* Suggested Artists */}
                <section className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <BaseHeading
                            headingLevel="h2"
                            fontSize="large"
                            fontWeight={700}
                            textColor="#ffffff"
                        >
                            SUGGESTED ARTISTS
                        </BaseHeading>
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
                                        // Merge: suggested first, then DB artists not already in suggested
                                        const sugIds = new Set(sugData.map((a: any) => a.artist_id));
                                        const merged = [...sugData, ...dbData.filter((a: any) => !sugIds.has(a.artist_id)).map((a: any) => ({
                                            artist_id: a.artist_id, name: a.artist_name, imageUrl: a.profile_picture_url, slug: a.slug, onSoundSpire: true,
                                        }))];
                                        setAllArtists(merged);
                                    } catch { /* ignore */ }
                                }
                                setShowAllArtists(!showAllArtists);
                            }}
                            className="text-[#FF4E27] hover:text-[#e5431f] text-sm font-medium"
                        >
                            {showAllArtists ? "Show Less" : "See More"}
                        </button>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                    ) : showAllArtists ? (
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 pb-4">
                            {allArtists.map((artist: any) => {
                                const href = artist.onSoundSpire === false
                                    ? `/community/sc/${artist.soundcharts_uuid}`
                                    : `/community/${artist.slug}/`;
                                const imgSrc = artist.imageUrl || artist.profile_picture_url || getImageUrl(DEFAULT_PROFILE_IMAGE);
                                const name = artist.name || artist.artist_name;
                                return (
                                    <Link key={artist.artist_id} className="text-center" href={href}>
                                        <img src={imgSrc} alt={name} className="w-20 h-20 rounded-full object-cover mb-2 mx-auto" />
                                        <BaseText textColor="#ffffff" fontSize="small" fontWeight={500} className="truncate">{name}</BaseText>
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
                                const imgSrc = artist.imageUrl
                                    || artist.profile_picture_url
                                    || getImageUrl(DEFAULT_PROFILE_IMAGE);
                                const name = artist.name || artist.artist_name;
                                return (
                                    <Link
                                        key={artist.artist_id}
                                        className="flex-shrink-0 text-center"
                                        href={href}
                                    >
                                        <img
                                            src={imgSrc}
                                            alt={name}
                                            className="w-24 h-24 rounded-full object-cover mb-2"
                                        />
                                        <BaseText
                                            textColor="#ffffff"
                                            fontSize="small"
                                            fontWeight={500}
                                            className="max-w-24 truncate"
                                        >
                                            {name}
                                        </BaseText>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Reviews */}
                <section className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <BaseHeading
                            headingLevel="h2"
                            fontSize="large"
                            fontWeight={700}
                            textColor="#ffffff"
                        >
                            REVIEWS
                        </BaseHeading>
                        <Link href="/reviews" className="text-[#FF4E27] hover:text-[#e5431f] text-sm font-medium">
                            See More
                        </Link>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.slice(0, 3).map((review) => (
                                <div
                                    key={review.review_id}
                                    className="flex flex-col bg-[#231b32] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative"
                                >
                                    <img
                                        src={
                                            review.image_urls &&
                                            review.image_urls.length > 0
                                                ? review.image_urls[0]
                                                : getImageUrl(
                                                      DEFAULT_PROFILE_IMAGE
                                                  )
                                        }
                                        alt={review.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <BaseHeading
                                                headingLevel="h3"
                                                textColor="#ffffff"
                                                fontWeight={600}
                                                className="mb-1"
                                                fontSize="large"
                                                textAlign="left"
                                            >
                                                {review.title}
                                            </BaseHeading>
                                            <BaseText
                                                fontSize="small"
                                                textColor="#9ca3af"
                                                className="mb-2"
                                            >
                                                {review.artist?.slug ? (
                                                    <a href={`/community/${review.artist.slug}`} className="hover:text-[#FA6400] transition underline">
                                                        {review.artist?.artist_name || "Unknown Artist"}
                                                    </a>
                                                ) : (
                                                    review.artist?.artist_name || "Unknown Artist"
                                                )}
                                            </BaseText>
                                            <BaseText
                                                fontSize="small"
                                                textColor="#d1d5db"
                                                className="line-clamp-3 mb-4"
                                            >
                                                {review.text_content.length > 100
                                                    ? `${review.text_content.substring(0, 100)}...`
                                                    : review.text_content}
                                            </BaseText>
                                        </div>
                                        <button
                                            className="mt-auto bg-[#FF4E27] hover:bg-[#e5431f] text-white px-4 py-2 rounded-lg text-sm font-semibold"
                                            onClick={() =>
                                                router.push(
                                                    `/reviews/${review.review_id}`
                                                )
                                            }
                                        >
                                            Read More
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Discover by Genre */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <BaseHeading
                            headingLevel="h2"
                            fontSize="large"
                            fontWeight={700}
                            textColor="#ffffff"
                        >
                            DISCOVER BY GENRE
                        </BaseHeading>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
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
                                        <BaseHeading
                                            headingLevel="h3"
                                            textColor="#ffffff"
                                            fontSize="large"
                                            fontWeight={700}
                                        >
                                            {genre.name.toUpperCase()}
                                        </BaseHeading>
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
