import { useCallback, useState } from "react";
import CarouselBase from "./CarouselBase";

interface ImageCarouselProps {
    images: string[];
}
const ImageCarousel = ({ images }: ImageCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Keeping reference stable, prevents unnecessary timeout cancels
    const onNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);
    const onPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);
    return (
        <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
            <CarouselBase
                onNext={onNext}
                onPrevious={onPrevious}
                auto
                autoIntervalSeconds={1.5}
                pausable
                dotCount={images.length}
                onDotClick={setCurrentIndex}
                currentIndex={currentIndex}
            >
                <div
                    className="w-full flex transition-transform duration-500 ease-in-out h-full"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {images.map((image, index) => (
                        <div
                            key={index}
                            className="w-full h-full flex-shrink-0"
                            style={{
                                backgroundImage: `url(${image})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        />
                    ))}
                </div>
            </CarouselBase>
        </div>
    );
};
export default ImageCarousel;
