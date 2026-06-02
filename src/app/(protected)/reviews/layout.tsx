"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, BookOpen, Library, Search, Flame } from "lucide-react";
import SearchOverlay from "@/components/SearchOverlay";

const navItems = [
  { label: "Activity", path: "/reviews", icon: Activity },
  { label: "Lists", path: "/reviews/lists", icon: Library },
  { label: "Journal", path: "/reviews/journal", icon: BookOpen },
];

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

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

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

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
        <TrendingSidebar />
      </div>
    </div>
  );
}

function TrendingSidebar() {
  const [trending, setTrending] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/catalog/trending");
        if (res.ok) {
          const data = await res.json();
          setTrending(data.trending || []);
        }
      } catch {}
    })();
  }, []);

  return (
    <aside className="hidden xl:flex flex-col w-80 border-l border-white/10 bg-[#1a0a2e]/50 p-6 overflow-y-auto shrink-0">
      <h3 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        Trending Now
      </h3>
      {trending.length > 0 ? (
        <div className="flex flex-col gap-3">
          {trending.map((item, idx) => (
            <button
              key={item.spotify_track_id}
              onClick={() => {
                const isAlbum = item.spotify_track_id.startsWith("album:");
                const path = isAlbum
                  ? `/reviews/album/${item.spotify_track_id.replace("album:", "")}`
                  : `/reviews/song/${item.spotify_track_id}`;
                router.push(path);
              }}
              className="flex items-center gap-3 group text-left"
            >
              <span className="text-white/30 font-bold text-sm w-4 shrink-0">{idx + 1}</span>
              {item.song?.album_art_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.song.album_art_url} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded bg-white/10 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate group-hover:text-[#FF4E27] transition">
                  {item.song?.track_name || "Unknown"}
                </p>
                <p className="text-white/40 text-xs truncate">
                  {item.song?.artist_name || ""} · {item.review_count} review{item.review_count !== 1 ? "s" : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-white/40 text-sm">Trending songs will appear here once users start reviewing.</p>
      )}
    </aside>
  );
}
