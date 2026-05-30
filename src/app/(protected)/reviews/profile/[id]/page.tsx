"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Star, Heart, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { getImageUrl } from "@/utils/userProfileImageUtils";

interface UserProfile {
  user_id: string;
  username: string;
  profile_picture_url: string | null;
  bio: string | null;
}

interface ReviewItem {
  review_id: string;
  spotify_track_id: string;
  rating: number | null;
  review_text: string;
  like_count: number;
  created_at: string;
}

export default function ReviewProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState({ ratings: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const profileRes = await fetch(`/api/users/${id}/profile`);
        if (profileRes.ok) setProfile(await profileRes.json());
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4E27]" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Profile header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12">
        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-4 border-white/10 shrink-0">
          {profile?.profile_picture_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={getImageUrl(profile.profile_picture_url)}
              alt={profile.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/10 flex items-center justify-center text-3xl font-bold text-white/30">
              {profile?.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1">{profile?.username || "User"}</h1>
          {profile?.bio && (
            <p className="text-white/60 max-w-lg mb-4 text-sm leading-relaxed">{profile.bio}</p>
          )}
          <div className="flex items-center justify-center md:justify-start gap-6">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-xl font-bold text-white">{stats.ratings}</span>
              <span className="text-xs text-white/40 uppercase tracking-wider">Ratings</span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <span className="text-xl font-bold text-white">{stats.reviews}</span>
              <span className="text-xs text-white/40 uppercase tracking-wider">Reviews</span>
            </div>
          </div>
        </div>

        <button className="px-6 py-2 rounded-full bg-[#FF4E27] text-white font-bold hover:bg-[#e5431f] transition shrink-0">
          Follow
        </button>
      </div>

      {/* Favorites placeholder */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          All-Time Favorites
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-white/20 text-xs">No favorite set</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent reviews */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Recent Reviews</h2>
        {reviews.length > 0 ? (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <article key={review.review_id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  {review.rating && (
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(review.rating!) ? "fill-[#FF4E27] text-[#FF4E27]" : "text-white/20"}`} />
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-white/40">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-white/70 text-sm leading-relaxed">{review.review_text}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <p className="text-white/40">No reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
