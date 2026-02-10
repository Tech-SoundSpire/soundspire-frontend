"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import { FiArrowUpRight } from "react-icons/fi";
import { createPortal } from "react-dom";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import BaseText from "@/components/BaseText/BaseText";

export default function FindArtistPage() {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [backgroundTiles, setBackgroundTiles] = useState<JSX.Element[]>([]);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);

        const savedSearch = sessionStorage.getItem("artistSearchQuery");
        const savedResults = sessionStorage.getItem("artistSearchResults");

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
            sessionStorage.removeItem("artistSearchQuery");
            sessionStorage.removeItem("artistSearchResults");
            return;
        }

        sessionStorage.setItem("artistSearchQuery", searchQuery);

        const delayDebounce = setTimeout(async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(
                    `/api/artists?q=${encodeURIComponent(searchQuery)}`
                );
                if (!res.ok) {
                    throw new Error("Failed to fetch");
                }
                const data = await res.json();
                const items = data?.items || [];
                setResults(items);

                sessionStorage.setItem(
                    "artistSearchResults",
                    JSON.stringify(items)
                );
            } catch (err) {
                console.error(err);
                setError("Failed to load artists. Please try again.");
            } finally {
                setLoading(false);
            }
        }, 800);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery, mounted]);

    const handleArtistClick = (artist: any) => {
        router.push(`/artist-details?artistId=${artist.uuid}`);
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#1a1625] text-white relative overflow-hidden">
            {document.getElementById("header-actions") &&
                createPortal(
                    <button
                        onClick={handleBack}
                        className="w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                        <FaArrowLeft className="text-black text-xl" />
                    </button>,
                    document.getElementById("header-actions") as HTMLElement
                )}

            {/* Search */}
            <div className="text-center mb-8 px-4">
                <BaseHeading
                    headingLevel="h1"
                    fontSize="sub heading"
                    fontWeight={700}
                    textColor="#FFD0C2"
                    className="mb-6"
                >
                    Find Your Artist Profile
                </BaseHeading>

                <div className="max-w-2xl mx-auto relative">
                    <input
                        type="text"
                        placeholder="Search artist..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-[#2d2838] to-[#3a3448] text-white rounded-full border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FA6400] placeholder-gray-400 text-lg"
                    />
                    <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />

                    {/* Floating Dialog for Results */}
                    {!loading && results.length > 0 && (
                        <div className="absolute left-0 right-0 mt-3 z-50 mx-auto max-w-2xl bg-[#2d2838]/95 backdrop-blur-md rounded-xl shadow-lg overflow-hidden">
                            <div className="max-h-80 overflow-y-auto artist-scrollbar">
                                {(() => {
                                    // Group results by genre
                                    const grouped: Record<string, any[]> = {};
                                    results.forEach((artist) => {
                                        const genre =
                                            artist.genres?.[0]?.root || artist.genres?.[0]?.name || (typeof artist.genres?.[0] === "string" ? artist.genres[0] : null) || "Other";
                                        if (!grouped[genre]) grouped[genre] = [];
                                        grouped[genre].push(artist);
                                    });
                                    return Object.entries(grouped).map(
                                        ([genre, artists]) => (
                                            <div key={genre}>
                                                <div className="px-4 py-2 bg-[#1a1625]/80 sticky top-0 z-10">
                                                    <span className="text-xs font-semibold text-orange-400 uppercase tracking-wider">
                                                        {genre}
                                                    </span>
                                                </div>
                                                <ul>
                                                    {artists.map(
                                                        (artist: any, i: number) => (
                                                            <li
                                                                key={i}
                                                                onClick={() =>
                                                                    handleArtistClick(
                                                                        artist
                                                                    )
                                                                }
                                                                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-[#3a3248] transition-colors duration-200"
                                                            >
                                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                                                                    {artist.imageUrl ? (
                                                                        <img
                                                                            src={artist.imageUrl}
                                                                            alt={artist.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-bold">
                                                                            {artist.name?.charAt(0)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <BaseText
                                                                        fontWeight={700}
                                                                        fontSize="small"
                                                                    >
                                                                        {artist.name}
                                                                    </BaseText>
                                                                    {artist.countryCode && (
                                                                        <BaseText
                                                                            fontSize="small"
                                                                            textColor="#9ca3af"
                                                                        >
                                                                            {artist.countryCode}
                                                                        </BaseText>
                                                                    )}
                                                                </div>
                                                                <FiArrowUpRight className="text-white text-xl flex-shrink-0" />
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )
                                    );
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Loading and Error States */}
                    {loading && (
                        <div className="absolute left-0 right-0 mt-3 z-50 mx-auto max-w-2xl bg-[#2d2838]/95 text-center text-gray-300 py-4 rounded-xl border border-gray-700 shadow-lg">
                            Loading artists...
                        </div>
                    )}
                    {error && (
                        <div className="absolute left-0 right-0 mt-3 z-50 mx-auto max-w-2xl bg-[#2d2838]/95 text-center text-red-400 py-4 rounded-xl border border-gray-700 shadow-lg">
                            {error}
                        </div>
                    )}
                    {!loading && searchQuery && results.length === 0 && (
                        <div className="absolute left-0 right-0 mt-3 z-50 mx-auto max-w-2xl bg-[#2d2838]/95 text-center text-gray-400 py-4 rounded-xl border border-gray-700 shadow-lg">
                            No artists found.
                        </div>
                    )}
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
