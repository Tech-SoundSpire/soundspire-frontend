interface ReviewCardProps {
  albumName: string;
  artistName: string;
  coverImage: string;
  rating: string; // genre
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
    <div className="bg-[#231b32] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
      <div className="relative aspect-square">
        <img
          src={coverImage}
          alt={`${albumName} by ${artistName}`}
          className="w-full h-full object-cover"
        />
        <span className="absolute bottom-2 right-2 bg-yellow-200 text-yellow-900 text-xs px-3 py-1 rounded-full">{rating}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-white">{albumName}</h3>
        <p className="text-sm text-gray-400">{artistName}</p>
        <p className="mt-2 text-sm text-gray-300 line-clamp-3">{reviewText}</p>
      </div>
    </div>
  );
};

export default ReviewCard; 