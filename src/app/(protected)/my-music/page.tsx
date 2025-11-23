"use client";

import { useState } from "react";
import {
    FaArrowLeft,
    FaDownload,
    FaSearch,
    FaList,
    FaStepBackward,
    FaStepForward,
    FaPlay,
    FaRandom,
    FaRedo,
    FaVolumeUp,
    FaPlus,
} from "react-icons/fa";
import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import BaseText from "@/components/BaseText/BaseText";

const songs = [
    {
        title: "Young and beautiful",
        artist: "Lana del rey",
        duration: "4:23",
        highlight: true,
    },
    { title: "Perfect", artist: "EdSheeran", duration: "4:23" },
    { title: "I Wanna be yours", artist: "Artic monkeys", duration: "4:23" },
    { title: "Empathy", artist: "Crystal castles", duration: "4:23" },
    { title: "Hello", artist: "Adele", duration: "4:23" },
    { title: "Sing for the moment", artist: "Eminem", duration: "4:23" },
    { title: "I was Never There", artist: "The Weeknd", duration: "4:23" },
    { title: "All the Stars", artist: "Kendrick Lamar", duration: "4:23" },
    { title: "Let her go", artist: "Passengers", duration: "4:23" },
];
// getImageUrl(DEFAULT_PROFILE_IMAGE)

const artists = [
    { name: "Lana del ray" },
    { name: "EdSheeran" },
    { name: "Avicii" },
    { name: "Eminem" },
    { name: "The Weekend" },
    { name: "Crystal castles" },
    { name: "Michael Jackson" },
    { name: "Sabrina Carpenter" },
];

const albums = [
    { title: "Ultraviolence", artist: "Lana del rey" },
    { title: "Encore", artist: "Eminem" },
    { title: "Stories", artist: "Avicii" },
    { title: "Mini world", artist: "Indila" },
    { title: "Trilogy", artist: "The Weeknd" },
    { title: "3D", artist: "Jung Kook" },
    { title: "Blue bannister", artist: "Lana del rey" },
    { title: "Happier than ever", artist: "Billie eilish" },
];

const tabs = ["All Songs", "Albums", "Artists", "Playlists", "Downloads"];

export default function MyMusicPage() {
    const [activeTab, setActiveTab] = useState("All Songs");

    return (
        <div className="flex min-h-screen bg-slate-950 text-white">
            {/* Main Content - Account for fixed navbar */}
            <main className="flex-1 flex flex-col bg-slate-950 w-full ml-16">
                {/* Container wrapper for consistent alignment */}
                <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
                    {/* Top Bar */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-3 sm:py-4 lg:py-6 bg-slate-950">
                        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                            <button className="text-xl sm:text-2xl">
                                <FaArrowLeft />
                            </button>
                            <BaseText
                                wrapper="span"
                                fontSize="normal"
                                fontWeight={600}
                                className="tracking-wide"
                            >
                                MY MUSIC
                            </BaseText>
                        </div>
                        <div className="relative w-full sm:w-auto">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full sm:w-56 md:w-72 lg:w-80 xl:w-96 px-3 sm:px-4 py-2 pl-9 sm:pl-10 rounded-full bg-[#2d2838] text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                            />
                            <FaSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                        </div>
                    </div>

                    {/* Now Playing Section */}
                    <section
                        className="py-6 sm:py-8 lg:py-12 xl:py-16 flex flex-col gap-2 relative px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20"
                        style={{
                            background: `url(${getImageUrl(
                                DEFAULT_PROFILE_IMAGE
                            )}) center center / cover no-repeat, #1a1625`,
                        }}
                    >
                        <BaseText
                            wrapper="span"
                            fontSize="normal"
                            textColor="#d1d5db"
                        >
                            Now Playing
                        </BaseText>
                        <div className="flex items-center gap-2">
                            <img
                                src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
                                alt="Lana del rey"
                                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                            />
                            <BaseText
                                wrapper="span"
                                fontSize="large"
                                fontWeight={700}
                                className="tracking-wider"
                            >
                                LANA DEL REY
                            </BaseText>
                        </div>
                    </section>

                    {/* Tabs */}
                    <div className="pt-4 sm:pt-6">
                        <div className="flex gap-2 sm:gap-3 flex-wrap">
                            {tabs.map((tab) => (
                                <TabButton
                                    key={tab}
                                    active={activeTab === tab}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </TabButton>
                            ))}
                        </div>
                    </div>

                    {/* Content + Player Panel */}
                    <div className="py-4 sm:py-6 flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 h-[calc(100vh-200px)] sm:h-[calc(100vh-240px)] overflow-hidden">
                        {/* Content Area */}
                        <div className="flex-1 w-full lg:max-w-[calc(100%-320px)] xl:max-w-[calc(100%-360px)] 2xl:max-w-[calc(100%-400px)] flex flex-col min-h-0 overflow-y-auto h-full">
                            {activeTab === "Artists" && (
                                <div className="bg-slate-950 rounded-xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                                    {artists.map((artist) => (
                                        <div
                                            key={artist.name}
                                            className="flex flex-col items-center bg-[#231942] rounded-md p-4 hover:bg-[#3a2767] transition"
                                        >
                                            <img
                                                src={getImageUrl(
                                                    DEFAULT_PROFILE_IMAGE
                                                )}
                                                alt={artist.name}
                                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mb-3"
                                            />
                                            <BaseText
                                                wrapper="span"
                                                fontSize="small"
                                                fontWeight={600}
                                            >
                                                {artist.name}
                                            </BaseText>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "Albums" && (
                                <div className="bg-[#1a1625] rounded-xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 overflow-y-auto music-table-scrollbar flex-1">
                                    {albums.map((album) => (
                                        <div
                                            key={album.title}
                                            className="flex flex-col items-center bg-transparent rounded-md p-4 hover:bg-[#3a2767] transition"
                                        >
                                            <img
                                                src={getImageUrl(
                                                    DEFAULT_PROFILE_IMAGE
                                                )}
                                                alt={album.title}
                                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-md object-cover mb-3 shadow-lg"
                                            />
                                            <BaseText
                                                wrapper="span"
                                                fontSize="small"
                                                fontWeight={600}
                                                className="leading-tight"
                                            >
                                                {album.title}
                                            </BaseText>
                                            <BaseText
                                                wrapper="span"
                                                fontSize="very small"
                                                textColor="#9ca3af"
                                            >
                                                {album.artist}
                                            </BaseText>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "Playlists" && (
                                <div className="bg-[#1a1625] rounded-xl p-6 flex items-center justify-center">
                                    <button className="flex flex-col items-center text-gray-300 hover:text-white">
                                        <FaPlus className="text-3xl mb-2" />
                                        <BaseText wrapper="span">
                                            Add a new playlist
                                        </BaseText>
                                    </button>
                                </div>
                            )}

                            {(activeTab === "All Songs" ||
                                activeTab === "Downloads") && (
                                <div className="w-full bg-[#1a1625] rounded-xl p-2 sm:p-4 lg:p-6 overflow-x-auto flex-1 overflow-y-auto music-table-scrollbar shadow-lg border border-gray-800/20">
                                    <table className="w-full text-left min-w-[480px] sm:min-w-[520px]">
                                        <thead>
                                            <tr className="text-gray-400 text-sm border-b border-gray-700/30">
                                                <th className="font-normal hidden sm:table-cell pb-3 text-center w-10">
                                                    #
                                                </th>
                                                <th className="font-normal pb-3 pl-2 min-w-[200px]">
                                                    Title
                                                </th>
                                                <th className="font-normal hidden md:table-cell pb-3 text-center w-8"></th>
                                                <th className="font-normal pb-3 min-w-[150px]">
                                                    Artist
                                                </th>
                                                <th className="font-normal hidden sm:table-cell pb-3 text-right w-16 pr-2">
                                                    Time
                                                </th>
                                                <th className="font-normal hidden xs:table-cell pb-3 text-center w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {songs.map((song, idx) => (
                                                <tr
                                                    key={song.title}
                                                    className={`group cursor-pointer border-b border-gray-800/20 last:border-b-0 ${
                                                        song.highlight
                                                            ? "text-[#ff4e50] font-semibold"
                                                            : "text-white"
                                                    } hover:bg-[#3a2767]/40 hover:text-[#ff4e50] transition-all duration-300 ease-out hover:shadow-md hover:scale-[1.01] rounded-lg`}
                                                >
                                                    <td
                                                        className={`py-3 hidden sm:table-cell text-center transition-colors duration-300 ease-out relative w-10 ${
                                                            song.highlight
                                                                ? "text-[#ff4e50]"
                                                                : "text-gray-400"
                                                        } group-hover:text-[#ff4e50]`}
                                                    >
                                                        <span className="group-hover:hidden inline-block w-full text-center">
                                                            {idx + 1}.
                                                        </span>
                                                        <button className="hidden group-hover:inline-block text-[#ff4e50] hover:text-white transition-all duration-200 w-full text-center">
                                                            <FaPlay className="text-sm mx-auto" />
                                                        </button>
                                                    </td>
                                                    <td className="py-3 pl-2 font-medium transition-colors duration-300 ease-out truncate">
                                                        {song.title}
                                                    </td>
                                                    <td className="py-3 hidden md:table-cell text-center">
                                                        {song.highlight && (
                                                            <span className="text-[#ff4e50] text-lg">
                                                                📈
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td
                                                        className={`py-3 transition-colors duration-300 ease-out truncate ${
                                                            song.highlight
                                                                ? "text-[#ff4e50]"
                                                                : "text-gray-300"
                                                        } group-hover:text-[#ff4e50]`}
                                                    >
                                                        {song.artist}
                                                    </td>
                                                    <td
                                                        className={`py-3 hidden sm:table-cell text-right transition-colors duration-300 ease-out pr-2 ${
                                                            song.highlight
                                                                ? "text-[#ff4e50]"
                                                                : "text-gray-400"
                                                        } group-hover:text-[#ff4e50]`}
                                                    >
                                                        {song.duration}
                                                    </td>
                                                    <td className="py-3 hidden xs:table-cell text-center">
                                                        <button className="text-[#ff4e50] hover:text-white hover:scale-110 transition-all duration-200 p-1 rounded">
                                                            <FaDownload />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Player Panel */}
                        <PlayerPanel />
                    </div>
                </div>
            </main>
        </div>
    );
}

/* Player Panel */
function PlayerPanel() {
    return (
        <div className="w-full lg:w-[300px] xl:w-[340px] 2xl:w-[380px] bg-[#1a1625] rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col items-center justify-between h-full flex-shrink-0">
            {/* Top Controls */}
            <div className="w-full flex justify-end mb-3 sm:mb-4 gap-2 sm:gap-3 md:gap-4 text-sm sm:text-base md:text-lg lg:text-xl text-gray-400">
                <FaList className="cursor-pointer hover:text-white transition-colors" />
                <FaRandom className="cursor-pointer hover:text-white transition-colors" />
                <FaRedo className="cursor-pointer hover:text-white transition-colors" />
                <FaVolumeUp className="cursor-pointer hover:text-white transition-colors" />
            </div>

            {/* Main Content */}
            <div className="flex flex-col items-center flex-1 justify-center">
                {/* Album Art */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 bg-black rounded-md mb-3 sm:mb-4 md:mb-5 lg:mb-6 flex items-center justify-center shadow-lg">
                    <img
                        src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
                        alt="Now Playing"
                        className="w-full h-full object-cover rounded-md"
                    />
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-4 sm:gap-5 md:gap-6 mb-3 sm:mb-4 md:mb-5">
                    <FaStepBackward className="text-lg sm:text-xl md:text-2xl cursor-pointer hover:text-white transition-colors" />
                    <button className="bg-[#ff4e50] p-2 sm:p-2.5 md:p-3 lg:p-3.5 rounded-full text-white text-lg sm:text-xl md:text-2xl shadow-lg hover:bg-[#ff3a3c] transition-colors">
                        <FaPlay />
                    </button>
                    <FaStepForward className="text-lg sm:text-xl md:text-2xl cursor-pointer hover:text-white transition-colors" />
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px] h-1 sm:h-1.5 bg-[#3a2767] rounded-full mb-2 sm:mb-3">
                    <div className="w-1/3 h-full bg-[#ff4e50] rounded-full"></div>
                </div>

                {/* Song Info */}
                <div className="text-left px-2 w-full">
                    <div className="font-semibold text-sm sm:text-base md:text-lg lg:text-xl truncate">
                        Young and beautiful
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm md:text-base truncate">
                        Lana del rey
                    </div>
                </div>
            </div>
        </div>
    );
}

/* Reusable Tab Button */
function TabButton({
    children,
    active = false,
    onClick,
}: {
    children: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            className={`px-4 py-1 rounded-md text-sm font-semibold ${
                active
                    ? "bg-[#ff4e50] text-white"
                    : "bg-[#231942] text-gray-300 hover:bg-[#3a2767] hover:text-white"
            }`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}
