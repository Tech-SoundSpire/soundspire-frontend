"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, BookOpen, Library, Search, Flame, X } from "lucide-react";

const navItems = [
  { label: "Activity", path: "/reviews", icon: Activity },
  { label: "Lists", path: "/reviews/lists", icon: Library },
  { label: "Journal", path: "/reviews/journal", icon: BookOpen },
];

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.trim().length < 3) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/catalog/search?q=${encodeURIComponent(searchQuery.trim())}&type=track,artist,album&limit=10`);
        if (res.ok) setSearchResults(await res.json());
      } catch {}
      setSearchLoading(false);
    }, 500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults(null);
  };

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 30%, #1a0a2e 70%, #0a0612 100%)" }}>
      {/* Top Header Bar — just nav tabs centered */}
      <header className="sticky top-0 z-40 h-12 border-b border-white/10 bg-[#1a0a2e]/90 backdrop-blur-xl flex items-center justify-center px-4">
        <nav className="flex items-center gap-2 md:gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path || (item.path !== "/reviews" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.label}
                href={item.path}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={closeSearch}>
          <div className="max-w-2xl mx-auto mt-16 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[#1a1625] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                <Search className="w-5 h-5 text-white/40 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search songs, artists, albums..."
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-sm"
                />
                <button onClick={closeSearch} className="text-white/40 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {searchLoading && (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF4E27]" />
                  </div>
                )}

                {!searchLoading && searchQuery.length < 3 && (
                  <div className="py-8 text-center text-white/30 text-sm">
                    Type at least 3 characters to search
                  </div>
                )}

                {!searchLoading && searchResults && (
                  <div className="py-2">
                    {/* Tracks */}
                    {searchResults.tracks?.items?.length > 0 && (
                      <div className="px-3 py-2">
                        <div className="text-xs font-bold text-white/40 uppercase tracking-wider px-2 mb-2">Songs</div>
                        {searchResults.tracks.items.slice(0, 5).map((track: any) => (
                          <button
                            key={track.id}
                            onClick={() => { closeSearch(); router.push(`/reviews/song/${track.id}`); }}
                            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition text-left"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={track.album?.images?.[2]?.url} alt="" className="w-10 h-10 rounded object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{track.name}</p>
                              <p className="text-white/40 text-xs truncate">{track.artists?.map((a: any) => a.name).join(", ")} · {formatDuration(track.duration_ms)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Artists */}
                    {searchResults.artists?.items?.length > 0 && (
                      <div className="px-3 py-2">
                        <div className="text-xs font-bold text-white/40 uppercase tracking-wider px-2 mb-2">Artists</div>
                        {searchResults.artists.items.slice(0, 3).map((artist: any) => (
                          <button
                            key={artist.id}
                            onClick={() => { closeSearch(); router.push(`/reviews/artist/${artist.id}?name=${encodeURIComponent(artist.name)}`); }}
                            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition text-left"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={artist.images?.[2]?.url || ""} alt="" className="w-10 h-10 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{artist.name}</p>
                              <p className="text-white/40 text-xs">{artist.genres?.slice(0, 2).join(", ") || "Artist"}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Albums */}
                    {searchResults.albums?.items?.length > 0 && (
                      <div className="px-3 py-2">
                        <div className="text-xs font-bold text-white/40 uppercase tracking-wider px-2 mb-2">Albums</div>
                        {searchResults.albums.items.slice(0, 3).map((album: any) => (
                          <button
                            key={album.id}
                            onClick={() => { closeSearch(); router.push(`/reviews/album/${album.id}`); }}
                            className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-white/5 transition text-left"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={album.images?.[2]?.url} alt="" className="w-10 h-10 rounded object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{album.name}</p>
                              <p className="text-white/40 text-xs truncate">{album.artists?.map((a: any) => a.name).join(", ")} · {album.release_date?.split("-")[0]}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.tracks?.items?.length === 0 && searchResults.artists?.items?.length === 0 && searchResults.albums?.items?.length === 0 && (
                      <div className="py-8 text-center text-white/30 text-sm">No results found</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full pb-24 md:pb-8 min-h-full px-4 md:px-8">
            {/* Reviews heading + Search on same line */}
            <div className="pt-6 pb-4 flex flex-col md:flex-row md:items-center gap-4">
              <h1 className="text-[#FFD3C9] text-[32px] md:text-[47px] font-bold leading-[40px] md:leading-[56px] shrink-0 mr-4">REVIEWS</h1>
              <button
                data-search-trigger
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-3 flex-1 max-w-2xl px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-sm hover:border-white/20 transition"
              >
                <Search className="w-5 h-5" />
                Add a review...
              </button>
            </div>
            {children}
          </div>
        </main>

        {/* Right Sidebar (xl+ screens) */}
        <aside className="hidden xl:flex flex-col w-80 border-l border-white/10 bg-[#1a0a2e]/50 p-6 overflow-y-auto shrink-0">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            Trending Now
          </h3>
          <p className="text-white/40 text-sm">Trending songs will appear here once users start rating.</p>
        </aside>
      </div>
    </div>
  );
}
