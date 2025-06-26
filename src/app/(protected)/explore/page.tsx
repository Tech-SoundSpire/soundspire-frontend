'use client';

import Carousel from '@/components/Carousel';
import ArtistCard from '@/components/ArtistCard';
import ReviewCard from '@/components/ReviewCard';
import GenreCard from '@/components/GenreCard';
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

const carouselItems = [
  {
    title: "INDIE FOLK MUSIC COLLECTION",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna",
    price: "49.99$$",
    image: "/images/placeholder.jpg"
  },
  {
    title: "ELECTRONIC BEATS VOL. 2",
    description: "Experience the cutting edge of electronic music with our latest collection",
    price: "39.99$$",
    image: "/images/placeholder.jpg"
  },
  {
    title: "JAZZ CLASSICS REMASTERED",
    description: "Timeless jazz recordings remastered for the modern audiophile",
    price: "59.99$$",
    image: "/images/placeholder.jpg"
  },
];

export default function ExplorePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { logout } = useAuth();

  // Auto-rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 3000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1625]">
      <main className="ml-16 px-8 py-6">
        {/* Search Bar and Logout */}
        <div className="flex justify-between items-center mb-8">
          <div className="relative w-full max-w-2xl items-center mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 pl-10 rounded-full bg-[#2d2838] text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 ml-4 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200"
          >
            Logout
          </button>
        </div>

        {/* Featured Carousel */}
        <section className="mb-12">
          <div className="relative rounded-lg overflow-hidden">
            <div className="aspect-[2/1] bg-gradient-to-r from-purple-900 to-purple-600 p-8 flex items-center">
              <div className="flex-1">
                <h2 className="text-4xl font-bold text-white mb-4">{carouselItems[currentSlide].title}</h2>
                <p className="text-gray-300 mb-4 max-w-md">{carouselItems[currentSlide].description}</p>
                <div className="text-2xl font-bold text-white">{carouselItems[currentSlide].price}</div>
              </div>
              <div className="flex-1 flex justify-center">
                <img
                  src={carouselItems[currentSlide].image}
                  alt="Featured Album"
                  className="w-64 h-64 object-cover transform rotate-[-5deg]"
                />
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <FaChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <FaChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {carouselItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Suggested Artists */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">SUGGESTED ARTISTS</h2>
            <div className="flex space-x-2">
              <button className="p-2 rounded-full bg-[#2d2838] text-white hover:bg-purple-700">
                <FaChevronLeft />
              </button>
              <button className="p-2 rounded-full bg-[#2d2838] text-white hover:bg-purple-700">
                <FaChevronRight />
              </button>
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {Array(8).fill(null).map((_, index) => (
              <div key={index} className="flex-shrink-0">
                <img
                  src="/images/placeholder.jpg"
                  alt={`Artist ${index + 1}`}
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">REVIEWS</h2>
            <a href="#" className="text-gray-400 hover:text-white">See All</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(null).map((_, index) => (
              <div key={index} className="bg-[#2d2838] rounded-lg overflow-hidden">
                <img
                  src="/images/placeholder.jpg"
                  alt={`Review ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-white font-bold mb-2">CHROMAKOPIA</h3>
                  <p className="text-gray-400 text-sm mb-4">Lorem ipsum dolor sit amet sed do eiusmod tempor Lorem ipsum dolor sit amet sed do eiusmod tempor</p>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Ashish Paul, 20th Dec</span>
                    <button className="px-4 py-1 bg-[#ff4d4d] text-white rounded-full text-sm">Read More</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Discover by Genre */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">DISCOVER BY GENRE</h2>
            <a href="#" className="text-gray-400 hover:text-white">See More</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(null).map((_, index) => (
              <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#2d2838]">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <img
                  src="/images/placeholder.jpg"
                  alt={`Genre ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-white text-xl font-bold">Trending</h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
} 