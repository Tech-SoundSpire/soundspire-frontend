"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export interface SearchTrack {
  id: string;
  name: string;
  duration_ms: number;
  album?: { id: string; name: string; images?: { url: string }[] };
  artists?: { id: string; name: string }[];
}

export interface SearchAlbum {
  id: string;
  name: string;
  release_date?: string;
  images?: { url: string }[];
  artists?: { id: string; name: string }[];
}

export interface SearchArtist {
  id: string;
  name: string;
  genres?: string[];
  images?: { url: string }[];
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  placeholder?: string;
  showAlbums?: boolean;
  showArtists?: boolean;
  onSelectTrack?: (track: SearchTrack) => void | Promise<void>;
  onSelectAlbum?: (album: SearchAlbum) => void | Promise<void>;
  onSelectArtist?: (artist: SearchArtist) => void | Promise<void>;
}

export default function SearchOverlay({
  open,
  onClose,
  placeholder = "Search songs, artists, albums...",
  showAlbums = true,
  showArtists = true,
  onSelectTrack,
  onSelectAlbum,
  onSelectArtist,
}: SearchOverlayProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
    if (!open) {
      setSearchQuery("");
      setSearchResults(null);
    }
  }, [open]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (searchQuery.trim().length < 3) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const types = ["track", showArtists ? "artist" : null, showAlbums ? "album" : null].filter(Boolean).join(",");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/catalog/search?q=${encodeURIComponent(searchQuery.trim())}&type=${types}&limit=10`);
        if (res.ok) setSearchResults(await res.json());
      } catch {}
      setSearchLoading(false);
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, showAlbums, showArtists]);

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const handleTrackClick = async (track: SearchTrack) => {
    if (onSelectTrack) {
      await onSelectTrack(track);
    } else {
      onClose();
      router.push(`/reviews/song/${track.id}`);
    }
  };

  const handleAlbumClick = async (album: SearchAlbum) => {
    if (onSelectAlbum) {
      await onSelectAlbum(album);
    } else {
      onClose();
      router.push(`/reviews/album/${album.id}`);
    }
  };

  const handleArtistClick = async (artist: SearchArtist) => {
    if (onSelectArtist) {
      await onSelectArtist(artist);
    } else {
      onClose();
      router.push(`/reviews/artist/${artist.id}?name=${encodeURIComponent(artist.name)}`);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="max-w-2xl mx-auto mt-16 mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#1a1625] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
            <Search className="w-5 h-5 text-white/40 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-sm"
            />
            <button onClick={onClose} className="text-white/40 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

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
                {searchResults.tracks?.items?.length > 0 && (
                  <div className="px-3 py-2">
                    <div className="text-xs font-bold text-white/40 uppercase tracking-wider px-2 mb-2">Songs</div>
                    {searchResults.tracks.items.slice(0, 5).map((track: any) => (
                      <button
                        key={track.id}
                        onClick={() => handleTrackClick(track)}
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

                {showArtists && searchResults.artists?.items?.length > 0 && (
                  <div className="px-3 py-2">
                    <div className="text-xs font-bold text-white/40 uppercase tracking-wider px-2 mb-2">Artists</div>
                    {searchResults.artists.items.slice(0, 3).map((artist: any) => (
                      <button
                        key={artist.id}
                        onClick={() => handleArtistClick(artist)}
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

                {showAlbums && searchResults.albums?.items?.length > 0 && (
                  <div className="px-3 py-2">
                    <div className="text-xs font-bold text-white/40 uppercase tracking-wider px-2 mb-2">Albums</div>
                    {searchResults.albums.items.slice(0, 3).map((album: any) => (
                      <button
                        key={album.id}
                        onClick={() => handleAlbumClick(album)}
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

                {searchResults.tracks?.items?.length === 0 &&
                  (!showArtists || searchResults.artists?.items?.length === 0) &&
                  (!showAlbums || searchResults.albums?.items?.length === 0) && (
                    <div className="py-8 text-center text-white/30 text-sm">No results found</div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
