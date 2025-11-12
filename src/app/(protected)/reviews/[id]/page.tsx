"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DetailedReview from '@/components/DetailedReview';
import { useAuth } from '@/context/AuthContext';

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

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [review, setReview] = useState<Review | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const { user } = useAuth();
  // Use actual authenticated user ID
  const userId = user?.id || '00000000-0000-0000-0000-000000000001';

useEffect(() => {
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!id) return;

  // Fetch all reviews to find current one
  fetch('/api/reviews')
    .then(res => res.json())
    .then((data) => {
      const reviews = Array.isArray(data) ? data : data.reviews || [];
      const found = reviews.find((r: Review) => r.review_id === id); // use id here
      setReview(found || null);
    });

  fetch(`/api/reviews/${id}/like/count`)
    .then(res => res.json())
    .then(data => setLikeCount(data.count || 0));

  fetch(`/api/reviews/${id}/like/status?user_id=${userId}`)
    .then(res => res.json())
    .then(data => setLiked(data.liked || false));

}, [params.id, userId]);

const handleLikeReview = async () => {
  // Prevent multiple clicks if already liked or currently liking
  if (liked || isLiking) return;
  
  setIsLiking(true);
  try {
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const res = await fetch(`/api/reviews/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });

    const data = await res.json();

    // Update like count only if liked
    if (data.liked) {
      setLiked(true);
      setLikeCount(data.count || likeCount + 1); // prefer backend count
    }
  } catch (error) {
    console.error('Error liking review:', error);
  } finally {
    // Add a small delay to prevent rapid clicking
    setTimeout(() => {
      setIsLiking(false);
    }, 500);
  }
};



  if (!review) return <div className="text-white">Loading...</div>;
  return (
    <div className="min-h-screen bg-[#1a1625] ml-16 px-8 py-6">
      <button
        className="mb-6 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold"
        onClick={() => router.push('/reviews')}
      >
        ← Back to All Reviews
      </button>
      <DetailedReview review={review} userId={userId} likeCount={likeCount} liked={liked} onLike={handleLikeReview} />
    </div>
  );
} 