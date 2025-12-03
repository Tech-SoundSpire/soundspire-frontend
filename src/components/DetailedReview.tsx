import { useState } from "react";
import CommentsSection from "./CommentsSection";
import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import BaseText from "./BaseText/BaseText";
import BaseHeading from "./BaseHeading/BaseHeading";

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
    // Use the provided userId or show message if not authenticated
    const effectiveUserId = userId;

    if (!effectiveUserId) {
        return (
            <div className="w-full max-w-4xl mx-auto mb-12">
                <div className="bg-[#231b32] rounded-lg p-8 text-center">
                    <BaseText textColor="#ffffff" fontName="inter">
                        Please log in to view comments and interact with this
                        review.
                    </BaseText>
                </div>
            </div>
        );
    }

    const handleToggleLike = async () => {
        if (isProcessing) return;

        setIsProcessing(true);
        try {
            await onToggleLike(liked);
        } finally {
            //added a small delay so that to prevent spamming likes
            setTimeout(() => {
                setIsProcessing(false);
            }, 500);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mb-12">
            <div className="bg-[#231b32] rounded-lg shadow-lg overflow-hidden">
                {/* Image at the top */}
                <div className="relative w-full flex justify-center bg-[#2d2838] p-8">
                    <img
                        src={
                            review.image_urls && review.image_urls.length > 0
                                ? review.image_urls[0]
                                : getImageUrl(DEFAULT_PROFILE_IMAGE)
                        }
                        alt={review.title}
                        className="rounded-lg w-full max-w-md object-cover"
                    />
                </div>
                {/* Content below the image */}
                <div className="p-8">
                    <BaseHeading
                        headingLevel="h1"
                        fontWeight={700}
                        textColor="#ffffff"
                        className="mb-2"
                        textAlign="left"
                        fontSize="sub heading"
                    >
                        {review.title}
                    </BaseHeading>
                    <BaseText
                        wrapper="span"
                        textColor="#713f12"
                        fontSize="very small"
                        className="inline-block bg-yellow-200 px-3 py-1 rounded-full mb-2"
                    >
                        {review.content_type}
                    </BaseText>

                    <BaseText
                        fontSize="small"
                        textColor="#9ca3af"
                        className="mb-4"
                    >
                        {review.artist_name || "Unknown Artist"}
                    </BaseText>
                    <BaseText
                        fontSize="normal"
                        textColor="#e5e7eb"
                        className="whitespace-pre-line mb-4"
                    >
                        {review.text_content}
                    </BaseText>
                    <BaseText
                        fontSize="very small"
                        textColor="#9ca3af"
                        className="mt-4"
                    >
                        {review.created_at
                            ? new Date(review.created_at).toLocaleDateString()
                            : ""}
                    </BaseText>
                </div>
            </div>

            {/* Like button and counter below review, above comments */}
            <div className="flex items-center my-6">
                <button
                    onClick={handleToggleLike}
                    disabled={isProcessing}
                    aria-pressed={liked}
                    className={`font-bold mr-2 text-2xl transition-colors duration-200 
          ${liked ? "text-red-400" : "text-gray-400"} 
          ${
              isProcessing
                  ? "cursor-not-allowed opacity-50"
                  : liked
                  ? "cursor-pointer hover:text-red-300"
                  : "cursor-pointer hover:text-gray-300"
          }`}
                >
                    ♥
                </button>
                <BaseText
                    wrapper="span"
                    textColor="#ffffff"
                    fontWeight={600}
                    className="mr-4"
                >
                    {likeCount} Likes
                </BaseText>
            </div>
            {!isPreview && (
                <CommentsSection
                    reviewId={review.review_id}
                    userId={effectiveUserId}
                />
            )}
        </div>
    );
}
