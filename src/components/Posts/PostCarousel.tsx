"use client";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function MediaCarousel({ mediaUrls }: { mediaUrls: string[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? mediaUrls.length - 1 : prev - 1
        );
    };

    const nextSlide = () => {
        setCurrentIndex((prev) =>
            prev === mediaUrls.length - 1 ? 0 : prev + 1
        );
    };

    if (!mediaUrls || mediaUrls.length === 0) return null;

    return (
        <div className="relative w-full mx-auto overflow-hidden shadow">
            <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {mediaUrls.map((url, index) => (
                    <div key={index} className="min-w-full">
                        <img
                            src={url}
                            alt={`Post Image ${index + 1}`}
                            className="w-full h-auto object-contain"
                            width={1000}
                            height={1000}
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {mediaUrls.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10"
                    >
                        <FaChevronLeft />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10"
                    >
                        <FaChevronRight />
                    </button>
                </>
            )}

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {mediaUrls.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                            index === currentIndex ? "bg-white" : "bg-gray-400"
                        } opacity-80`}
                    ></button>
                ))}
            </div>
        </div>
    );
}
