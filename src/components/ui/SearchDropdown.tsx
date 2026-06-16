"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

interface SearchDropdownProps {
  apiEndpoint: string;
  placeholder?: string;
  mode?: "navigate" | "filter";
  onFilter?: (query: string) => void;
}

type NormalizedResult = {
  type: "artist" | "community" | "review" | "post" | "song" | "user";
  label: string;
  subtitle?: string;
  image?: string;
  slug?: string;
  review_id?: string;
  post_id?: string;
  spotify_track_id?: string;
  spotify_artist_id?: string; // for artists → rich /reviews/artist/{id} page
  user_id?: string;
};

export default function SearchDropdown({
  apiEndpoint,
  placeholder = "Search...",
  mode = "navigate",
  onFilter,
}: SearchDropdownProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NormalizedResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      if (mode === "filter" && onFilter) onFilter("");
      return;
    }

    // Filter mode: just pass query up, no API call
    if (mode === "filter") {
      if (onFilter) onFilter(query);
      return;
    }

    // Navigate mode: fetch internal search + Spotify catalog artists in parallel.
    const timer = setTimeout(async () => {
      try {
        const [res, catalogRes] = await Promise.all([
          fetch(`${apiEndpoint}?search=${encodeURIComponent(query)}`),
          // Catalog (Spotify) artists carry a Spotify ID → rich /reviews/artist/{id} page.
          fetch(`/api/catalog/search?q=${encodeURIComponent(query)}&type=artist&limit=5`).catch(() => null),
        ]);
        if (!res.ok) return;
        const data = await res.json();
        let combined: NormalizedResult[] = [];

        // Artists from Spotify catalog (preferred — gives the full artist page).
        if (catalogRes && catalogRes.ok) {
          try {
            const cat = await catalogRes.json();
            const items = cat?.artists?.items || [];
            combined.push(...items.slice(0, 3).map((a: any) => ({
              type: "artist" as const,
              label: a.name,
              image: a.images?.[a.images.length - 1]?.url,
              spotify_artist_id: a.id,
            })));
          } catch {}
        }
        if (data.reviews) {
          combined.push(...data.reviews.map((r: any) => ({
            type: "review" as const, label: r.title, review_id: r.review_id,
          })));
        }
        if (data.communities) {
          combined.push(...data.communities.map((c: any) => ({
            type: "community" as const, label: c.name, slug: c.artist_slug,
          })));
        }
        if (data.songs) {
          combined.push(...data.songs.map((s: any) => ({
            type: "song" as const,
            label: s.track_name,
            subtitle: s.artist_name,
            image: s.album_art_url,
            spotify_track_id: s.spotify_track_id,
          })));
        }
        if (data.users) {
          combined.push(...data.users.map((u: any) => ({
            type: "user" as const,
            label: u.full_name || u.username,
            subtitle: `@${u.username}`,
            user_id: u.user_id,
          })));
        }

        setResults(combined);
        setShowDropdown(combined.length > 0);
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, apiEndpoint, mode, onFilter]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigation = (item: NormalizedResult) => {
    if (item.type === "artist" && item.spotify_artist_id) router.push(`/reviews/artist/${item.spotify_artist_id}?name=${encodeURIComponent(item.label)}`);
    else if (item.type === "artist" && item.slug) router.push(`/community/${item.slug}`);
    else if (item.type === "community" && item.slug) router.push(`/community/${item.slug}`);
    else if (item.type === "review" && item.spotify_track_id) router.push(`/reviews/song/${item.spotify_track_id}`);
    else if (item.type === "review" && item.review_id) router.push(`/reviews/${item.review_id}`);
    else if (item.type === "song" && item.spotify_track_id) router.push(`/reviews/song/${item.spotify_track_id}`);
    else if (item.type === "user" && item.user_id) router.push(`/reviews/profile/${item.user_id}`);
    setShowDropdown(false);
    setQuery("");
  };

  return (
    <div className="relative w-full max-w-2xl" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-[#FF4E27] border border-[rgba(250,249,246,0.46)]"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(153,153,153,0.10) 100%)",
          }}
        />
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FAF9F6]" />
      </div>

      {showDropdown && results.length > 0 && mode === "navigate" && (
        <div className="absolute mt-2 w-full bg-[#1a0a2e] border border-gray-700 rounded-lg shadow-lg p-2 z-50 max-h-80 overflow-y-auto">
          {results.map((item, index) => (
            <div
              key={`${item.type}-${index}`}
              className="flex items-center gap-3 p-2 hover:bg-[#3d2b5a] rounded cursor-pointer text-white transition-colors"
              onClick={() => handleNavigation(item)}
            >
              {item.image && (
                <img src={item.image} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="truncate block text-sm">{item.label}</span>
                {item.subtitle && <span className="text-xs text-gray-400 truncate block">{item.subtitle}</span>}
              </div>
              <span className="text-xs text-gray-400 ml-2 capitalize shrink-0">{item.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
