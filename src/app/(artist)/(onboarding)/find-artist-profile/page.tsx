'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import { createPortal } from 'react-dom';

export default function FindArtistPage() {
  const [mounted,setMounted]=useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(()=>{
    setMounted(true)
  },[])

  const handleBack = () => router.back();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/artists?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setResults(data?.items || []); // adapt to Soundcharts response
    } catch (err) {
      console.error('Error fetching artists:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1625] text-white relative overflow-hidden">
      {/* Header actions - Back button */}
      {mounted &&
        createPortal(
          <button
            onClick={handleBack}
            className="w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <FaArrowLeft className="text-black text-xl" />
          </button>,
          document.getElementById('header-actions') as HTMLElement
        )}

      {/* Search */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-[#FFD0C2] mb-6">
          Find Your Artist Profile
        </h1>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-gradient-to-r from-[#2d2838] to-[#3a3448] text-white rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FA6400] placeholder-gray-400 text-lg"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <FaSearch className="text-xl" />
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="mt-8 max-w-2xl mx-auto text-left">
          {loading && <p>Loading...</p>}
          {!loading && results.length > 0 && (
            <ul className="space-y-4">
              {results.map((artist, i) => (
                <li key={i} className="p-4 bg-[#2d2838] rounded-lg">
                  <p className="font-bold text-lg">{artist.name}</p>
                  <p className="text-sm text-gray-400">
                    {artist.genres?.length > 0
                      ? artist.genres[0]?.root ?? "Unknown Genre"
                      : "Unknown Genre"}
                  </p>

                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="relative h-96 md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 transform rotate-12 scale-110">
            {Array.from({ length: 48 }, (_, i) => (
              <div
                key={i}
                className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg transform rotate-12 hover:rotate-0 transition-transform duration-300"
                style={{
                  background: `linear-gradient(45deg, 
                    hsl(${Math.random() * 360}, 70%, 60%), 
                    hsl(${Math.random() * 360}, 70%, 40%))`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>

    
  );
}


