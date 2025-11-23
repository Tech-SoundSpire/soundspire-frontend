import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface CarouselBaseProps {
    children: React.ReactNode;
    onNext?: () => void;
    onPrevious?: () => void;
    auto?: boolean;
    autoIntervalSeconds?: number;
    pausable?: boolean;
    nextDisabled?: boolean;
    previousDisabled?: boolean;
    dotCount: number;
    currentIndex?: number;

    onDotClick?: (index: number) => void;
}
const CarouselBase = ({
    children,
    onNext = () => {},
    onPrevious = () => {},
    auto = false,
    autoIntervalSeconds = 3,
    pausable = false,
    nextDisabled = false,
    previousDisabled = false,
    dotCount,
    currentIndex = 0,
    onDotClick = () => {},
}: CarouselBaseProps) => {
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (!auto) return;
        if (paused && pausable) return;
        const timeout = setInterval(() => {
            onNext();
        }, autoIntervalSeconds * 1000);
        return () => clearInterval(timeout);
    }, [auto, autoIntervalSeconds, onNext, pausable, paused]);
    return (
        <div
            className="carousel"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Previous Button */}
            <button
                onClick={onPrevious}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover: black/70 transition-colors`}
                aria-label="Previous Slide"
                disabled={previousDisabled}
            >
                <FaChevronLeft className="w-6 h-6"></FaChevronLeft>
            </button>

            {/* Your Content */}
            {children}

            {/* Next Button */}
            <button
                onClick={onNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover: black/70 transition-colors"
                aria-label="Next Slide"
                disabled={nextDisabled}
            >
                <FaChevronRight className="w-6 h-6"></FaChevronRight>
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {Array.from({ length: dotCount }, (_, index) => (
                    <button
                        key={index}
                        onClick={() => onDotClick(index)}
                        disabled={currentIndex === index}
                        aria-label={`Go to Slide ${index + 1}`}
                        className={`w-2 h-2 rounded-full transition-colors duration-300 ease-out ${
                            currentIndex === index ? "bg-white" : "bg-white/50"
                        }`}
                    ></button>
                ))}
            </div>
        </div>
    );
};
export default CarouselBase;
