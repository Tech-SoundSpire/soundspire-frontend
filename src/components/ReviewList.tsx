import ReviewCard from './ReviewCard';

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

export default function ReviewList({ reviews, onReviewClick }: { reviews: Review[], onReviewClick: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {reviews.map(review => (
        <div key={review.id} onClick={() => onReviewClick(review.id)} className="cursor-pointer">
          <ReviewCard
            albumName={review.title}
            artistName={review.author}
            coverImage={review.coverImage}
            rating={review.genre}
            reviewText={review.content.slice(0, 100) + (review.content.length > 100 ? '...' : '')}
          />
        </div>
      ))}
    </div>
  );
} 