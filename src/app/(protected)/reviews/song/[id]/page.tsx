"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star, Heart, Plus, Share, PenSquare, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/utils/userProfileImageUtils";
import toast from "react-hot-toast";

interface TrackData {
  spotify_track_id: string;
  track_name: string;
  artist_name: string;
  artist_id: string;
  album_name: string | null;
  album_id: string | null;
  album_art_url: string | null;
  duration_ms: number | null;
  isrc: string | null;
  explicit: boolean;
  release_date: string | null;
  spotify_url: string | null;
  credits: any[] | null;
}

interface RatingData {
  avg_rating: number | null;
  rating_count: number;
  review_count: number;
  rating_distribution: Record<string, number>;
  user_rating: number | null;
}

interface ReviewItem {
  review_id: string;
  user_id: string;
  rating: number | null;
  review_text: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  user: { username: string; profile_picture_url: string | null };
}

export default function SongPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [track, setTrack] = useState<TrackData | null>(null);
  const [ratings, setRatings] = useState<RatingData | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reviews" | "credits" | "details">("reviews");
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [userLists, setUserLists] = useState<any[]>([]);
  const [newListTitle, setNewListTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [existingReviewId, setExistingReviewId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [trackRes, ratingsRes, reviewsRes] = await Promise.all([
          fetch(`/api/catalog/track/${id}`),
          fetch(`/api/catalog/ratings/track/${id}`),
          fetch(`/api/catalog/song-reviews/track/${id}?sort=popular`),
        ]);
        if (trackRes.ok) setTrack(await trackRes.json());
        if (ratingsRes.ok) {
          const rd = await ratingsRes.json();
          setRatings(rd);
          setUserRating(rd.user_rating);
        }
        if (reviewsRes.ok) {
          const rv = await reviewsRes.json();
          setReviews(rv.reviews || []);
          // Check if current user already has a review
          if (user) {
            const myReview = (rv.reviews || []).find((r: any) => r.user_id === user.id);
            if (myReview) {
              setExistingReviewId(myReview.review_id);
              setReviewText(myReview.review_text);
            }
          }
        }
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  const handleRate = async (rating: number) => {
    if (!user) return;
    setUserRating(rating);
    await Promise.all([
      fetch("/api/catalog/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotify_track_id: id, rating }),
      }),
      fetch("/api/catalog/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotify_track_id: id, rating, liked: liked }),
      }),
    ]);
    const res = await fetch(`/api/catalog/ratings/track/${id}`);
    if (res.ok) setRatings(await res.json());
  };

  const handleLike = async () => {
    if (!user) return;
    const newLiked = !liked;
    setLiked(newLiked);
    if (newLiked) {
      await fetch("/api/catalog/diary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotify_track_id: id, liked: true, rating: userRating }),
      });
      toast.success("Logged to diary");
    }
  };

  const handleSubmitReview = async () => {
    if (!user || reviewText.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }
    setSubmitting(true);
    try {
      const method = existingReviewId ? "PUT" : "POST";
      const url = existingReviewId ? `/api/catalog/song-reviews/${existingReviewId}` : "/api/catalog/song-reviews";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotify_track_id: id,
          rating: userRating || null,
          review_text: reviewText.trim(),
        }),
      });
      if (res.ok) {
        toast.success(existingReviewId ? "Review updated!" : "Review submitted!");
        setShowReviewModal(false);
        if (!existingReviewId) {
          const data = await res.json();
          setExistingReviewId(data.review?.review_id || null);
        }
        const rv = await fetch(`/api/catalog/song-reviews/track/${id}?sort=popular`);
        if (rv.ok) { const data = await rv.json(); setReviews(data.reviews || []); }
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to submit review");
      }
    } catch { toast.error("Failed to submit review"); }
    setSubmitting(false);
  };

  const handleOpenListModal = async () => {
    if (!user) return;
    setShowListModal(true);
    try {
      const res = await fetch("/api/catalog/lists/mine");
      if (res.ok) {
        const data = await res.json();
        setUserLists(data.lists || []);
      }
    } catch {}
  };

  const handleAddToList = async (listId: string) => {
    const res = await fetch(`/api/catalog/lists/${listId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotify_track_id: id }),
    });
    if (res.ok) toast.success("Added to list!");
    else toast.error("Already in this list");
  };

  const handleCreateList = async () => {
    if (!newListTitle.trim()) return;
    const res = await fetch("/api/catalog/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newListTitle.trim() }),
    });
    if (res.ok) {
      const data = await res.json();
      await handleAddToList(data.list.list_id);
      setNewListTitle("");
      setShowListModal(false);
      toast.success(`Created "${newListTitle.trim()}" and added song`);
    }
  };

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF4E27]" />
      </div>
    );
  }

  if (!track) {
    return <div className="p-8 text-center text-white/40">Track not found</div>;
  }

  return (
    <div className="p-4 md:p-8">
      {/* Hero */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-10">
        <div className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={track.album_art_url || ""}
            alt={track.track_name}
            className="w-44 h-44 md:w-56 md:h-56 rounded-xl shadow-2xl object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col justify-end">
          <div className="mb-1 text-xs font-bold tracking-widest text-white/40 uppercase">Song</div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">{track.track_name}</h1>
          <p className="text-lg text-white/60 mb-4">
            <Link href={`/reviews/artist/${track.artist_id}?name=${encodeURIComponent(track.artist_name)}`} className="font-semibold text-white hover:text-[#FF4E27] transition">
              {track.artist_name}
            </Link>
            {track.album_name && <span> · {track.album_name}</span>}
            {track.release_date && <span> · {track.release_date.split("-")[0]}</span>}
            {track.duration_ms && <span> · {formatDuration(track.duration_ms)}</span>}
            {track.explicit && <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-white/20 rounded">E</span>}
          </p>

          {/* Rating display */}
          {ratings && ratings.avg_rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(ratings.avg_rating!) ? "fill-[#FF4E27] text-[#FF4E27]" : "text-white/20"}`} />
                ))}
              </div>
              <span className="text-white/60 text-sm">{ratings.avg_rating.toFixed(1)} ({ratings.rating_count} ratings)</span>
            </div>
          )}

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => setShowReviewModal(true)} className="px-5 py-2 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2">
              <PenSquare className="w-4 h-4" />
              {existingReviewId ? "Edit Review" : "Add Review"}
            </button>
            <button onClick={handleOpenListModal} className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition" title="Add to List">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={handleLike} className={`w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center transition ${liked ? "text-red-500 border-red-500/40" : "text-white/50 hover:text-red-500 hover:border-white/40"}`} title="Favorite">
              <Heart className={`w-4 h-4 ${liked ? "fill-red-500" : ""}`} />
            </button>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }} className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition" title="Share">
              <Share className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Your Rating */}
      <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
        <span className="text-sm text-white/50 mr-3">Your rating:</span>
        <div className="inline-flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => handleRate(star)}
              className="p-0.5"
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  (hoverRating || userRating || 0) >= star
                    ? "fill-[#FF4E27] text-[#FF4E27]"
                    : "text-white/20"
                }`}
              />
            </button>
          ))}
        </div>
        {userRating && <span className="text-sm text-white/40 ml-3">({userRating}/5)</span>}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-6">
        {(["reviews", "credits", "details"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition ${
              activeTab === tab ? "text-white border-b-2 border-[#FF4E27]" : "text-white/40 hover:text-white/70"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Tab content */}
        <div className="md:col-span-2">
          {activeTab === "reviews" && (
            <div className="flex flex-col gap-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <article key={review.review_id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-white/20 overflow-hidden shrink-0">
                        {review.user.profile_picture_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={getImageUrl(review.user.profile_picture_url)} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="text-sm font-semibold text-white">{review.user.username}</span>
                      {review.rating && (
                        <div className="flex ml-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < Math.floor(review.rating!) ? "fill-[#FF4E27] text-[#FF4E27]" : "text-white/20"}`} />
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">{review.review_text}</p>
                    <div className="flex items-center gap-4 mt-3 text-white/40 text-xs">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {review.like_count}</span>
                      <span>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
                  <p className="text-white/40">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "credits" && (
            <div className="space-y-3">
              {track.credits && track.credits.length > 0 ? (
                track.credits.map((credit: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                    <span className="text-white/80 text-sm">{credit.name}</span>
                    <span className="text-white/40 text-xs">{credit.role}</span>
                  </div>
                ))
              ) : (
                <p className="text-white/40 text-sm py-8 text-center">Credits not available for this track.</p>
              )}
            </div>
          )}

          {activeTab === "details" && (
            <div className="space-y-3">
              {track.isrc && <div className="flex justify-between py-2 border-b border-white/5"><span className="text-white/50 text-sm">ISRC</span><span className="text-white/80 text-sm">{track.isrc}</span></div>}
              {track.release_date && <div className="flex justify-between py-2 border-b border-white/5"><span className="text-white/50 text-sm">Release Date</span><span className="text-white/80 text-sm">{track.release_date}</span></div>}
              {track.duration_ms && <div className="flex justify-between py-2 border-b border-white/5"><span className="text-white/50 text-sm">Duration</span><span className="text-white/80 text-sm">{formatDuration(track.duration_ms)}</span></div>}
              {track.album_name && <div className="flex justify-between py-2 border-b border-white/5"><span className="text-white/50 text-sm">Album</span><span className="text-white/80 text-sm">{track.album_name}</span></div>}
              <div className="flex justify-between py-2 border-b border-white/5"><span className="text-white/50 text-sm">Explicit</span><span className="text-white/80 text-sm">{track.explicit ? "Yes" : "No"}</span></div>
              {track.spotify_url && (
                <div className="pt-4">
                  <a href={track.spotify_url} target="_blank" rel="noopener noreferrer" className="text-[#1DB954] text-sm hover:underline">
                    Open on Spotify
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Rating stats */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 h-fit">
          <h3 className="font-bold mb-4 text-white">Ratings</h3>
          {ratings && ratings.avg_rating ? (
            <>
              <div className="flex items-end gap-3 mb-5">
                <div className="text-4xl font-black text-white">{ratings.avg_rating.toFixed(1)}</div>
                <div className="mb-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(ratings.avg_rating!) ? "fill-[#FF4E27] text-[#FF4E27]" : "text-white/20"}`} />
                    ))}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">{ratings.rating_count} ratings</div>
                </div>
              </div>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = (ratings.rating_distribution as any)?.[star.toString()] || 0;
                  const pct = ratings.rating_count > 0 ? (count / ratings.rating_count) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs text-white/40">
                      <span className="w-2">{star}</span>
                      <Star className="w-3 h-3" />
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#FF4E27] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-white/40 text-sm">No ratings yet.</p>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReviewModal(false)}>
          <div className="bg-[#1a1625] border border-white/10 rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Write a Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-white/50 text-sm mb-3">{track.track_name} — {track.artist_name}</p>

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
              placeholder="Write your review (minimum 10 characters)..."
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

      {/* Add to List Modal */}
      {showListModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowListModal(false)}>
          <div className="bg-[#1a1625] border border-white/10 rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Add to List</h3>
              <button onClick={() => setShowListModal(false)} className="text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {userLists.length > 0 ? (
              <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto">
                {userLists.map((list: any) => (
                  <button
                    key={list.list_id}
                    onClick={() => { handleAddToList(list.list_id); setShowListModal(false); }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition text-left w-full"
                  >
                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
                      <Plus className="w-4 h-4 text-white/40" />
                    </div>
                    <span className="text-white text-sm font-medium truncate">{list.title}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-sm mb-4">You don&apos;t have any lists yet.</p>
            )}

            <div className="border-t border-white/10 pt-4">
              <p className="text-white/50 text-xs mb-2">Create a new list:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="List name..."
                  className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder:text-white/30 outline-none focus:border-[#FF4E27]/50"
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateList(); }}
                />
                <button
                  onClick={handleCreateList}
                  disabled={!newListTitle.trim()}
                  className="px-4 py-2 bg-[#FF4E27] hover:bg-[#e5431f] disabled:opacity-50 rounded-lg text-white text-sm font-semibold transition"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
