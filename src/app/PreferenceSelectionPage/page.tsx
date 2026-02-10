/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import {
    getImageUrl,
    getDefaultProfileImageUrl,
} from "@/utils/userProfileImageUtils";
import useCheckCompleteProfileOnRoute from "@/hooks/useCheckCompleteProfileOnRoute";
import useCheckPreferencesOnRoute from "@/hooks/useCheckPreferencesOnRoute";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import BaseText from "@/components/BaseText/BaseText";
import ISO6391 from "iso-639-1";
import musicGenres from "music-genres";

// --- TYPE DEFINITIONS ---
interface Language {
    language_id: string;
    name: string;
    nativeName: string;
    color: string;
}

interface Genre {
    genre_id: string;
    name: string;
    isParent: boolean;
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
const SearchBar: React.FC<{
    placeholder: string;
    onSearch: (query: string) => void;
}> = ({ placeholder, onSearch }) => (
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
const Pagination: React.FC<PaginationProps> = ({
    total,
    current,
    onDotClick,
}) => (
    <div className="flex justify-center items-center space-x-3">
        {Array.from({ length: total }).map((_, i) => (
            <button
                key={i}
                onClick={() => onDotClick(i + 1)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    current === i + 1 ? "bg-white scale-125" : "bg-gray-600"
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
const LanguageSelection: React.FC<SelectionProps<Language>> = ({
    selected,
    onSelect,
    items,
    searchQuery,
}) => {
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggle = (language: Language) => {
        const isSelected = selected.some(
            (item) => item.language_id === language.language_id
        );
        if (isSelected) {
            onSelect(
                selected.filter(
                    (item) => item.language_id !== language.language_id
                )
            );
        } else if (selected.length < 5) {
            onSelect([...selected, language]);
        } else {
            toast.error("You can select up to 5 languages");
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-left">
                <BaseHeading
                    fontSize="large"
                    fontWeight={700}
                    className="mb-2"
                    textAlign="left"
                >
                    Choose Your Languages
                </BaseHeading>
                <BaseText textColor="#fb923c" fontWeight={500} textAlign="left">
                    Choose upto 5 Languages
                </BaseText>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredItems.map((language) => {
                    const isSelected = selected.some(
                        (item) => item.language_id === language.language_id
                    );
                    return (
                        <div
                            key={language.language_id}
                            onClick={() => handleToggle(language)}
                            className={`relative cursor-pointer group transition-all duration-300 ${
                                isSelected ? "scale-105" : "hover:scale-105"
                            }`}
                        >
                            <div
                                className={`aspect-[4/3] rounded-2xl ${
                                    language.color
                                } flex flex-col items-center justify-center gap-1 text-white transition-all duration-300 ${
                                    isSelected
                                        ? "ring-4 ring-orange-400 shadow-lg shadow-orange-400/20"
                                        : "group-hover:shadow-lg group-hover:brightness-110"
                                }`}
                            >
                                <span className="text-2xl md:text-3xl font-bold leading-tight">
                                    {language.nativeName}
                                </span>
                            </div>
                            <p className="text-center mt-2 text-sm text-gray-300 font-medium">
                                {language.name}
                            </p>

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

// Genre color mapping for parent genres
const genreColors: Record<string, string> = {
    Alternative: "border-purple-500 bg-purple-500/10",
    Blues: "border-blue-500 bg-blue-500/10",
    Country: "border-amber-500 bg-amber-500/10",
    Electronic: "border-cyan-500 bg-cyan-500/10",
    "Hip Hop Rap": "border-red-500 bg-red-500/10",
    Jazz: "border-yellow-500 bg-yellow-500/10",
    Latino: "border-orange-500 bg-orange-500/10",
    Metal: "border-gray-400 bg-gray-400/10",
    Pop: "border-pink-500 bg-pink-500/10",
    Punk: "border-green-500 bg-green-500/10",
    "R B Soul": "border-violet-500 bg-violet-500/10",
    Reggae: "border-emerald-500 bg-emerald-500/10",
    Rock: "border-rose-500 bg-rose-500/10",
};

const genreEmojis: Record<string, string> = {
    Alternative: "🎸", Blues: "🎷", Country: "🤠", Electronic: "🎛️",
    "Hip Hop Rap": "🎤", Jazz: "🎺", Latino: "💃", Metal: "🤘",
    Pop: "🎵", Punk: "⚡", "R B Soul": "🎙️", Reggae: "🌴", Rock: "🎸",
};

// Step 2: Genre Selection
const GenreSelection: React.FC<SelectionProps<Genre>> = ({
    selected,
    onSelect,
    items,
    searchQuery,
}) => {
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggle = (genre: Genre) => {
        const isSelected = selected.some(
            (item) => item.genre_id === genre.genre_id
        );
        if (isSelected) {
            onSelect(
                selected.filter((item) => item.genre_id !== genre.genre_id)
            );
        } else if (selected.length < 5) {
            onSelect([...selected, genre]);
        } else {
            toast.error("You can select up to 5 genres");
        }
    };

    // Group: parent genres shown as big cards, subgenres as pills
    const parentGenres = filteredItems.filter((g) => g.isParent);
    const subGenres = filteredItems.filter((g) => !g.isParent);

    return (
        <div className="space-y-6">
            <div className="text-left">
                <BaseHeading
                    headingLevel="h2"
                    className="text-3xl font-bold mb-2"
                >
                    Choose Your Favorite Genres
                </BaseHeading>
                <BaseText textColor="#fb923c" fontWeight={500}>
                    Choose up to 5 Genres
                </BaseText>
            </div>

            {/* Parent genres as cards */}
            {parentGenres.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {parentGenres.map((genre) => {
                        const isSelected = selected.some(
                            (item) => item.genre_id === genre.genre_id
                        );
                        const color = genreColors[genre.name] || "border-gray-500 bg-gray-500/10";
                        const emoji = genreEmojis[genre.name] || "🎶";
                        return (
                            <div
                                key={genre.genre_id}
                                onClick={() => handleToggle(genre)}
                                className={`relative cursor-pointer group transition-all duration-200 rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 ${color} ${
                                    isSelected
                                        ? "!border-orange-400 !bg-orange-400/20 shadow-lg shadow-orange-400/20 scale-105"
                                        : "hover:brightness-125 hover:scale-105"
                                }`}
                            >
                                <span className="text-3xl">{emoji}</span>
                                <span className="text-white text-sm font-bold text-center">
                                    {genre.name}
                                </span>
                                {isSelected && (
                                    <div className="absolute -top-2 -right-2">
                                        <CheckCircle className="w-7 h-7 text-white bg-orange-500 rounded-full p-0.5" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Subgenres as pills */}
            {subGenres.length > 0 && (
                <>
                    {parentGenres.length > 0 && (
                        <BaseText textColor="#9ca3af" fontSize="small" className="mt-2">
                            Subgenres
                        </BaseText>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {subGenres.map((genre) => {
                            const isSelected = selected.some(
                                (item) => item.genre_id === genre.genre_id
                            );
                            return (
                                <button
                                    key={genre.genre_id}
                                    onClick={() => handleToggle(genre)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                                        isSelected
                                            ? "border-orange-400 bg-orange-500/20 text-orange-300"
                                            : "border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-400 hover:bg-gray-700/50"
                                    }`}
                                >
                                    {isSelected && "✓ "}{genre.name}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

// Step 3: Artist Selection
const ArtistSelection: React.FC<SelectionProps<Artist>> = ({
    selected,
    onSelect,
    items,
    searchQuery,
}) => {
    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleToggle = (artist: Artist) => {
        const isSelected = selected.some(
            (item) => item.artist_id === artist.artist_id
        );
        if (isSelected) {
            onSelect(
                selected.filter((item) => item.artist_id !== artist.artist_id)
            );
        } else if (selected.length < 5) {
            onSelect([...selected, artist]);
        } else {
            toast.error("You can select up to 5 artists");
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-left">
                <h2 className="text-3xl font-bold mb-2">
                    Choose Your Favourite Artists
                </h2>
                <p className="text-orange-400 font-medium">
                    Choose upto 5 Artists
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {filteredItems.map((artist, index) => {
                    const isSelected = selected.some(
                        (item) => item.artist_id === artist.artist_id
                    );
                    return (
                        <div
                            key={index}
                            onClick={() => handleToggle(artist)}
                            className={`relative cursor-pointer group transition-all duration-300 ${
                                isSelected ? "scale-105" : "hover:scale-105"
                            }`}
                        >
                            <div className="relative aspect-square rounded-full overflow-hidden">
                                <img
                                    src={artist.img}
                                    alt={artist.name}
                                    className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
                                />
                            </div>
                            <p className="text-center mt-2 text-sm font-medium truncate">
                                {artist.name}
                            </p>

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
        languages: "",
        genres: "",
        artists: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [availableLanguages, setAvailableLanguages] = useState<Language[]>(
        []
    );
    const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
    const [availableArtists, setAvailableArtists] = useState<Artist[]>([]);

    // Profile & Preferences checks
    const { isProfileComplete, isLoading: profileLoading } =
        useCheckCompleteProfileOnRoute();
    const { hasPreferences, isLoading: preferencesLoading } =
        useCheckPreferencesOnRoute();

    useEffect(() => {
        if (authLoading || profileLoading || preferencesLoading) {
            return;
        }

        // If no user, redirect to login
        if (!user) {
            router.replace("/login");
            return;
        }

        // If artist, redirect to artist dashboard
        if (user.role === "artist") {
            router.replace("/artist/dashboard");
            return;
        }

        // If profile is not complete, redirect to complete-profile
        if (!isProfileComplete) {
            router.replace("/complete-profile");
            return;
        }

        // If preferences already exist, redirect to explore
        if (hasPreferences) {
            router.replace("/explore");
            return;
        }

        // Otherwise, stay on this page (preferences selection)
    }, [
        authLoading,
        profileLoading,
        preferencesLoading,
        user,
        isProfileComplete,
        hasPreferences,
        router,
    ]);

    // Load available options — languages & genres from packages, artists from DB
    useEffect(() => {
        // Languages from iso-639-1
        const colors = [
            "bg-teal-500", "bg-orange-500", "bg-yellow-500", "bg-pink-500",
            "bg-blue-500", "bg-green-500", "bg-indigo-500", "bg-red-500",
        ];
        const allLangs = ISO6391.getAllNames().map((name: string, i: number) => ({
            language_id: ISO6391.getCode(name) || String(i),
            name,
            nativeName: ISO6391.getNativeName(ISO6391.getCode(name) || "") || name,
            color: colors[i % colors.length],
        }));
        setAvailableLanguages(allLangs);

        // Genres from music-genres (top-level + subgenres flattened)
        const allGenresObj = musicGenres.getAllGenres();
        const genreList: Genre[] = [];
        Object.keys(allGenresObj).forEach((parent) => {
            const displayName = parent.replace(/_/g, " ");
            genreList.push({
                genre_id: parent,
                name: displayName,
                isParent: true,
            });
            (allGenresObj[parent] as string[]).forEach((sub: string) => {
                genreList.push({
                    genre_id: `${parent}_${sub}`,
                    name: sub,
                    isParent: false,
                });
            });
        });
        setAvailableGenres(genreList);

        // Artists still from DB
        const loadArtists = async () => {
            try {
                const artistsResponse = await axios.get(
                    "/api/preferences/available/artists"
                );
                const artistsData = artistsResponse.data.artists.map(
                    (artist: any) => ({
                        artist_id: artist.artist_id,
                        name: artist.artist_name,
                        img: getImageUrl(
                            artist.profile_picture_url ||
                                getDefaultProfileImageUrl()
                        ),
                    })
                );
                setAvailableArtists(artistsData);
            } catch (error) {
                console.error("Error loading artists:", error);
                toast.error("Failed to load artists");
            }
        };

        if (user) {
            loadArtists();
        }
    }, [user]);

    const handleSelect = <K extends keyof Selections>(
        category: K,
        items: Selections[K]
    ) => {
        setSelections((prev) => ({ ...prev, [category]: items }));
    };

    const handleSearch = (
        category: keyof typeof searchQueries,
        query: string
    ) => {
        setSearchQueries((prev) => ({ ...prev, [category]: query }));
    };

    const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
    const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));
    const goToStep = (stepNumber: number) => setStep(stepNumber);

    const savePreferences = async () => {
        if (!user) return;

        try {
            setIsLoading(true);

            await axios.post("/api/preferences/save", {
                userId: user.id,
                genres: selections.genres.map((g: any) => g.name),
                languages: selections.languages.map((l: any) => l.name),
                favoriteArtists: selections.artists.map((a: any) => a.name), // Send artist names, API will convert to IDs
            });

            toast.success("Preferences saved successfully!");
            router.push("/explore");
        } catch (error) {
            console.error("Error saving preferences:", error);
            toast.error("Failed to save preferences. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const placeholders: string[] = [
        "Find Your Language...",
        "Find Your Genre...",
        "Find Your Artists...",
    ];

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
        <div className="bg-[#120B1A] text-white h-screen flex flex-col p-4 sm:p-6 font-sans overflow-hidden">
            <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
                {/* Search Bar - fixed top */}
                <div className="flex-shrink-0 py-4">
                    <SearchBar
                        placeholder={placeholders[step - 1]}
                        onSearch={(query) =>
                            handleSearch(
                                Object.keys(searchQueries)[
                                    step - 1
                                ] as keyof typeof searchQueries,
                                query
                            )
                        }
                    />
                </div>

                {/* Carousel Container - scrollable middle */}
                <div className="flex-1 min-h-0 overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-in-out h-full"
                        style={{
                            transform: `translateX(-${(step - 1) * 100}%)`,
                        }}
                    >
                        <div className="w-full flex-shrink-0 px-2 overflow-y-auto">
                            <LanguageSelection
                                selected={selections.languages}
                                onSelect={(items) =>
                                    handleSelect("languages", items)
                                }
                                items={availableLanguages}
                                searchQuery={searchQueries.languages}
                            />
                        </div>
                        <div className="w-full flex-shrink-0 px-2 overflow-y-auto">
                            <GenreSelection
                                selected={selections.genres}
                                onSelect={(items) =>
                                    handleSelect("genres", items)
                                }
                                items={availableGenres}
                                searchQuery={searchQueries.genres}
                            />
                        </div>
                        <div className="w-full flex-shrink-0 px-2 overflow-y-auto">
                            <ArtistSelection
                                selected={selections.artists}
                                onSelect={(items) =>
                                    handleSelect("artists", items)
                                }
                                items={availableArtists}
                                searchQuery={searchQueries.artists}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer: Pagination and Navigation - fixed bottom */}
                <div className="flex-shrink-0 flex items-center justify-between py-4">
                    {/* Prev Button */}
                    <div className="w-28">
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
                    <Pagination
                        total={3}
                        current={step}
                        onDotClick={goToStep}
                    />

                    {/* Next/Done Button */}
                    <div className="w-28 flex justify-end">
                        {step < 3 ? (
                            <button
                                onClick={nextStep}
                                disabled={
                                    (step === 1 &&
                                        selections.languages.length === 0) ||
                                    (step === 2 &&
                                        selections.genres.length === 0)
                                }
                                className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={savePreferences}
                                disabled={
                                    isLoading || selections.artists.length === 0
                                }
                                className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Saving..." : "Complete Setup"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreferenceSelectionPage;
