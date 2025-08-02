'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaMusic, FaRecordVinyl, FaFolder, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { getImageUrl } from '@/utils/userProfileImageUtils';

const roleCards = [
  {
    id: 'artist',
    title: 'Artist',
    description: 'Discover your sound and grow your fanbase. Access tools that help you create, promote, and thrive.',
    icon: FaMusic,
    color: '#FA6400'
  },
  {
    id: 'record-label',
    title: 'Record Label',
    description: 'Manage rosters, track releases, and amplify your reach. Built to scale with your artists\' success.',
    icon: FaRecordVinyl,
    color: '#FA6400'
  },
  {
    id: 'manager',
    title: 'Manager',
    description: 'Handle bookings, royalties, and team coordination. Stay in sync with your artists, always.',
    icon: FaFolder,
    color: '#FA6400'
  }
];

export default function ArtistOnboardingPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const router = useRouter();

  const handleRoleSelection = (roleId: string) => {
    setSelectedRole(roleId);
    // You can add navigation logic here based on the selected role
    // For now, we'll just store the selection
  };

  return (
    <div className="min-h-screen bg-[#1a1625] text-white relative overflow-hidden">
      {/* Top Right Arrow */}
      {/* <div className="absolute top-4 right-4 z-20">
        <button className="w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200">
          <FaArrowRight className="text-black text-xl" />
        </button>
      </div> */}
      
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

                 {/* Welcome Message */}
         <div className="text-center mb-8">
           <h1 className="text-4xl md:text-6xl font-bold text-[#FA6400] mb-4">
             Welcome to SoundSpire
           </h1>
          <p className="text-xl text-white mb-2">
            We are excited to have you <span className="text-[#FA6400]">on-board!</span>
          </p>
          <p className="text-lg text-white">
            To know you better, let us which of the following best describes you:
          </p>
        </div>
      </div>

      {/* Middle Selection Area */}
      <div className="relative z-10 px-8 mb-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roleCards.map((card) => (
              <div
                key={card.id}
                onClick={() => handleRoleSelection(card.id)}
                className={`bg-[#2d2838] rounded-lg p-6 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedRole === card.id ? 'ring-2 ring-[#FA6400]' : ''
                }`}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#FA6400] rounded-full flex items-center justify-center mx-auto mb-4">
                    <card.icon className="text-white text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{card.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Image Collage */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2 transform rotate-12 scale-110">
            {/* Album covers - creating a collage effect */}
            {Array.from({ length: 24 }, (_, i) => (
              <div
                key={i}
                className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg transform rotate-12 hover:rotate-0 transition-transform duration-300"
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