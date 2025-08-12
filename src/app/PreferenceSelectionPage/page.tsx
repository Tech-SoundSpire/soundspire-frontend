/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { Search, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Language {
  name: string;
  color: string;
  char: string;
}

interface Genre {
  name: string;
  img: string;
}

interface Artist {
    name: string;
    img: string;
}

interface Selections {
  languages: string[];
  genres: string[];
  artists: string[];
}

// --- MOCK DATA ---
const languagesData: Language[] = [
  { name: 'English', color: 'bg-teal-500', char: 'a' },
  { name: 'Hindi', color: 'bg-orange-500', char: 'अ' },
  { name: 'Urdu', color: 'bg-yellow-500', char: 'ع' },
  { name: 'Punjabi', color: 'bg-pink-500', char: 'ਪ' },
  { name: 'Tamil', color: 'bg-blue-500', char: 'த' },
  { name: 'Telugu', color: 'bg-green-500', char: 'తె' },
  { name: 'Marathi', color: 'bg-indigo-500', char: 'म' },
  { name: 'Bengali', color: 'bg-red-500', char: 'ব' },
];

const genresData: Genre[] = [
  { name: 'Trending', img: 'https://placehold.co/200x200/9333ea/FFFFFF?text=Trending' },
  { name: 'Pop', img: 'https://placehold.co/200x200/db2777/FFFFFF?text=Pop' },
  { name: 'Hip-Hop', img: 'https://placehold.co/200x200/f59e0b/FFFFFF?text=Hip-Hop' },
  { name: 'Electronic', img: 'https://placehold.co/200x200/10b981/FFFFFF?text=Electronic' },
  { name: 'Rock', img: 'https://placehold.co/200x200/ef4444/FFFFFF?text=Rock' },
  { name: 'Indie', img: 'https://placehold.co/200x200/6366f1/FFFFFF?text=Indie' },
  { name: 'Classical', img: 'https://placehold.co/200x200/84cc16/FFFFFF?text=Classical' },
  { name: 'Jazz', img: 'https://placehold.co/200x200/3b82f6/FFFFFF?text=Jazz' },
];

const artistsData: Artist[] = Array(10).fill({
  name: 'Ed Sheeran',
  img: 'https://placehold.co/150x150/d1d5db/1f2937?text=Artist',
});


// --- HELPER COMPONENTS ---

// Search Bar Component
const SearchBar: React.FC<{ placeholder: string }> = ({ placeholder }) => (
  <div className="relative w-full max-w-md mx-auto">
    <input
      type="text"
      placeholder={placeholder}
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
}

// Step 1: Language Selection
const LanguageSelection: React.FC<SelectionProps<string>> = ({ selected, onSelect }) => {
  const handleSelect = (langName: string) => {
    const isSelected = selected.includes(langName);
    if (isSelected) {
      onSelect(selected.filter((item) => item !== langName));
    } else if (selected.length < 5) {
      onSelect([...selected, langName]);
    }
  };

  return (
    <div className="w-full flex-shrink-0">
      <h1 className="text-2xl md:text-3xl font-bold mb-1">Choose Your Languages</h1>
      <p className="text-sm text-gray-400 mb-8">Choose up to 5 Languages</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
        {languagesData.map((lang) => (
          <div
            key={lang.name}
            onClick={() => handleSelect(lang.name)}
            className={`rounded-lg p-4 flex flex-col justify-between h-28 md:h-32 cursor-pointer transition-all duration-300 transform hover:scale-105 ${lang.color} ${selected.includes(lang.name) ? 'ring-2 ring-offset-2 ring-offset-[#120B1A] ring-white' : ''}`}
          >
            <span className="font-bold text-lg">{lang.name}</span>
            <span className="text-4xl font-bold self-end opacity-50">{lang.char}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Step 2: Genre Selection
const GenreSelection: React.FC<SelectionProps<string>> = ({ selected, onSelect }) => {
    const handleSelect = (genreName: string) => {
        const isSelected = selected.includes(genreName);
        if (isSelected) {
            onSelect(selected.filter((item) => item !== genreName));
        } else if (selected.length < 5) {
            onSelect([...selected, genreName]);
        }
    };

    return (
        <div className="w-full flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Choose Your Favourite Genre</h1>
            <p className="text-sm text-gray-400 mb-8">Choose up to 5 Genres</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                {genresData.map((genre) => (
                    <div
                        key={genre.name}
                        onClick={() => handleSelect(genre.name)}
                        className={`rounded-lg overflow-hidden relative h-32 md:h-40 cursor-pointer transition-all duration-300 transform hover:scale-105 group ${selected.includes(genre.name) ? 'ring-2 ring-offset-2 ring-offset-[#120B1A] ring-white' : ''}`}
                    >
                        <img src={genre.img} alt={genre.name} className="w-full h-full object-cover group-hover:brightness-75 transition-all" />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                            <span className="font-bold text-lg">{genre.name}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


// Step 3: Artist Selection
const ArtistSelection: React.FC<SelectionProps<string>> = ({ selected, onSelect }) => {
    const handleSelect = (artistId: string) => {
        const isSelected = selected.includes(artistId);
        if (isSelected) {
            onSelect(selected.filter((item) => item !== artistId));
        } else if (selected.length < 5) {
            onSelect([...selected, artistId]);
        }
    };

    return (
        <div className="w-full flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Choose Your Favourite Artists</h1>
            <p className="text-sm text-gray-400 mb-8">Choose up to 5 Artists</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 md:gap-6">
                {artistsData.map((artist, index) => {
                    const uniqueArtistId = `${artist.name}-${index}`;
                    const isSelected = selected.includes(uniqueArtistId);
                    return (
                        <div
                            key={uniqueArtistId}
                            onClick={() => handleSelect(uniqueArtistId)}
                            className="relative cursor-pointer transition-all duration-300 transform hover:scale-105 group"
                        >
                            <img src={artist.img} alt={artist.name} className="w-full h-auto rounded-full aspect-square object-cover" />
                            <div className={`absolute inset-0 rounded-full bg-black transition-opacity duration-300 ${isSelected ? 'bg-opacity-50' : 'bg-opacity-0 group-hover:bg-opacity-30'}`}></div>
                            {isSelected && (
                                <div className="absolute inset-0 flex items-center justify-center">
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
const App: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [selections, setSelections] = useState<Selections>({
    languages: [],
    genres: [],
    artists: [],
  });

  const handleSelect = <K extends keyof Selections>(category: K, items: Selections[K]) => {
    setSelections(prev => ({ ...prev, [category]: items }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));
  const goToStep = (stepNumber: number) => setStep(stepNumber);

  const placeholders: string[] = ["Find Your Language...", "Find Your Genre...", "Find Your Artists..."];

  return (
    <div className="bg-[#120B1A] text-white min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-4xl mx-auto space-y-8">
        {/* Search Bar */}
        <SearchBar placeholder={placeholders[step - 1]} />

        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
          >
            <div className="w-full flex-shrink-0 px-2">
              <LanguageSelection selected={selections.languages} onSelect={(items) => handleSelect('languages', items)} />
            </div>
            <div className="w-full flex-shrink-0 px-2">
              <GenreSelection selected={selections.genres} onSelect={(items) => handleSelect('genres', items)} />
            </div>
            <div className="w-full flex-shrink-0 px-2">
              <ArtistSelection selected={selections.artists} onSelect={(items) => handleSelect('artists', items)} />
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
                className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2"
              >
                Next
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={() => alert('Setup Complete! Selections: ' + JSON.stringify(selections, null, 2))}
                className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
