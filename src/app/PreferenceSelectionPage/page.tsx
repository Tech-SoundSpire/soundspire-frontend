/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getImageUrl, getDefaultProfileImageUrl } from '@/utils/userProfileImageUtils';

// --- TYPE DEFINITIONS ---
interface Language {
  language_id: string;
  name: string;
  color: string;
  char: string;
}

interface Genre {
  genre_id: string;
  name: string;
  img: string;
}

interface Artist {
  artist_id: string;
  name: string;
  img: string;
}

interface Selections {
  languages: Language[];
  genres: Genre[];
  artists: Artist[];
}

// --- HELPER COMPONENTS ---

// Search Bar Component
const SearchBar: React.FC<{ placeholder: string; onSearch: (query: string) => void }> = ({ placeholder, onSearch }) => (
  <div className="relative w-full max-w-md mx-auto">
    <input
      type="text"
      placeholder={placeholder}
      onChange={(e) => onSearch(e.target.value)}
      className="w-full py-3 px-5 rounded-full bg-[#1e122d] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
    />
    <Search className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" />
  </div>
);

// Pagination Dots Component
interface PaginationProps {
    total: number;
    current: number;
    onDotClick: (step: number) => void;
}
const Pagination: React.FC<PaginationProps> = ({ total, current, onDotClick }) => (
  <div className="flex justify-center items-center space-x-3">
    {Array.from({ length: total }).map((_, i) => (
      <button
        key={i}
        onClick={() => onDotClick(i + 1)}
        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
          current === i + 1 ? 'bg-white scale-125' : 'bg-gray-600'
        }`}
        aria-label={`Go to step ${i + 1}`}
      />
    ))}
  </div>
);

// --- SELECTION SCREEN COMPONENTS ---

interface SelectionProps<T> {
    selected: T[];
    onSelect: (selected: T[]) => void;
    items: T[];
    searchQuery: string;
}

// Step 1: Language Selection
const LanguageSelection: React.FC<SelectionProps<Language>> = ({ selected, onSelect, items, searchQuery }) => {
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (language: Language) => {
    const isSelected = selected.some(item => item.language_id === language.language_id);
    if (isSelected) {
      onSelect(selected.filter(item => item.language_id !== language.language_id));
    } else if (selected.length < 5) {
      onSelect([...selected, language]);
    } else {
      toast.error('You can select up to 5 languages');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-3xl font-bold mb-2">Choose Your Languages</h2>
        <p className="text-orange-400 font-medium">Choose upto 5 Languages</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredItems.map((language) => {
          const isSelected = selected.some(item => item.language_id === language.language_id);
          return (
            <div
              key={language.language_id}
              onClick={() => handleToggle(language)}
              className={`relative cursor-pointer group transition-all duration-300 ${
                isSelected ? 'scale-105' : 'hover:scale-105'
              }`}
            >
              <div className={`aspect-square rounded-2xl ${language.color} flex items-center justify-center text-white text-4xl font-bold transition-all duration-300 ${
                isSelected ? 'ring-4 ring-orange-400 shadow-lg' : 'group-hover:shadow-lg'
              }`}>
                {language.char}
              </div>
              <p className="text-center mt-2 font-medium">{language.name}</p>
              
              {isSelected && (
                <div className="absolute -top-2 -right-2">
                  <CheckCircle className="w-8 h-8 text-white bg-orange-500 rounded-full p-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Step 2: Genre Selection
const GenreSelection: React.FC<SelectionProps<Genre>> = ({ selected, onSelect, items, searchQuery }) => {
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (genre: Genre) => {
    const isSelected = selected.some(item => item.genre_id === genre.genre_id);
    if (isSelected) {
      onSelect(selected.filter(item => item.genre_id !== genre.genre_id));
    } else if (selected.length < 5) {
      onSelect([...selected, genre]);
    } else {
      toast.error('You can select up to 5 genres');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-3xl font-bold mb-2">Choose Your Favourite Genre</h2>
        <p className="text-orange-400 font-medium">Choose upto 5 Genres</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredItems.map((genre) => {
          const isSelected = selected.some(item => item.genre_id === genre.genre_id);
          return (
            <div
              key={genre.genre_id}
              onClick={() => handleToggle(genre)}
              className={`relative cursor-pointer group transition-all duration-300 ${
                isSelected ? 'scale-105' : 'hover:scale-105'
              }`}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <img
                  src={genre.img}
                  alt={genre.name}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-white text-lg font-bold text-center">{genre.name}</h3>
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute -top-2 -right-2">
                  <CheckCircle className="w-8 h-8 text-white bg-orange-500 rounded-full p-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Step 3: Artist Selection
const ArtistSelection: React.FC<SelectionProps<Artist>> = ({ selected, onSelect, items, searchQuery }) => {
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (artist: Artist) => {
    const isSelected = selected.some(item => item.artist_id === artist.artist_id);
    if (isSelected) {
      onSelect(selected.filter(item => item.artist_id !== artist.artist_id));
    } else if (selected.length < 5) {
      onSelect([...selected, artist]);
    } else {
      toast.error('You can select up to 5 artists');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h2 className="text-3xl font-bold mb-2">Choose Your Favourite Artists</h2>
        <p className="text-orange-400 font-medium">Choose upto 5 Artists</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {filteredItems.map((artist, index) => {
          const isSelected = selected.some(item => item.artist_id === artist.artist_id);
          return (
            <div
              key={index}
              onClick={() => handleToggle(artist)}
              className={`relative cursor-pointer group transition-all duration-300 ${
                isSelected ? 'scale-105' : 'hover:scale-105'
              }`}
            >
              <div className="relative aspect-square rounded-full overflow-hidden">
                <img
                  src={artist.img}
                  alt={artist.name}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
                />
              </div>
              <p className="text-center mt-2 text-sm font-medium truncate">{artist.name}</p>
              
              {isSelected && (
                <div className="absolute -top-2 -right-2">
                  <CheckCircle className="w-8 h-8 text-white bg-orange-500 rounded-full p-1" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
const PreferenceSelectionPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [selections, setSelections] = useState<Selections>({
    languages: [],
    genres: [],
    artists: [],
  });
  const [searchQueries, setSearchQueries] = useState({
    languages: '',
    genres: '',
    artists: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [availableArtists, setAvailableArtists] = useState<Artist[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Load available options from database
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Load languages
        const languagesResponse = await axios.get('/api/preferences/available/languages');
        const languagesData = languagesResponse.data.languages.map((lang: any) => ({
          ...lang,
          color: getRandomColor(),
          char: lang.name.charAt(0).toUpperCase()
        }));
        setAvailableLanguages(languagesData);

        // Load genres
        const genresResponse = await axios.get('/api/preferences/available/genres');
        const genresData = genresResponse.data.genres.map((genre: any) => ({
          ...genre,
          img: `https://placehold.co/600x400/111827/FFFFFF?text=${encodeURIComponent(genre.name)}`
        }));
        setAvailableGenres(genresData);

        // Load real artists from the database
        const artistsResponse = await axios.get('/api/preferences/available/artists');
        const artistsData = artistsResponse.data.artists.map((artist: any) => ({
          artist_id: artist.artist_id,
          name: artist.artist_name,
          img: getImageUrl(artist.profile_picture_url || getDefaultProfileImageUrl())
        }));
        setAvailableArtists(artistsData);
      } catch (error) {
        console.error('Error loading options:', error);
        toast.error('Failed to load preference options');
      }
    };

    if (user) {
      loadOptions();
    }
  }, [user]);

  const getRandomColor = () => {
    const colors = ['bg-teal-500', 'bg-orange-500', 'bg-yellow-500', 'bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-indigo-500', 'bg-red-500'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getRandomHexColor = () => {
    return Math.floor(Math.random() * 16777215).toString(16);
  };

  const handleSelect = <K extends keyof Selections>(category: K, items: Selections[K]) => {
    setSelections(prev => ({ ...prev, [category]: items }));
  };

  const handleSearch = (category: keyof typeof searchQueries, query: string) => {
    setSearchQueries(prev => ({ ...prev, [category]: query }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  const goToStep = (stepNumber: number) => setStep(stepNumber);

  const savePreferences = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      await axios.post('/api/preferences/save', {
        userId: user.id,
        genres: selections.genres.map((g: any) => g.name),
        languages: selections.languages.map((l: any) => l.name),
        favoriteArtists: selections.artists.map((a: any) => a.name) // Send artist names, API will convert to IDs
      });

      toast.success('Preferences saved successfully!');
      router.push('/explore');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const placeholders: string[] = ["Find Your Language...", "Find Your Genre...", "Find Your Artists..."];

  if (authLoading) {
    return (
      <div className="bg-[#120B1A] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="bg-[#120B1A] text-white min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Search Bar */}
        <SearchBar 
          placeholder={placeholders[step - 1]} 
          onSearch={(query) => handleSearch(Object.keys(searchQueries)[step - 1] as keyof typeof searchQueries, query)}
        />

        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
          >
            <div className="w-full flex-shrink-0 px-2 overflow-hidden">
              <LanguageSelection 
                selected={selections.languages} 
                onSelect={(items) => handleSelect('languages', items)}
                items={availableLanguages}
                searchQuery={searchQueries.languages}
              />
            </div>
            <div className="w-full flex-shrink-0 px-2 overflow-hidden">
              <GenreSelection 
                selected={selections.genres} 
                onSelect={(items) => handleSelect('genres', items)}
                items={availableGenres}
                searchQuery={searchQueries.genres}
              />
            </div>
            <div className="w-full flex-shrink-0 px-2 overflow-hidden">
              <ArtistSelection 
                selected={selections.artists} 
                onSelect={(items) => handleSelect('artists', items)}
                items={availableArtists}
                searchQuery={searchQueries.artists}
              />
            </div>
          </div>
        </div>

        {/* Footer: Pagination and Navigation */}
        <div className="flex items-center justify-between mt-8">
          {/* Prev Button */}
          <div>
            {step > 1 && (
              <button
                onClick={prevStep}
                className="bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-all flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Prev
              </button>
            )}
          </div>

          {/* Pagination Dots */}
          <Pagination total={3} current={step} onDotClick={goToStep} />

          {/* Next/Done Button */}
          <div>
            {step < 3 ? (
              <button
                onClick={nextStep}
                disabled={step === 1 && selections.languages.length === 0 || 
                         step === 2 && selections.genres.length === 0}
                className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={savePreferences}
                disabled={isLoading || selections.artists.length === 0}
                className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreferenceSelectionPage;
