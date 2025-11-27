import BaseHeading from "./BaseHeading/BaseHeading";
import Image from "next/image";
interface GenreCardProps {
    name: string;
    imageUrl: string;
}

const GenreCard = ({ name, imageUrl }: GenreCardProps) => {
    return (
        <div className="relative h-32 rounded-lg overflow-hidden cursor-pointer group bg-purple-500 hover:bg-gray-800 transition-colors duration-200">
            <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent" />
            <div className="absolute right-0 bottom-0 h-24 w-24 transform rotate-12 translate-x-4 translate-y-4 group-hover:scale-110 transition-transform duration-300">
                <Image fill src={imageUrl} alt={name} objectFit="cover" />
            </div>
            <div className="relative p-4">
                <BaseHeading
                    textColor="#ffffff"
                    fontWeight={700}
                    fontSize="normal"
                    headingLevel="h3"
                >
                    {name}
                </BaseHeading>
            </div>
        </div>
    );
};

export default GenreCard;
