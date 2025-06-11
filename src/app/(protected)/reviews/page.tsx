"use client";
import Carousel from '@/components/Carousel';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

const carouselImages = [
  '/images/placeholder.jpg',
  '/images/placeholder.jpg',
  '/images/placeholder.jpg',
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const router = useRouter();

  useEffect(() => {
  fetch('/api/reviews')
    .then(res => res.json())
    .then(data => {
      const safeReviews = Array.isArray(data) ? data : (data.reviews || []);
      setReviews(safeReviews);
    })
    .catch(err => {
      console.error('Error fetching reviews:', err);
      setReviews([]); // fallback to empty array to avoid crash
    });
}, []);


  return (
    <div className="min-h-screen bg-[#1a1625] ml-16 px-8 py-6">
      <div className="max-w-4xl mx-auto mb-12">
        <Carousel images={carouselImages} />
      </div>
      <h2 className="text-3xl font-bold text-white mt-12 mb-6">ALL REVIEWS</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reviews.map(review => (
          <div key={review.review_id} className="flex flex-col bg-[#231b32] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
            <img src={(review.image_urls && review.image_urls.length > 0) ? review.image_urls[0] : '/images/placeholder.jpg'} alt={review.title} className="w-full h-56 object-cover" />
            <span className="absolute top-4 left-4 bg-green-700 text-white text-xs px-3 py-1 rounded-full">{review.content_type}</span>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">{review.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{review.artist_name || 'Unknown Artist'}</p>
                <p className="text-sm text-gray-300 mb-2">{review.content_name}</p>
                <p className="text-sm text-gray-300 line-clamp-3 mb-4">{review.text_content.slice(0, 100)}{review.text_content.length > 100 ? '...' : ''}</p>
              </div>
              <button
                className="mt-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-semibold"
                onClick={() => router.push(`/reviews/${review.review_id}`)}
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