"use client";

import { useEffect, useState } from "react";
import { Star, StarHalf, Heart, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface DiaryEntry {
  entry_id: string;
  spotify_track_id: string;
  listened_date: string;
  rating: number | null;
  liked: boolean;
  notes: string | null;
  tags: string[] | null;
}

export default function JournalPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [trackMeta, setTrackMeta] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch("/api/catalog/diary?limit=50");
        if (res.ok) {
          const data = await res.json();
          setEntries(data.entries || []);

          const trackIds = [...new Set((data.entries || []).map((e: any) => e.spotify_track_id))];
          const metaMap: Record<string, any> = {};
          for (const tid of trackIds.slice(0, 20)) {
            try {
              const tRes = await fetch(`/api/catalog/track/${tid}`);
              if (tRes.ok) metaMap[tid as string] = await tRes.json();
            } catch {}
          }
          setTrackMeta(metaMap);
        }
      } catch {}
      setLoading(false);
    })();
  }, [user]);

  const renderStars = (rating: number) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 !== 0;
    for (let i = 0; i < full; i++) {
      stars.push(<Star key={`s${i}`} className="w-3.5 h-3.5 fill-[#FF4E27] text-[#FF4E27]" />);
    }
    if (half) stars.push(<StarHalf key="half" className="w-3.5 h-3.5 fill-[#FF4E27] text-[#FF4E27]" />);
    return stars;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4E27]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Listening Journal</h1>
        <p className="text-white/50">Your personal chronological diary of everything you&apos;ve listened to.</p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
          <p className="text-white/40 mb-4">Your journal is empty.</p>
          <Link href="/reviews" className="text-[#FF4E27] hover:underline text-sm">
            Search for a song to log your first listen
          </Link>
        </div>
      ) : (
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[70px_1fr_100px_80px] md:grid-cols-[90px_1fr_140px_100px] items-center p-3 border-b border-white/10 text-xs font-bold text-white/40 uppercase tracking-wider">
            <div className="text-center">Date</div>
            <div>Song</div>
            <div>Rating</div>
            <div className="text-right">Status</div>
          </div>

          {/* Entries */}
          <div className="divide-y divide-white/5">
            {entries.map((entry) => {
              const meta = trackMeta[entry.spotify_track_id];
              const date = new Date(entry.listened_date);
              return (
                <div key={entry.entry_id} className="grid grid-cols-[70px_1fr_100px_80px] md:grid-cols-[90px_1fr_140px_100px] items-center p-3 hover:bg-white/5 transition group">
                  <div className="text-center">
                    <div className="text-sm font-medium text-white/70">{date.toLocaleDateString("en", { month: "short" })}</div>
                    <div className="text-xs text-white/40">{date.getDate()}</div>
                  </div>

                  <div className="flex items-center gap-3 min-w-0 pr-3">
                    <Link href={`/reviews/song/${entry.spotify_track_id}`} className="shrink-0">
                      {meta?.album_art_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={meta.album_art_url} alt="" className="w-10 h-10 rounded bg-white/10 object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-white/10" />
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/reviews/song/${entry.spotify_track_id}`} className="font-medium text-white text-sm hover:text-[#FF4E27] truncate block transition">
                        {meta?.track_name || "Loading..."}
                      </Link>
                      <div className="text-xs text-white/40 truncate">{meta?.artist_name || ""}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {entry.rating ? (
                      <div className="flex items-center">{renderStars(Number(entry.rating))}</div>
                    ) : (
                      <span className="text-white/20 text-xs">—</span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 text-white/40">
                    {entry.liked && <Heart className="w-3.5 h-3.5 fill-[#FF4E27] text-[#FF4E27]" />}
                    {entry.notes && <MessageSquareText className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
