"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";

interface SearchDropdownProps {
  apiEndpoint: string;
  placeholder?: string;
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
}: SearchDropdownProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NormalizedResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ========================
     Debounced Search
  ========================= */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const res = await fetch(
          `${apiEndpoint}?search=${encodeURIComponent(query)}`
        );

        if (!res.ok) {
          console.error("Search failed:", res.status);
          return;
        }

        const data = await res.json();
        let combined: NormalizedResult[] = [];

        // ===== ARTISTS =====
        if (data.artists) {
          combined.push(
            ...data.artists.map((a: any) => ({
              type: "artist",
              label: a.artist_name,
              slug: a.slug,
            }))
          );
        }

        // ===== REVIEWS =====
        if (data.reviews) {
          combined.push(
            ...data.reviews.map((r: any) => ({
              type: "review",
              label: r.title,
              review_id: r.review_id,
            }))
          );
        }

        // ===== COMMUNITIES =====
        if (data.communities) {
          combined.push(
            ...data.communities.map((c: any) => ({
              type: "community",
              label: c.name,
              slug: c.artist_slug, // ✅ IMPORTANT
            }))
          );
        }

        // ===== FEED POSTS (array response) =====
        if (Array.isArray(data)) {
          combined = data.map((p: any) => ({
            type: "post",
            label: p.content_text?.slice(0, 50) || "Post",
            post_id: p.post_id,
          }));
        }

        setResults(combined);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query, apiEndpoint]);

  /* ========================
     Close on Outside Click
  ========================= */
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ========================
     Navigation Handler
  ========================= */
  const handleNavigation = (item: NormalizedResult) => {
    if (item.type === "artist" && item.slug) {
      router.push(`/community/${item.slug}`);
    }

    else if (item.type === "community" && item.slug) {
      router.push(`/community/${item.slug}`); // ✅ FIXED ROUTE
    }

    else if (item.type === "review" && item.review_id) {
      router.push(`/reviews/${item.review_id}`);
    }

    else if (item.type === "post" && item.post_id) {
      router.push(`/posts/${item.post_id}`);
    }

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
          className="w-full px-4 py-2 pl-10 rounded-full bg-[#2d2838] text-white focus:outline-none focus:ring-0"
        />
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute mt-2 w-full bg-[#2d2838] rounded-lg shadow-lg p-2 z-50 max-h-80 overflow-y-auto">
          {results.map((item, index) => (
            <div
              key={`${item.type}-${index}`}
              className="flex justify-between items-center p-2 hover:bg-purple-600 rounded cursor-pointer text-white transition-colors"
              onClick={() => handleNavigation(item)}
            >
              <span className="truncate">{item.label}</span>

              <span className="text-xs text-gray-400 ml-2 capitalize">
                {item.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
