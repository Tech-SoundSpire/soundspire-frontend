import BaseHeading from "./BaseHeading/BaseHeading";
import BaseText from "./BaseText/BaseText";

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
                <BaseText
                    wrapper="span"
                    textColor="#713f12"
                    fontSize="very small"
                    className="absolute bottom-2 right-2 bg-yellow-200 px-3 py-1 rounded-full"
                >
                    {rating}
                </BaseText>
            </div>
            <div className="p-4">
                <BaseHeading
                    fontWeight={600}
                    textColor="#ffffff"
                    headingLevel="h3"
                    fontSize="sub heading"
                >
                    {albumName}
                </BaseHeading>
                <BaseText textColor="#9ca3af" fontSize="very small">
                    {artistName}
                </BaseText>
                <BaseText
                    className="mt-2 line-clamp-3"
                    textColor="#d1d5db"
                    fontSize="very small"
                >
                    {reviewText}
                </BaseText>
            </div>
        </div>
    );
};

export default ReviewCard;
