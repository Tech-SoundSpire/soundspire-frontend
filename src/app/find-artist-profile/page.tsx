'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import { getImageUrl } from '@/utils/userProfileImageUtils';

export default function FindArtistPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality here
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="min-h-screen bg-[#1a1625] text-white relative overflow-hidden">
      {/* Top Right Back Button */}
      <div className="absolute top-4 right-4 z-20">
        <button 
          onClick={handleBack}
          className="w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200"
        >
          <FaArrowLeft className="text-black text-xl" />
        </button>
      </div>

      {/* Top Header Area */}
      <div className="relative z-10 p-8">
        {/* Logo */}
        <div className="flex items-center mb-8">
          <div className="flex items-center">
            <img
              src={getImageUrl('s3://soundspirewebsiteassets/assets/ss_logo.png')}
              alt="SoundSpire Logo"
              width={100}
              height={100}
              className="mr-3 object-contain"
            />
            <span className="text-white text-2xl font-bold">SoundSpire</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-[#FFD0C2] mb-6">
            Find Your Artist Profile
          </h1>
          <p className="text-xl text-white mb-8 italic max-w-4xl mx-auto leading-relaxed">
            Find your musical obsession! Search for artists—whether legends, rising stars, or hidden gems—and dive into their world of tracks, albums, and vibes. The perfect beat is just a name away.
          </p>

                     {/* Search Bar */}
           <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
             <div className="relative">
               <input
                 type="text"
                 placeholder="Search"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full px-6 py-4 bg-gradient-to-r from-[#2d2838] to-[#3a3448] text-white rounded-full border border-gray-600 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FA6400] focus:border-transparent placeholder-gray-400 text-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#FA6400]/20"
               />
               <button
                 type="submit"
                 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
               >
                 <FaSearch className="text-xl" />
               </button>
             </div>
           </form>
        </div>
      </div>

      {/* Bottom Album Collage Background */}
      <div className="relative h-96 md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 transform rotate-12 scale-110">
            {/* Album covers - creating a collage effect */}
            {Array.from({ length: 48 }, (_, i) => (
              <div
                key={i}
                className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg transform rotate-12 hover:rotate-0 transition-transform duration-300"
                style={{
                  background: `linear-gradient(45deg, 
                    hsl(${Math.random() * 360}, 70%, 60%), 
                    hsl(${Math.random() * 360}, 70%, 40%))`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 