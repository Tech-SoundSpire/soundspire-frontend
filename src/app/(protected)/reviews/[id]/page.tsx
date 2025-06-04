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

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then((data: Review[]) => {
        const found = data.find((r: Review) => r.review_id === params.id);
        setReview(found || null);
      });
  }, [params.id]);

  if (!review) return <div className="text-white">Loading...</div>;
  return (
    <div className="min-h-screen bg-[#1a1625] ml-16 px-8 py-6">
      <button
        className="mb-6 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold"
        onClick={() => router.push('/reviews')}
      >
        ← Back to All Reviews
      </button>
      <div className="w-full max-w-4xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row bg-[#231b32] rounded-lg shadow-lg overflow-hidden">
          <div className="md:w-1/2 flex items-center justify-center bg-[#2d2838] p-8">
            <img src={(review.image_urls && review.image_urls.length > 0) ? review.image_urls[0] : '/images/placeholder.jpg'} alt={review.title} className="rounded-lg w-full max-w-xs object-cover" />
          </div>
          <div className="md:w-1/2 p-8 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{review.title}</h1>
              <span className="inline-block bg-yellow-200 text-yellow-900 text-xs px-3 py-1 rounded-full mb-2">{review.content_type}</span>
              <div className="text-sm text-gray-400 mb-4">{review.artist_name || 'Unknown Artist'}</div>
              <div className="text-gray-200 whitespace-pre-line mb-4">{review.text_content}</div>
            </div>
            <div className="text-xs text-gray-400 mt-4">{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</div>
          </div>
        </div>
      </div>
      {/* Comments and likes can be added here if needed */}
    </div>
  );
} 