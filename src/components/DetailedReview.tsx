import { useState } from 'react';
import CommentsSection from './CommentsSection';
import { getImageUrl, DEFAULT_PROFILE_IMAGE } from '@/utils/userProfileImageUtils';

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
  onLike 
}: {
   review: Review, 
   isPreview?: boolean, 
   userId?: string, 
   likeCount: number, 
   liked: boolean, 
   onLike: () => void 
  }) {
    const [isliking, setIsLiking] = useState(false);
  // Use the provided userId or show message if not authenticated
  const effectiveUserId = userId;
  
  if (!effectiveUserId) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-12">
        <div className="bg-[#231b32] rounded-lg p-8 text-center">
          <p className="text-white">Please log in to view comments and interact with this review.</p>
        </div>
      </div>
    );
  }

  const handleLike = async() => {
    if(isliking || liked) return;

    setIsLiking(true);
    try {
       await onLike()
    } finally{
      //added a small delay so that to prevent spamming likes
      setTimeout(() =>{
        setIsLiking(false);
      }, 500);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <div className="bg-[#231b32] rounded-lg shadow-lg overflow-hidden">
        {/* Image at the top */}
        <div className="w-full flex justify-center bg-[#2d2838] p-8">
          <img src={(review.image_urls && review.image_urls.length > 0) ? review.image_urls[0] : getImageUrl(DEFAULT_PROFILE_IMAGE)} alt={review.title} className="rounded-lg w-full max-w-md object-cover" />
        </div>
        {/* Content below the image */}
        <div className="p-8">
          <h1 className="text-3xl font-bold text-white mb-2">{review.title}</h1>
          <span className="inline-block bg-yellow-200 text-yellow-900 text-xs px-3 py-1 rounded-full mb-2">{review.content_type}</span>
          <div className="text-sm text-gray-400 mb-4">{review.artist_name || 'Unknown Artist'}</div>
          <div className="text-gray-200 whitespace-pre-line mb-4">{review.text_content}</div>
          <div className="text-xs text-gray-400 mt-4">{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</div>
        </div>
      </div>

      {/* Like button and counter below review, above comments */}
      <div className="flex items-center my-6">
        <button 
        onClick={handleLike}
        disabled={isliking || liked}
        className={`font-bold mr-2 text-2xl transition-colors duration-200 
          ${liked ? 'text-red-400 cursor-not-allowed' : 'text-gray-400 hover:text-gray-300 cursor-pointer'} 
          ${isliking ? 'cursor-not-allowed opacity-50' : ''}`}>
          ♥
          </button>
        <span className="text-white font-semibold mr-4">{likeCount} Likes</span>
      </div>
      {!isPreview && <CommentsSection reviewId={review.review_id} userId={effectiveUserId} />}
    </div>
  );
} 