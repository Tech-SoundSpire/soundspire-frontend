"use client";
import Carousel from '@/components/Carousel';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Mock data for reviews
const mockReviews = [
  {
    id: '1',
    type: 'album',
    title: 'ALFAAZO',
    coverImage: '/images/placeholder.jpg',
    author: 'Priya Didi',
    date: '17/04/2025',
    genre: 'Indie Pop',
    content: `In the quiet corners of the Indian independent music scene...`,
    views: 1024,
    likes: 13,
    comments: [
      { id: 'c1', user: 'User1', text: 'Great review!', likes: 2, replies: [] },
      { id: 'c2', user: 'User2', text: 'Love this album.', likes: 1, replies: [] },
    ],
  },
  {
    id: '2',
    type: 'album',
    title: 'CHROMAKOPIA',
    coverImage: '/images/placeholder.jpg',
    author: 'Ashish Paul',
    date: '20th Dec',
    genre: 'Jazz',
    content: 'Lorem ipsum dolor sit amet sed do eiusmod tempor...',
    views: 512,
    likes: 8,
    comments: [],
  },
  // Add more mock reviews as needed
];

const carouselImages = [
  '/images/placeholder.jpg',
  '/images/placeholder.jpg',
  '/images/placeholder.jpg',
];

export default function ReviewsPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#1a1625] ml-16 px-8 py-6">
      <div className="max-w-4xl mx-auto mb-12">
        <Carousel images={carouselImages} />
      </div>
      <h2 className="text-3xl font-bold text-white mt-12 mb-6">ALL REVIEWS</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {mockReviews.map(review => (
          <div key={review.id} className="flex flex-col bg-[#231b32] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
            <img src={review.coverImage} alt={review.title} className="w-full h-56 object-cover" />
            <span className="absolute top-4 left-4 bg-green-700 text-white text-xs px-3 py-1 rounded-full">{review.genre}</span>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-white text-lg mb-1">{review.title}</h3>
                <p className="text-sm text-gray-400 mb-2">{review.author}, {review.date}</p>
                <p className="text-sm text-gray-300 line-clamp-3 mb-4">{review.content.slice(0, 100)}{review.content.length > 100 ? '...' : ''}</p>
              </div>
              <button
                className="mt-auto bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded text-sm font-semibold"
                onClick={() => router.push(`/reviews/${review.id}`)}
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