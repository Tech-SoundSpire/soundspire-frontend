"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import ImageCarousel from "@/components/ImageCarousel";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import BaseText from "@/components/BaseText/BaseText";
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
}

const carouselImages = [
    getImageUrl(DEFAULT_PROFILE_IMAGE),
    getImageUrl(DEFAULT_PROFILE_IMAGE),
    getImageUrl(DEFAULT_PROFILE_IMAGE),
].filter((img): img is string => img !== "undefined");

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetch("/api/reviews")
            .then((res) => res.json())
            .then((data) => {
                const safeReviews = Array.isArray(data)
                    ? data
                    : data.reviews || [];
                // Sort reviews by created_at in descending order (latest first)
                const sortedReviews = safeReviews.sort(
                    (a: Review, b: Review) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                );
                setReviews(sortedReviews);
            })
            .catch((err) => {
                console.error("Error fetching reviews:", err);
                setReviews([]); // fallback to empty array to avoid crash
            });
    }, []);

    return (
        <div className="min-h-screen bg-[#1a1625] ml-16 px-8 py-6">
            <div className="max-w-4xl mx-auto mb-12">
                {/* <Carousel images={carouselImages} /> */}
                <ImageCarousel images={carouselImages}></ImageCarousel>
            </div>
            <div className="flex justify-between items-center mt-12 mb-6">
                <BaseHeading
                    fontSize="large"
                    fontWeight={700}
                    textAlign="left"
                    textColor="#ffffff"
                    className="mt-12 mb-6"
                >
                    ALL REVIEWS
                </BaseHeading>
                <button
                    onClick={() => router.push("/reviews/submit")}
                    className="bg-[#FF4E27] hover:bg-[#e5431f] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                    Submit Review
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reviews.map((review) => (
                    <div
                        key={review.review_id}
                        className="flex flex-col bg-[#231b32] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative"
                    >
                        <img
                            src={
                                review.image_urls &&
                                review.image_urls.length > 0
                                    ? review.image_urls[0]
                                    : getImageUrl(DEFAULT_PROFILE_IMAGE)
                            }
                            alt={review.title}
                            className="w-full h-56 object-cover"
                        />

                        <BaseText
                            wrapper="span"
                            fontSize="very small"
                            textColor="#ffffff"
                            className="absolute top-4 left-4 bg-green-700   px-3 py-1 rounded-full"
                        >
                            {review.content_type}
                        </BaseText>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                                <BaseHeading
                                    headingLevel="h3"
                                    fontWeight={600}
                                    textColor="#ffffff"
                                    fontSize="large"
                                    className="mb-1"
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
                                            {review.artist?.artist_name || review.artist_name || "Unknown Artist"}
                                        </a>
                                    ) : (
                                        review.artist_name || "Unknown Artist"
                                    )}
                                </BaseText>
                                <BaseText
                                    fontSize="small"
                                    textColor="#d1d5db"
                                    className="mb-2"
                                >
                                    {review.content_name}
                                </BaseText>
                                <BaseText
                                    fontSize="small"
                                    textColor="#d1d5db"
                                    className="line-clamp-3 mb-4"
                                >
                                    {review.text_content.slice(0, 100)}
                                    {review.text_content.length > 100
                                        ? "..."
                                        : ""}
                                </BaseText>
                            </div>
                            <button
                                className="mt-auto bg-[#FF4E27] hover:bg-[#e5431f] text-white px-4 py-2 rounded-lg text-sm font-semibold"
                                onClick={() =>
                                    router.push(`/reviews/${review.review_id}`)
                                }
                            >
                                Read More
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
