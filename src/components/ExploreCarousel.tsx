import { useCallback, useState } from "react";
import CarouselBase from "./CarouselBase";
import BaseText from "./BaseText/BaseText";
import Image from "next/image";
import BaseHeading from "./BaseHeading/BaseHeading";

type ExploreItem = {
    title: string;
    description: string;
    price: string;
    image: string;
};
interface ExploreCarouselProps {
    items: ExploreItem[];
}
const ExploreCarousel = ({ items }: ExploreCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Keeping reference stable, prevents unnecessary timeout cancels
    const onNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    }, [items.length]);
    const onPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    }, [items.length]);
    return (
        <section className="mb-12">
            <CarouselBase
                dotCount={items.length}
                auto
                autoIntervalSeconds={3}
                onDotClick={setCurrentIndex}
                onNext={onNext}
                onPrevious={onPrevious}
                currentIndex={currentIndex}
                pausable
            >
                <div className="aspect-[2/1] bg-gradient-to-r from-purple-900 to-purple-600 p-8 grid grid-cols-2 items-center justify-items-start w-full">
                    <div className="flex flex-col">
                        <BaseHeading
                            headingLevel="h2"
                            fontWeight={700}
                            fontSize="sub heading"
                            textAlign="left"
                            textSelectionBackgroundColor="#ff4e27"
                            textSelectionColor="#191919"
                            fontName="playfair"
                        >
                            {items[currentIndex].title}
                        </BaseHeading>
                        <BaseText
                            wrapper="p"
                            fontSize="small"
                            textColor="#d1d5db"
                            fontName="firaCode"
                            textSelectionBackgroundColor="#ff4e27"
                            textSelectionColor="#191919"
                            fontWeight={500}
                        >
                            {items[currentIndex].description}
                        </BaseText>
                        <div className="text-2xl font-bold text-white">
                            {items[currentIndex].price}
                        </div>
                    </div>
                    <div className="m-auto">
                        <Image
                            src={items[currentIndex].image}
                            alt="Featured Album"
                            className="w-64 h-64 object-cover transform rotate-[-5deg]"
                            width={256}
                            height={256}
                        ></Image>
                    </div>
                </div>
            </CarouselBase>
        </section>
    );
};
export default ExploreCarousel;
