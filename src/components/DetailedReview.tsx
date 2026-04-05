import CommentsSection from "./CommentsSection";
import ShareButton from "./ShareButton";
import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import { getFontClass } from "@/utils/getFontClass";
import { useState } from "react";

interface Review {
    review_id: string;
    user_id: string;
    content_type: string;
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
    user?: { username?: string; full_name?: string } | null;
}

export default function DetailedReview({
    review,
    isPreview = false,
    userId,
    likeCount,
    liked,
    onToggleLike,
}: {
    review: Review;
    isPreview?: boolean;
    userId?: string;
    likeCount: number;
    liked: boolean;
    onToggleLike: (currentlyLiked: boolean) => Promise<void> | void;
}) {
    const [isProcessing, setIsProcessing] = useState(false);
    const montserrat = getFontClass("montserrat");
    const azeret = getFontClass("azeretMono");
    const effectiveUserId = userId;

    if (!effectiveUserId) {
        return (
            <div className="w-full max-w-4xl mx-auto mb-12">
                <p className={`${montserrat} text-white text-center p-8`}>
                    Please log in to view comments and interact with this review.
                </p>
            </div>
        );
    }

    const handleToggleLike = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            await onToggleLike(liked);
        } finally {
            setTimeout(() => setIsProcessing(false), 500);
        }
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    };

    return (
        <div className="w-full max-w-[1200px] mx-auto mb-12">
            {/* Title */}
            <h1 className={`${montserrat} text-[#FFC8BC] text-[36px] font-bold leading-[43px] mb-6`}>
                {review.title}
            </h1>

            {/* Hero Image */}
            <div className="relative w-full overflow-hidden rounded-[8px] mb-4" style={{ aspectRatio: "1191/744" }}>
                <img
                    src={review.image_urls?.[0] || getImageUrl(DEFAULT_PROFILE_IMAGE)}
                    alt={review.title}
                    className="w-full h-full object-cover"
                    style={{ filter: "brightness(0.7)" }}
                />
                {/* Genre tag */}
                <span className={`${azeret} absolute bottom-6 right-8 text-[#FF4E27] text-[21px] font-bold -rotate-[24deg]`}>
                    {review.content_type || "Review"}
                </span>
            </div>

            {/* Review Body */}
            <div
                className={`${azeret} text-white text-[20px] font-medium leading-[28px] text-justify whitespace-pre-line mt-8 mb-2`}
            >
                {review.text_content}
            </div>

            {/* Author + Date */}
            <p className={`${montserrat} text-[#F52F03] text-[12px] font-bold leading-[19px] tracking-[2.76px] mb-4`}>
                {review.user?.full_name || review.user?.username || review.artist_name || "Unknown"}
                <br />
                {review.created_at ? formatDate(review.created_at) : ""}
            </p>

            {/* Separator */}
            <div className="w-full h-px bg-[#F7F7F7] mb-6" />

            {/* Like + Share */}
            <div className="flex items-center mb-6">
                <button
                    onClick={handleToggleLike}
                    disabled={isProcessing}
                    aria-pressed={liked}
                    className={`font-bold mr-2 text-2xl transition-colors duration-200 
                        ${liked ? "text-red-400" : "text-gray-400"} 
                        ${isProcessing ? "cursor-not-allowed opacity-50" : liked ? "cursor-pointer hover:text-red-300" : "cursor-pointer hover:text-gray-300"}`}
                >
                    ♥
                </button>
                <span className={`${montserrat} text-white font-semibold mr-4`}>
                    {likeCount} Likes
                </span>
                <ShareButton url={`/reviews/${review.review_id}`} light />
            </div>

            {/* Comments */}
            {!isPreview && (
                <CommentsSection
                    reviewId={review.review_id}
                    userId={effectiveUserId}
                />
            )}
        </div>
    );
}
