"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Star, Heart, PenSquare, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface AlbumData {
  id: string;
  name: string;
  album_type: string;
  total_tracks: number;
  release_date: string;
  images: { url: string }[];
  artists: { id: string; name: string }[];
  spotify_url: string;
  tracks: { id: string; name: string; track_number: number; duration_ms: number; explicit: boolean; artists: { id: string; name: string }[] }[];
}

export default function AlbumPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const nameHint = searchParams.get("name") || "";
  const { user } = useAuth();
  const [album, setAlbum] = useState<AlbumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [userRating, setUserRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/catalog/album/${id}`);
        if (res.ok) {
          const data = await res.json();
          setAlbum(data);
          // Cache album metadata for feed display
          fetch("/api/catalog/cache-album", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              spotify_track_id: `album:${id}`,
              track_name: data.name,
              artist_name: data.artists?.map((a: any) => a.name).join(", ") || "",
              artist_id: data.artists?.[0]?.id || "",
              album_art_url: data.images?.[0]?.url || null,
            }),
          }).catch(() => {});
        }
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  const handleSubmitReview = async () => {
    if (!user || reviewText.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/catalog/song-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotify_track_id: `album:${id}`,
          rating: userRating || null,
          review_text: reviewText.trim(),
        }),
      });
      if (res.ok) {
        toast.success("Album review submitted!");
        setShowReviewModal(false);
        setReviewText("");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit review");
      }
    } catch { toast.error("Failed to submit review"); }
    setSubmitting(false);
  };

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF4E27]" />
      </div>
    );
  }

  if (!album) {
    return <div className="p-8 text-center text-white/40">Album not found</div>;
  }

  return (
    <div className="p-4 md:p-8">
      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10">
        <div className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={album.images?.[0]?.url || ""}
            alt={album.name}
            className="w-44 h-44 md:w-56 md:h-56 rounded-xl shadow-2xl object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <div className="mb-1 text-xs font-bold tracking-widest text-white/40 uppercase">{album.album_type}</div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">{album.name}</h1>
          <p className="text-lg text-white/60 mb-4">
            {album.artists?.map((a, i) => (
              <span key={a.id}>
                {i > 0 && ", "}
                <Link href={`/reviews/artist/${a.id}?name=${encodeURIComponent(a.name)}`} className="font-semibold text-white hover:text-[#FF4E27] transition">
                  {a.name}
                </Link>
              </span>
            ))}
            {album.release_date && <span> · {album.release_date.split("-")[0]}</span>}
            <span> · {album.total_tracks} tracks</span>
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setShowReviewModal(true)} className="px-5 py-2 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
              <PenSquare className="w-4 h-4" />
              Review Album
            </button>
            {album.spotify_url && (
              <a href={album.spotify_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-[#1DB954]/20 text-[#1DB954] text-sm font-medium hover:bg-[#1DB954]/30 transition">
                Open on Spotify
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tracklist */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-4">Tracklist</h2>
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            {album.tracks.map((track) => (
              <Link
                key={track.id}
                href={`/reviews/song/${track.id}`}
                className="flex items-center gap-3 p-3 hover:bg-white/5 transition group"
              >
                <span className="text-white/30 text-sm w-6 text-right shrink-0">{track.track_number}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-[#FF4E27] transition">{track.name}</p>
                  {track.artists && track.artists.length > 1 && (
                    <p className="text-white/40 text-xs truncate">{track.artists.map(a => a.name).join(", ")}</p>
                  )}
                </div>
                {track.explicit && <span className="px-1.5 py-0.5 text-[9px] bg-white/10 text-white/50 rounded">E</span>}
                <span className="text-white/30 text-xs shrink-0">{formatDuration(track.duration_ms)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReviewModal(false)}>
          <div className="bg-[#1a1625] border border-white/10 rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Review Album</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-white/50 text-sm mb-3">{album.name} — {album.artists?.map(a => a.name).join(", ")}</p>

            <div className="mb-4">
              <span className="text-sm text-white/50 block mb-2">Your rating:</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setUserRating(star === userRating ? null : star)}>
                    <Star className={`w-6 h-6 ${(userRating || 0) >= star ? "fill-[#FF4E27] text-[#FF4E27]" : "text-white/20 hover:text-white/40"}`} />
                  </button>
                ))}
                {userRating && <span className="text-sm text-white/40 ml-2">{userRating}/5</span>}
              </div>
            </div>

            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your album review (minimum 10 characters)..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm placeholder:text-white/30 outline-none focus:border-[#FF4E27]/50 resize-none mb-4"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-white/30">{reviewText.length} characters</span>
              <button
                onClick={handleSubmitReview}
                disabled={submitting || reviewText.trim().length < 10}
                className="px-5 py-2 bg-[#FF4E27] hover:bg-[#e5431f] disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white font-semibold text-sm transition"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
