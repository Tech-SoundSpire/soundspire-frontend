import Image from "next/image";
import BaseHeading from "./BaseHeading/BaseHeading";
import BaseText from "./BaseText/BaseText";

interface ArtistCardProps {
    name: string;
    imageUrl: string;
    genre?: string;
}

const ArtistCard = ({ name, imageUrl, genre }: ArtistCardProps) => {
    return (
        <div className="group cursor-pointer">
            <div className="relative w-32 h-32 rounded-full overflow-hidden group-hover:ring-2 ring-primary">
                <Image
                    fill
                    src={imageUrl}
                    alt={name}
                    className="transition-transform duration-300 group-hover:scale-110"
                    objectFit="cover"
                />
            </div>
            <div className="mt-2 text-center">
                <BaseHeading
                    headingLevel="h3"
                    fontWeight={500}
                    className="text-gray-900 dark:text-gray-100"
                >
                    {name}
                </BaseHeading>

                {genre && (
                    <BaseText
                        fontSize="small"
                        className="text-gray-500 dark:text-gray-400"
                    >
                        {genre}
                    </BaseText>
                )}
            </div>
        </div>
    );
};

export default ArtistCard;
