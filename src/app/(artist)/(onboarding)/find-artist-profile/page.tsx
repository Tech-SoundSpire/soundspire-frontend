'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import { createPortal } from 'react-dom';

export default function FindArtistPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backgroundTiles, setBackgroundTiles] = useState<JSX.Element[]>([]);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const savedSearch = sessionStorage.getItem('artistSearchQuery');
    const savedResults = sessionStorage.getItem('artistSearchResults');

    if (savedSearch) setSearchQuery(savedSearch);
    if (savedResults) setResults(JSON.parse(savedResults));

    const tiles = Array.from({ length: 48 }, (_, i) => {
      const hue1 = Math.floor(Math.random() * 360);
      const hue2 = Math.floor(Math.random() * 360);
      return (
        <div
          key={i}
          className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-lg transform rotate-12 hover:rotate-0 transition-transform duration-300"
          style={{
            background: `linear-gradient(45deg, hsl(${hue1}, 70%, 60%), hsl(${hue2}, 70%, 40%))`,
          }}
        />
      );
    });
    setBackgroundTiles(tiles);
  }, []);

  const handleBack = () => router.back();

  useEffect(() => {
    if (!mounted) return;

    if (!searchQuery.trim()) {
      setResults([]);
      sessionStorage.removeItem('artistSearchQuery');
      sessionStorage.removeItem('artistSearchResults');
      return;
    }

    sessionStorage.setItem('artistSearchQuery', searchQuery);

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/artists?q=${encodeURIComponent(searchQuery)}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const items = data?.items || [];
        setResults(items);

        sessionStorage.setItem('artistSearchResults', JSON.stringify(items));
      } catch (err) {
        console.error(err);
        setError('Failed to load artists. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, mounted]);

  const handleArtistClick = (artist: any) => {
    router.push(`/payout?artistId=${artist.id}`);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#1a1625] text-white relative overflow-hidden">
      {document.getElementById('header-actions') &&
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
      <div className="text-center mb-8 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-[#FFD0C2] mb-6">
          Find Your Artist Profile
        </h1>

        <div className="max-w-2xl mx-auto relative">
          <input
            type="text"
            placeholder="Search artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-6 py-4 bg-gradient-to-r from-[#2d2838] to-[#3a3448] text-white rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FA6400] placeholder-gray-400 text-lg"
          />
          <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
        </div>

        {/* Results */}
        <div className="mt-8 max-w-2xl mx-auto text-left">
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-400">{error}</p>}
          {!loading && results.length > 0 && (
            <ul className="space-y-4">
              {results.map((artist, i) => (
                <li
                  key={i}
                  onClick={() => handleArtistClick(artist)}
                  className="p-4 bg-[#2d2838] rounded-lg cursor-pointer hover:bg-[#3a3248] transition-colors duration-200"
                >
                  <p className="font-bold text-lg">{artist.name}</p>
                  <p className="text-sm text-gray-400">
                    {artist.genres?.length > 0
                      ? artist.genres[0]?.root ?? 'Unknown Genre'
                      : 'Unknown Genre'}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {!loading && searchQuery && results.length === 0 && <p>No artists found.</p>}
        </div>
      </div>

      <div className="relative h-96 md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 transform rotate-12 scale-110">
            {backgroundTiles}
          </div>
        </div>
      </div>
    </div>
  );
}
