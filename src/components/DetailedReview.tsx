import CommentsSection from './CommentsSection';

interface Review {
  id: string;
  type: string;
  title: string;
  coverImage: string;
  author: string;
  date: string;
  genre: string;
  content: string;
  views: number;
  likes: number;
  comments: any[];
}

export default function DetailedReview({ review, isPreview = false }: { review: Review, isPreview?: boolean }) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-12">
      <div className="flex flex-col md:flex-row bg-[#231b32] rounded-lg shadow-lg overflow-hidden">
        <div className="md:w-1/2 flex items-center justify-center bg-[#2d2838] p-8">
          <img src={review.coverImage} alt={review.title} className="rounded-lg w-full max-w-xs object-cover" />
        </div>
        <div className="md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{review.title}</h1>
            <span className="inline-block bg-yellow-200 text-yellow-900 text-xs px-3 py-1 rounded-full mb-2">{review.genre}</span>
            <div className="text-sm text-gray-400 mb-4">By {review.author} &middot; {review.date}</div>
            <div className="text-gray-200 whitespace-pre-line mb-4">
              {isPreview ? review.content.slice(0, 350) + (review.content.length > 350 ? '...' : '') : review.content}
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-4">{review.views.toLocaleString()} views</div>
        </div>
      </div>
      {!isPreview && <CommentsSection comments={review.comments} likes={review.likes} />}
    </div>
  );
} 