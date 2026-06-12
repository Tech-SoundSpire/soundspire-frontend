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
import { Star, StarHalf, Heart } from "lucide-react";
import { getFontClass } from "@/utils/getFontClass";
import { ArtistAttributes } from "@/models/Artist";
import { useLanguage } from "@/context/LanguageContext";

interface SongReview {
    review_id: string;
    spotify_track_id: string;
    review_text: string;
    rating: number | null;
    like_count: number;
    created_at: string;
    user: {
        user_id: string;
        username: string;
        profile_picture_url: string | null;
    };
    song: {
        track_name: string;
        artist_name: string;
        album_art_url: string | null;
    } | null;
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
    const [reviews, setReviews] = useState<SongReview[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [suggestedArtists, setSuggestedArtists] = useState<any[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAllArtists, setShowAllArtists] = useState(false);
    const [allArtists, setAllArtists] = useState<any[]>([]);
    const { user } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();
    const montserrat = getFontClass("montserrat");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const fetches: Promise<Response>[] = [
                    fetch("/api/catalog/song-reviews/feed?page=1"),
                    fetch("/api/explore/artists"),
                    fetch("/api/explore/genres"),
                ];
                if (user?.id) {
                    fetches.push(fetch(`/api/explore/suggested?userId=${user.id}`));
                }
                const [reviewsRes, artistsRes, genresRes, suggestedRes] = await Promise.all(fetches);
                if (reviewsRes.ok) {
                    const data = await reviewsRes.json();
                    setReviews(data.reviews || []);
                }
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
                {/* Get-the-app banner */}
                <a
                    href="/download/android"
                    className="flex items-center justify-between gap-3 mb-6 px-4 md:px-5 py-3 rounded-xl bg-[#3DDC84] hover:bg-[#32c476] transition text-[#0a3d23]"
                >
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M17.6 9.48l1.84-3.18a.4.4 0 0 0-.69-.4l-1.86 3.22a11.43 11.43 0 0 0-9.78 0L5.25 5.9a.4.4 0 1 0-.69.4l1.84 3.18A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52zM7 15.25a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm10 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1z" />
                        </svg>
                        <span className="font-semibold text-sm md:text-base">{t('Get the SoundSpire Android app')}</span>
                    </div>
                    <span className="font-bold text-sm md:text-base whitespace-nowrap underline underline-offset-2">{t('Download')}</span>
                </a>

                {/* Header: Title + Search */}
                <div className="flex flex-col md:flex-row items-start md:items-center mb-8 gap-4">
                    <h1 className={`${montserrat} text-[#FFD3C9] text-[32px] md:text-[47px] font-bold leading-[40px] md:leading-[56px] flex-shrink-0`}>
                        Explore
                    </h1>
                    <div className="flex-1 flex justify-center w-full">
                        <div className="w-full max-w-[437px] md:mr-[300px]">
                            <SearchDropdown apiEndpoint="/api/search" placeholder="Search artists, reviews, communities..." />
                        </div>
                    </div>
                </div>

                <ExploreCarousel items={carouselItems} />

                {/* Suggested Artists */}
                <section className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`${montserrat} text-[#FFD3C9] text-[28px] md:text-[47px] font-bold leading-[36px] md:leading-[56px]`}>
                            {t('SUGGESTED ARTISTS')}
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
                                            artist_id: a.artist_id, name: a.artist_name, imageUrl: a.profile_picture_url, slug: a.slug,
                                            onSoundSpire: !!a.user_id,
                                            soundcharts_uuid: a.third_party_id || null,
                                        }))];
                                        // Deduplicate: if a SC artist has joined (onSoundSpire=true via suggested), remove the SC version
                                        const seen = new Set<string>();
                                        const deduped = merged.filter((a: any) => {
                                            const key = a.slug || a.soundcharts_uuid || a.artist_id;
                                            if (seen.has(key)) return false;
                                            seen.add(key);
                                            return true;
                                        });
                                        setAllArtists(deduped);
                                    } catch { /* ignore */ }
                                }
                                setShowAllArtists(!showAllArtists);
                            }}
                            className={`${montserrat} text-[#F7F7F7] text-[16px] font-medium hover:text-[#FFD3C9] transition-colors`}
                        >
                            {showAllArtists ? t("Show Less") : t("See More")}
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
                                    ? (artist.soundcharts_uuid ? `/community/sc/${artist.soundcharts_uuid}` : null)
                                    : (artist.slug ? `/community/${artist.slug}/` : null);
                                if (!href) return null;
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
                                    ? (artist.soundcharts_uuid ? `/community/sc/${artist.soundcharts_uuid}` : null)
                                    : (artist.slug ? `/community/${artist.slug}/` : null);
                                if (!href) return null;
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
                            {t('REVIEWS')}
                        </h2>
                        <Link href="/reviews" className={`${montserrat} text-[#F7F7F7] text-[16px] font-medium hover:text-[#FFD3C9] transition-colors`}>
                            {t('See All')}
                        </Link>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                            <p className="text-white/40 text-sm">No reviews yet. Be the first to write one!</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile: horizontal scroll with peek of next card */}
                            <div className="md:hidden flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                {reviews.slice(0, 5).map((review) => (
                                    <div key={review.review_id} className="shrink-0 w-[42%] snap-start">
                                        <ExploreReviewCard review={review} montserrat={montserrat} />
                                    </div>
                                ))}
                            </div>
                            {/* Tablet+: grid */}
                            <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {reviews.slice(0, 5).map((review) => (
                                    <ExploreReviewCard
                                        key={review.review_id}
                                        review={review}
                                        montserrat={montserrat}
                                    />
                                ))}
                            </div>
                        </>
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

function ExploreReviewCard({ review, montserrat }: { review: SongReview; montserrat: string }) {
    const isAlbum = review.spotify_track_id.startsWith("album:");
    const href = isAlbum
        ? `/reviews/album/${review.spotify_track_id.replace("album:", "")}`
        : `/reviews/song/${review.spotify_track_id}`;
    const albumArt = review.song?.album_art_url || getImageUrl(DEFAULT_PROFILE_IMAGE);
    const profilePic = getImageUrl(review.user?.profile_picture_url || DEFAULT_PROFILE_IMAGE);

    const renderStars = (rating: number) => {
        const stars = [];
        const full = Math.floor(rating);
        const half = rating % 1 !== 0;
        for (let i = 0; i < full; i++) {
            stars.push(<Star key={`s${i}`} className="w-2.5 h-2.5 fill-[#FF4E27] text-[#FF4E27]" />);
        }
        if (half) stars.push(<StarHalf key="half" className="w-2.5 h-2.5 fill-[#FF4E27] text-[#FF4E27]" />);
        const empty = 5 - full - (half ? 1 : 0);
        for (let i = 0; i < empty; i++) {
            stars.push(<Star key={`e${i}`} className="w-2.5 h-2.5 text-white/20" />);
        }
        return stars;
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return "Today";
        if (days === 1) return "1 day ago";
        if (days < 30) return `${days} days ago`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months}mo ago`;
        return `${Math.floor(months / 12)}y ago`;
    };

    return (
        <Link
            href={href}
            className="group relative flex flex-col bg-[#1e1529] rounded-xl overflow-hidden hover:bg-[#241a32] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,78,39,0.15)] transition-all duration-300"
        >
            {/* Album art hero with rating overlay */}
            <div className="relative aspect-square overflow-hidden">
                <img
                    src={albumArt}
                    alt={review.song?.track_name || "album art"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                {review.rating !== null && review.rating !== undefined && (
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                        {renderStars(Number(review.rating))}
                    </div>
                )}
                {isAlbum && (
                    <div className="absolute top-2 left-2 text-[8px] font-bold uppercase tracking-wider bg-[#FF4E27]/90 text-white rounded-full px-1.5 py-0.5">
                        Album
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-2.5 flex-1 flex flex-col">
                <p className={`${montserrat} text-white text-xs font-bold leading-tight truncate`}>
                    {review.song?.track_name || "Unknown track"}
                </p>
                <p className={`${montserrat} text-[#FF7151] text-[11px] font-medium mb-2 truncate`}>
                    {review.song?.artist_name || "Unknown artist"}
                </p>

                {review.review_text && (
                    <p className={`${montserrat} text-white/60 text-[11px] leading-snug mb-2 line-clamp-2 italic`}>
                        &ldquo;{review.review_text}&rdquo;
                    </p>
                )}

                {/* Footer: reviewer + likes */}
                <div className="mt-auto flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <img
                            src={profilePic}
                            alt={review.user?.username || ""}
                            className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                        <p className={`${montserrat} text-white/70 text-[10px] font-medium truncate`}>
                            @{review.user?.username || "user"}
                        </p>
                        <span className={`${montserrat} text-white/30 text-[10px] shrink-0`}>· {timeAgo(review.created_at)}</span>
                    </div>
                    {review.like_count > 0 && (
                        <div className="flex items-center gap-0.5 text-white/40 text-[10px] shrink-0">
                            <Heart className="w-3 h-3" />
                            <span>{review.like_count}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
