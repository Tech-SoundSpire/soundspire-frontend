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
  type: "artist" | "community" | "review" | "post";
  label: string;
  slug?: string;
  review_id?: string;
  post_id?: string;
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

    // Navigate mode: fetch from API
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${apiEndpoint}?search=${encodeURIComponent(query)}`);
        if (!res.ok) return;
        const data = await res.json();
        let combined: NormalizedResult[] = [];

        if (data.artists) {
          combined.push(...data.artists.map((a: any) => ({
            type: "artist" as const, label: a.artist_name, slug: a.slug,
          })));
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
    if (item.type === "artist" && item.slug) router.push(`/community/${item.slug}`);
    else if (item.type === "community" && item.slug) router.push(`/community/${item.slug}`);
    else if (item.type === "review" && item.review_id) router.push(`/reviews/${item.review_id}`);
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
              className="flex justify-between items-center p-2 hover:bg-[#3d2b5a] rounded cursor-pointer text-white transition-colors"
              onClick={() => handleNavigation(item)}
            >
              <span className="truncate">{item.label}</span>
              <span className="text-xs text-gray-400 ml-2 capitalize">{item.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
