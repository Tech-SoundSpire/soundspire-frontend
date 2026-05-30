"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ListMusic, Heart, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface ListDetail {
  list_id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_ranked: boolean;
  like_count: number;
  created_at: string;
  creator: { user_id: string; username: string; profile_picture_url: string | null } | null;
}

interface ListItemData {
  item_id: string;
  spotify_track_id: string;
  position: number | null;
  notes: string | null;
  song: {
    track_name: string;
    artist_name: string;
    album_art_url: string | null;
    duration_ms: number | null;
  } | null;
}

export default function ListDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const [list, setList] = useState<ListDetail | null>(null);
  const [items, setItems] = useState<ListItemData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/catalog/lists/${id}`);
        if (res.ok) {
          const data = await res.json();
          setList(data.list);
          setItems(data.items || []);
        }
      } catch {}
      setLoading(false);
    })();
  }, [id]);

  const handleRemoveItem = async (spotifyTrackId: string) => {
    const res = await fetch(`/api/catalog/lists/${id}/items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotify_track_id: spotifyTrackId }),
    });
    if (res.ok) {
      setItems(items.filter((i) => i.spotify_track_id !== spotifyTrackId));
      toast.success("Removed from list");
    }
  };

  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4E27]" />
      </div>
    );
  }

  if (!list) {
    return <div className="p-8 text-center text-white/40">List not found</div>;
  }

  const isOwner = user?.id === list.user_id;

  return (
    <div className="p-4 md:p-8">
      {/* Back link */}
      <Link href="/reviews/lists" className="inline-flex items-center gap-1 text-white/40 hover:text-white text-sm mb-6 transition">
        <ArrowLeft className="w-4 h-4" />
        Back to Lists
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-white mb-2">{list.title}</h1>
            {list.description && (
              <p className="text-white/50 text-sm mb-3">{list.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-white/40">
              {list.creator && <span>by <span className="text-white/70">{list.creator.username}</span></span>}
              <span className="flex items-center gap-1"><ListMusic className="w-3 h-3" /> {items.length} songs</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {list.like_count}</span>
              <span>{new Date(list.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Songs */}
      {items.length > 0 ? (
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            {items.map((item, idx) => (
              <div key={item.item_id} className="flex items-center gap-3 p-3 hover:bg-white/5 transition group">
                {list.is_ranked && (
                  <span className="text-white/30 text-sm w-6 text-right shrink-0">{idx + 1}</span>
                )}
                <Link href={`/reviews/song/${item.spotify_track_id}`} className="shrink-0">
                  {item.song?.album_art_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.song.album_art_url} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-white/10" />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/reviews/song/${item.spotify_track_id}`} className="text-white text-sm font-medium truncate block hover:text-[#FF4E27] transition">
                    {item.song?.track_name || "Unknown track"}
                  </Link>
                  <p className="text-white/40 text-xs truncate">{item.song?.artist_name || ""}</p>
                </div>
                {item.song?.duration_ms && (
                  <span className="text-white/30 text-xs shrink-0">{formatDuration(item.song.duration_ms)}</span>
                )}
                {isOwner && (
                  <button
                    onClick={() => handleRemoveItem(item.spotify_track_id)}
                    className="text-white/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition shrink-0"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
          <p className="text-white/40 mb-2">This list is empty.</p>
          <p className="text-white/30 text-sm">Search for songs and add them to this list.</p>
        </div>
      )}
    </div>
  );
}
