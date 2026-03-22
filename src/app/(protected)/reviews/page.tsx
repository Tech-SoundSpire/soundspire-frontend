"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import CarouselBase from "@/components/CarouselBase";
import Link from "next/link";
import { getFontClass } from "@/utils/getFontClass";
import ShareButton from "@/components/ShareButton";

interface Review {
    review_id: string;
    user_id: string;
    content_type: string;
    review_type?: string | null;
    content_id: string;
    artist_id: string | null;
    artist_name: string | null;
    content_name: string;
    title: string;
    text_content: string;
    rating: number;
    image_urls: string[] | null;
    created_at: string;
    updated_at: string;
    artist?: { artist_id: string; artist_name: string; slug: string } | null;
    user?: { username?: string; full_name?: string } | null;
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [heroIndex, setHeroIndex] = useState(0);
    const router = useRouter();
    const montserrat = getFontClass("montserrat");

    useEffect(() => {
        fetch("/api/reviews")
            .then((res) => res.json())
            .then((data) => {
                const safeReviews = Array.isArray(data) ? data : data.reviews || [];
                const sortedReviews = safeReviews.sort(
                    (a: Review, b: Review) =>
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setReviews(sortedReviews);
            })
            .catch((err) => {
                console.error("Error fetching reviews:", err);
                setReviews([]);
            });
    }, []);

    const onNext = useCallback(() => {
        if (reviews.length === 0) return;
        setHeroIndex((prev) => (prev + 1) % Math.min(reviews.length, 5));
    }, [reviews.length]);
    const onPrevious = useCallback(() => {
        if (reviews.length === 0) return;
        setHeroIndex((prev) => (prev - 1 + Math.min(reviews.length, 5)) % Math.min(reviews.length, 5));
    }, [reviews.length]);

    const heroReview = reviews[heroIndex];

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.getDate()}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    };

    return (
        <div className="min-h-screen md:ml-[54px] px-8 py-6">
            {/* Page Title */}
            <h1 className={`${montserrat} text-[#FFD3C9] text-[28px] md:text-[47px] font-bold leading-[36px] md:leading-[56px] mb-8`}>
                EXPLORE ALL REVIEWS
            </h1>

            {/* Hero Review Carousel */}
            {reviews.length > 0 && heroReview && (
                <div className="mb-6">
                    <CarouselBase
                        dotCount={Math.min(reviews.length, 5)}
                        currentIndex={heroIndex}
                        onDotClick={setHeroIndex}
                        onNext={onNext}
                        onPrevious={onPrevious}
                        auto
                        autoIntervalSeconds={4}
                        pausable
                    >
                        <Link
                            href={`/reviews/${heroReview.review_id}`}
                            className="w-full rounded-[20px] overflow-hidden relative cursor-pointer border border-[#3A3A3A] block"
                            style={{ aspectRatio: "2/1", maxHeight: "500px" }}
                        >
                            <img
                                src={heroReview.image_urls?.[0] || getImageUrl(DEFAULT_PROFILE_IMAGE)}
                                alt={heroReview.title}
                                className="w-full h-full object-cover"
                                style={{ filter: "brightness(0.6)" }}
                            />
                            {/* Genre tag */}
                            <span className={`${montserrat} absolute bottom-6 right-8 text-[#FF4E27] text-[19px] font-bold -rotate-[24deg]`}>
                                {heroReview.content_type || "Review"}
                            </span>
                        </Link>
                    </CarouselBase>

                    {/* Title + Author below hero */}
                    <div className="mt-4">
                        <Link
                            href={`/reviews/${heroReview.review_id}`}
                            className={`${montserrat} text-[#F7F7F7] text-[36px] font-bold leading-[43px] hover:text-[#FFC8BC] transition-colors`}
                        >
                            {heroReview.title}
                        </Link>
                        <p className={`${montserrat} text-[#FF4E27] text-[12px] font-bold leading-[14px] mt-2`}>
                            {formatDate(heroReview.created_at)}
                        </p>
                    </div>
                </div>
            )}

            {/* ALL REVIEWS heading + Submit button */}
            <div className="flex justify-between items-center mt-12 mb-6">
                <h2 className={`${montserrat} text-[#FFD3C9] text-[28px] md:text-[47px] font-bold leading-[36px] md:leading-[56px]`}>
                    ALL REVIEWS
                </h2>
                <Link
                    href="/reviews/submit"
                    className="bg-[#FF4E27] hover:bg-[#e5431f] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                    Submit Review
                </Link>
            </div>

            {/* Review Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-[56px]">
                {reviews.map((review) => (
                    <div
                        key={review.review_id}
                        className="flex flex-col bg-[#1e1529] rounded-[13px] overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                        <img
                            src={review.image_urls?.[0] || getImageUrl(DEFAULT_PROFILE_IMAGE)}
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
                                            {review.artist?.artist_name || review.artist_name || "Unknown Artist"}
                                        </a>
                                    ) : (
                                        review.artist_name || "Unknown Artist"
                                    )}
                                </p>
                                <p className={`${montserrat} text-[#d1d5db] text-[14px] line-clamp-3 mb-4`}>
                                    {review.text_content.slice(0, 100)}
                                    {review.text_content.length > 100 ? "..." : ""}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 mt-auto">
                                <Link
                                    href={`/reviews/${review.review_id}`}
                                    className={`${montserrat} bg-[#FF4E27] hover:bg-[#e5431f] text-[#F7F7F7] px-4 py-2.5 rounded-[5px] text-[16px] font-medium inline-block`}
                                >
                                    Read More
                                </Link>
                                <ShareButton url={`/reviews/${review.review_id}`} light />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
