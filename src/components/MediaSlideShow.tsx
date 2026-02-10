'use client';
import { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getImageUrl } from '@/utils/userProfileImageUtils';

interface MediaSlideShowProps {
  mediaUrls: string[];
  className?: string;
}

export default function MediaSlideShow({ mediaUrls, className = '' }: MediaSlideShowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaUrls.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === mediaUrls.length - 1 ? 0 : prev + 1));
  };

  const isVideo = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i);
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
        {isVideo(mediaUrls[currentIndex]) ? (
          <video
            src={getImageUrl(mediaUrls[currentIndex])}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={getImageUrl(mediaUrls[currentIndex])}
            alt={`Media ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />
        )}

        {mediaUrls.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition"
            >
              <FaChevronRight />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {mediaUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition ${
                    idx === currentIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
