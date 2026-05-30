"use client";

import { useEffect, useState } from "react";
import { Star, Heart, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl } from "@/utils/userProfileImageUtils";
import toast from "react-hot-toast";

interface ReviewItem {
  review_id: string;
  user_id: string;
  spotify_track_id: string;
  rating: number | null;
  review_text: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  user: { username: string; profile_picture_url: string | null };
  song: { track_name: string; artist_name: string; album_art_url: string | null } | null;
  user_liked?: boolean;
}

export default function ReviewsActivityPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/catalog/song-reviews/feed");
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Activity</h2>
        <p className="text-white/50">See what your friends are listening to and reviewing.</p>
      </header>

      {/* Reviews feed */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4E27]" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <ReviewCard key={review.review_id} review={review} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-white/40 text-lg mb-2">No reviews yet.</p>
          <p className="text-white/30 text-sm">Search for a song above to write the first review!</p>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewItem }) {
  const [likeCount, setLikeCount] = useState(review.like_count);
  const [liked, setLiked] = useState(review.user_liked || false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const handleLike = async () => {
    const method = liked ? "DELETE" : "POST";
    const res = await fetch(`/api/catalog/song-reviews/${review.review_id}/like`, { method });
    if (res.ok) {
      setLiked(!liked);
      setLikeCount(liked ? likeCount - 1 : likeCount + 1);
    }
  };

  const handleToggleComments = async () => {
    if (!showComments) {
      try {
        const res = await fetch(`/api/catalog/song-reviews/${review.review_id}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments || []);
        }
      } catch {}
    }
    setShowComments(!showComments);
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await fetch(`/api/catalog/song-reviews/${review.review_id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_text: commentText.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments([...comments, data.comment]);
        setCommentText("");
      }
    } catch {}
    setCommentLoading(false);
  };

  return (
    <article className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors">
      <div className="flex items-start gap-4">
        <Link href={`/reviews/song/${review.spotify_track_id}`} className="shrink-0">
          {review.song?.album_art_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={review.song.album_art_url} alt="" className="w-14 h-14 rounded-md object-cover shadow-lg" />
          ) : (
            <div className="w-14 h-14 rounded-md bg-white/10" />
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-white/20 overflow-hidden shrink-0">
              {review.user.profile_picture_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getImageUrl(review.user.profile_picture_url)}
                  alt={review.user.username}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span className="text-sm">
              <span className="font-semibold text-white">{review.user.username}</span>
              <span className="text-white/40 ml-1">reviewed</span>
              {review.song && (
                <>
                  <span className="text-white/30 mx-1">·</span>
                  <Link href={`/reviews/song/${review.spotify_track_id}`} className="font-semibold text-white hover:text-[#FF4E27] transition">
                    {review.song.track_name}
                  </Link>
                </>
              )}
            </span>
          </div>

          {review.rating && (
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(review.rating!) ? "fill-[#FF4E27] text-[#FF4E27]" : "text-white/20"}`}
                />
              ))}
              <span className="text-white/50 text-xs ml-1">{review.rating}/5</span>
              <span className="text-xs text-white/30 ml-2">
                {new Date(review.created_at).toLocaleDateString()}
              </span>
            </div>
          )}

          {!review.rating && (
            <span className="text-xs text-white/30 block mb-2">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          )}

          <p className="text-white/70 text-sm leading-relaxed mb-3">
            {review.review_text}
          </p>

          <div className="flex items-center gap-6 text-white/40 text-sm">
            <button onClick={handleLike} className={`flex items-center gap-1.5 transition-colors ${liked ? "text-[#FF4E27]" : "hover:text-[#FF4E27]"}`}>
              <Heart className={`w-4 h-4 ${liked ? "fill-[#FF4E27]" : ""}`} />
              <span>{likeCount}</span>
            </button>
            <button onClick={handleToggleComments} className={`flex items-center gap-1.5 transition-colors ${showComments ? "text-blue-400" : "hover:text-blue-400"}`}>
              <MessageCircle className={`w-4 h-4 ${showComments ? "fill-blue-400/20" : ""}`} />
              <span>{comments.length > 0 ? comments.length : review.comment_count}</span>
            </button>
          </div>

          {/* Inline comments */}
          {showComments && (
            <div className="mt-4 pt-3 border-t border-white/5">
              {comments.length > 0 && (
                <div className="flex flex-col gap-3 mb-3">
                  {comments.map((c: any) => (
                    <div key={c.comment_id} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/20 shrink-0 mt-0.5 overflow-hidden">
                        {c.profile_picture_url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={getImageUrl(c.profile_picture_url)} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white/70">{c.username || "User"}</span>
                        <p className="text-xs text-white/50">{c.comment_text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-xs placeholder:text-white/30 outline-none focus:border-[#FF4E27]/50"
                  onKeyDown={(e) => { if (e.key === "Enter") handlePostComment(); }}
                />
                <button
                  onClick={handlePostComment}
                  disabled={!commentText.trim() || commentLoading}
                  className="p-1.5 text-[#FF4E27] hover:bg-[#FF4E27]/10 rounded disabled:opacity-30 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
