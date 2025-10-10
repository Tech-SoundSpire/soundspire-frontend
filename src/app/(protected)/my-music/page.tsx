"use client"

import { useState } from "react";
import {
  FaArrowLeft, FaDownload, FaSearch,
  FaList, FaStepBackward, FaStepForward, FaPlay, FaRandom, FaRedo, FaVolumeUp, FaPlus
} from "react-icons/fa";
import { getImageUrl, DEFAULT_PROFILE_IMAGE } from "@/utils/userProfileImageUtils";

const songs = [
  { title: "Young and beautiful", artist: "Lana del rey", duration: "4:23", highlight: true },
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
  { name: "EdSheeran"    },
  { name: "Avicii"   },
  { name: "Eminem"   },
  { name: "The Weekend"   },
  { name: "Crystal castles"    },
  { name: "Michael Jackson"  },
  { name: "Sabrina Carpenter"    },
];

const albums = [
  { title: "Ultraviolence", artist: "Lana del rey" },
  { title: "Encore", artist: "Eminem"  },
  { title: "Stories", artist: "Avicii"  },
  { title: "Mini world", artist: "Indila" },
  { title: "Trilogy", artist: "The Weeknd"},
  { title: "3D", artist: "Jung Kook"},
  { title: "Blue bannister", artist: "Lana del rey"},
  { title: "Happier than ever", artist: "Billie eilish"},
];

const tabs = ["All Songs", "Albums", "Artists", "Playlists", "Downloads"];

export default function MyMusicPage() {
  const [activeTab, setActiveTab] = useState("All Songs");

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Main Content */}
      <main className="pl-4 sm:pl-6 lg:pl-10 flex-1 flex flex-col bg-slate-950 max-w-[calc(100vw-10rem)] mx-auto w-full">
        {/* Top Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-8 lg:px-12 py-4 sm:py-6 bg-slate-950">
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="text-2xl">
              <FaArrowLeft />
            </button>
            <span className="text-2xl sm:text-3xl font-semibold tracking-wide">MY MUSIC</span>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search..."
              className="w-full sm:w-64 md:w-80 lg:w-96 px-4 py-2 pl-10 rounded-full bg-[#2d2838] text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Now Playing Section */}
        <section
          className="px-4 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-20 flex flex-col gap-2 relative"
          style={{
            background: `url(${getImageUrl(DEFAULT_PROFILE_IMAGE)}) center center / cover no-repeat, #1a1625`
          }}
        >
          <span className="text-lg text-gray-300">Now Playing</span>
          <div className="flex items-center gap-2">
            <img
              src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
              alt="Lana del rey"
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wider">LANA DEL REY</span>
          </div>
        </section>

        {/* Tabs */}
        <div className="px-4 sm:px-8 lg:px-12 pt-4 sm:pt-6">
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {tabs.map(tab => (
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
        <div className="px-4 sm:px-8 lg:px-10 py-4 sm:py-6 flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 lg:h-[calc(100vh-260px)] overflow-hidden">
          {/* Content Area */}
          <div className="flex-1 w-full lg:max-w-[calc(100%-400px)] flex flex-col min-h-0 overflow-y-auto">
            {activeTab === "Artists" && (
              <div className="bg-slate-950 rounded-xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {artists.map(artist => (
                  <div key={artist.name} className="flex flex-col items-center bg-[#231942] rounded-md p-4 hover:bg-[#3a2767] transition">
                    <img
                      src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
                      alt={artist.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover mb-3"
                    />
                    <span className="text-base font-semibold">{artist.name}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Albums" && (
              <div className="bg-[#1a1625] rounded-xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {albums.map(album => (
                  <div key={album.title} className="flex flex-col items-center bg-transparent rounded-md p-4 hover:bg-[#3a2767] transition">
                    <img
                      src={getImageUrl(DEFAULT_PROFILE_IMAGE)}
                      alt={album.title}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-md object-cover mb-3 shadow-lg"
                    />
                    <span className="text-base font-semibold leading-tight">{album.title}</span>
                    <span className="text-xs text-gray-400">{album.artist}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "Playlists" && (
              <div className="bg-[#1a1625] rounded-xl p-6 flex items-center justify-center">
                <button className="flex flex-col items-center text-gray-300 hover:text-white">
                  <FaPlus className="text-3xl mb-2" />
                  <span>Add a new playlist</span>
                </button>
              </div>
            )}

            {(activeTab === "All Songs" || activeTab === "Downloads") && (
              <div className="w-full bg-[#1a1625] rounded-xl p-4 sm:p-6 overflow-x-auto max-h-[400px] overflow-y-auto music-table-scrollbar">
                <table className="w-full text-left min-w-[520px]">
                  <thead>
                    <tr className="text-gray-400 text-sm border-b border-gray-700/30">
                      <th className="font-normal hidden sm:table-cell pb-3 text-center w-12">#</th>
                      <th className="font-normal pb-3 pl-2">Title</th>
                      <th className="font-normal hidden md:table-cell pb-3 text-center w-8"></th>
                      <th className="font-normal pb-3">Artist</th>
                      <th className="font-normal hidden sm:table-cell pb-3 text-right w-16">Time</th>
                      <th className="font-normal hidden xs:table-cell pb-3 text-center w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {songs.map((song, idx) => (
                      <tr
                        key={song.title}
                        className={`group cursor-pointer border-b border-gray-800/20 last:border-b-0 ${song.highlight ? "text-[#ff4e50] font-semibold" : "text-white"} hover:bg-[#3a2767]/80 hover:text-[#ff4e50] transition-all duration-300 ease-out hover:shadow-md hover:scale-[1.01]`}>
                        <td className="py-3 hidden sm:table-cell text-center text-gray-400 group-hover:text-[#ff4e50] transition-colors duration-300 ease-out relative w-12">
                          <span className="group-hover:hidden inline-block w-full text-center">{idx + 1}.</span>
                          <button className="hidden group-hover:inline-block text-[#ff4e50] hover:text-white transition-all duration-200 w-full text-center">
                            <FaPlay className="text-sm mx-auto" />
                          </button>
                        </td>
                        <td className="py-3 pl-2 font-medium transition-colors duration-300 ease-out">{song.title}</td>
                        <td className="py-3 hidden md:table-cell text-center">
                          {song.highlight && (
                            <span className="text-[#ff4e50] text-lg">📈</span>
                          )}
                        </td>
                        <td className="py-3 text-gray-300 group-hover:text-[#ff4e50] transition-colors duration-300 ease-out">{song.artist}</td>
                        <td className="py-3 hidden sm:table-cell text-right text-gray-400 group-hover:text-[#ff4e50] transition-colors duration-300 ease-out">{song.duration}</td>
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
      </main>
    </div>
  );
}

/* Player Panel */
function PlayerPanel() {
  return (
    <div className="w-full lg:w-[400px] bg-[#1a1625] rounded-xl p-4 sm:p-6 flex flex-col items-center justify-between">
      <div className="w-full flex justify-end mb-4 gap-4 text-lg sm:text-xl text-gray-400">
        <FaList className="cursor-pointer" />
        <FaRandom className="cursor-pointer" />
        <FaRedo className="cursor-pointer" />
        <FaVolumeUp className="cursor-pointer" />
      </div>
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 sm:w-40 sm:h-40 bg-black rounded-md mb-4 flex items-center justify-center">
          <img src={getImageUrl(DEFAULT_PROFILE_IMAGE)} alt="Now Playing" className="w-full h-full object-cover rounded-md" />
        </div>
        <div className="flex items-center gap-6 mb-4">
          <FaStepBackward className="text-xl sm:text-2xl cursor-pointer" />
          <button className="bg-[#ff4e50] p-2 sm:p-3 rounded-full text-white text-xl sm:text-2xl shadow-lg">
            <FaPlay />
          </button>
          <FaStepForward className="text-xl sm:text-2xl cursor-pointer" />
        </div>
        <div className="w-full h-1 bg-[#3a2767] rounded-full mb-2">
          <div className="w-1/3 h-full bg-[#ff4e50] rounded-full"></div>
        </div>
        <div className="text-center">
          <div className="font-semibold">Young and beautiful</div>
          <div className="text-gray-400 text-sm">Lana del rey</div>
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