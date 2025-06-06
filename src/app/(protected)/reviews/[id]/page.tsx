"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DetailedReview from '@/components/DetailedReview';

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
  // For demo, fallback to a static userId if not provided
  const userId = '00000000-0000-0000-0000-000000000001';

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then((data: Review[]) => {
        const found = data.find((r: Review) => r.review_id === params.id);
        setReview(found || null);
      });
    // Fetch like count for the review
    fetch(`/api/reviews/${params.id}/like/count`).then(res => res.json()).then(data => setLikeCount(data.count || 0));
    // Fetch if user liked
    fetch(`/api/reviews/${params.id}/like/status?user_id=${userId}`).then(res => res.json()).then(data => setLiked(data.liked || false));
  }, [params.id]);

  const handleLikeReview = async () => {
    const res = await fetch(`/api/reviews/${params.id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    const data = await res.json();
    setLiked(data.liked);
    setLikeCount(count => data.liked ? count + 1 : Math.max(0, count - 1));
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