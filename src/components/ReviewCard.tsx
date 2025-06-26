interface ReviewCardProps {
  albumName: string;
  artistName: string;
  coverImage: string;
  rating: number;
  reviewText: string;
}

const ReviewCard = ({
  albumName,
  artistName,
  coverImage,
  rating,
  reviewText,
}: ReviewCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative aspect-square">
        <img
          src={coverImage}
          alt={`${albumName} by ${artistName}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-full text-sm">
          {rating}/5
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">{albumName}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{artistName}</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
          {reviewText}
        </p>
      </div>
    </div>
  );
};

export default ReviewCard; 