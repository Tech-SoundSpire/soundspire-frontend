"use client";
import DetailedReview from '@/components/DetailedReview';
import { useRouter, useParams } from 'next/navigation';

// Same mock data as in the main reviews page
const mockReviews = [
  {
    id: '1',
    type: 'album',
    title: 'ALFAAZO',
    coverImage: '/images/placeholder.jpg',
    author: 'Priya Didi',
    date: '17/04/2025',
    genre: 'Indie Pop',
    content: `In the quiet corners of the Indian independent music scene, where late-night thoughts brew into melodies and feelings take shape in lo-fi waves, Mitraz has emerged not just as a sound, but as a feeling. ...`,
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

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const review = mockReviews.find(r => r.id === params.id);
  if (!review) return <div className="text-white">Review not found.</div>;
  return (
    <div className="min-h-screen bg-[#1a1625] ml-16 px-8 py-6">
      <button
        className="mb-6 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold"
        onClick={() => router.push('/reviews')}
      >
        ← Back to All Reviews
      </button>
      <DetailedReview review={review} />
    </div>
  );
} 