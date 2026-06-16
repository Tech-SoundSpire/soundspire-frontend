"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import Link from "next/link";

interface ArtistData {
  id: string;
  name: string;
  images: { url: string; width: number; height: number }[];
  genres: string[];
  spotify_url: string;
  top_tracks: { id: string; name: string; album_name: string; album_art: string; duration_ms: number; explicit: boolean }[];
}

interface AlbumItem {
  id: string;
  name: string;
  album_type: string;
  total_tracks: number;
  release_date: string;
  images: { url: string }[];
}

export default function ArtistCatalogPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const nameHint = searchParams.get("name") || "";
  const [artist, setArtist] = useState<ArtistData | null>(null);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [communitySlug, setCommunitySlug] = useState<string | null>(null);
  const [voteUuid, setVoteUuid] = useState<string | null>(null); // SoundCharts uuid for off-platform artists
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"top" | "discography">("top");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const nameParam = nameHint ? `?name=${encodeURIComponent(nameHint)}` : "";
        const [artistRes, albumsRes] = await Promise.all([
          fetch(`/api/catalog/artist/${id}${nameParam}`),
          fetch(`/api/catalog/artist/${id}/albums?limit=20${nameHint ? `&name=${encodeURIComponent(nameHint)}` : ""}`),
        ]);
        if (artistRes.ok) setArtist(await artistRes.json());
        if (albumsRes.ok) {
          const data = await albumsRes.json();
          setAlbums(data.albums || []);
        }

        // Check if this artist is onboarded to the platform
        let onboardedSlug: string | null = null;
        if (nameHint) {
          try {
            const communityRes = await fetch(`/api/explore/artists?q=${encodeURIComponent(nameHint)}`);
            if (communityRes.ok) {
              const artists = await communityRes.json();
              const onboarded = artists.find((a: any) => a.user_id && a.artist_name?.toLowerCase() === nameHint.toLowerCase());
              if (onboarded?.slug) { onboardedSlug = onboarded.slug; setCommunitySlug(onboarded.slug); }
            }
          } catch {}
        }

        // Not onboarded → resolve a SoundCharts uuid so we can link to the vote page.
        if (!onboardedSlug) {
          try {
            const resolveRes = await fetch(`/api/artists/resolve?spotifyId=${encodeURIComponent(id)}&name=${encodeURIComponent(nameHint)}`);
            if (resolveRes.ok) {
              const { soundchartsUuid } = await resolveRes.json();
              if (soundchartsUuid) setVoteUuid(soundchartsUuid);
            }
          } catch {}
        }
      } catch {}
      setLoading(false);
    })();
  }, [id]);

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

  if (!artist) {
    return <div className="p-8 text-center text-white/40">Artist not found</div>;
  }

  return (
    <div className="p-4 md:p-8">
      {/* Hero */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={artist.images?.[0]?.url || ""}
          alt={artist.name}
          className="w-36 h-36 md:w-48 md:h-48 rounded-full object-cover shadow-2xl border-4 border-white/10"
        />
        <div className="flex-1 text-center md:text-left">
          <div className="text-xs font-bold tracking-widest text-white/40 uppercase mb-1">Artist</div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2">{artist.name}</h1>
          {artist.genres?.length > 0 && (
            <p className="text-white/50 text-sm mb-4">{artist.genres.join(", ")}</p>
          )}
          <div className="flex items-center gap-4 mt-2">
            {artist.spotify_url && (
              <a href={artist.spotify_url} target="_blank" rel="noopener noreferrer" className="text-[#1DB954] text-sm hover:underline">
                Open on Spotify
              </a>
            )}
            {communitySlug ? (
              <Link href={`/community/${communitySlug}`} className="text-[#FF4E27] text-sm font-medium hover:underline">
                Go to their community →
              </Link>
            ) : voteUuid ? (
              // Not on SoundSpire yet — link to the "Vote for them to join" page.
              <Link href={`/community/sc/${voteUuid}`} className="text-[#FF4E27] text-sm font-medium hover:underline">
                Go to their community →
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/10 mb-6">
        <button
          onClick={() => setActiveTab("top")}
          className={`px-4 py-2 text-sm font-medium transition ${activeTab === "top" ? "text-white border-b-2 border-[#FF4E27]" : "text-white/40 hover:text-white/70"}`}
        >
          Top Tracks
        </button>
        <button
          onClick={() => setActiveTab("discography")}
          className={`px-4 py-2 text-sm font-medium transition ${activeTab === "discography" ? "text-white border-b-2 border-[#FF4E27]" : "text-white/40 hover:text-white/70"}`}
        >
          Discography
        </button>
      </div>

      {activeTab === "top" && (
        <div className="flex flex-col gap-1">
          {artist.top_tracks.map((track, i) => (
            <Link
              key={track.id}
              href={`/reviews/song/${track.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition group"
            >
              <span className="text-white/30 text-sm w-5 text-right">{i + 1}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={track.album_art} alt="" className="w-10 h-10 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate group-hover:text-[#FF4E27] transition">{track.name}</p>
                <p className="text-white/40 text-xs truncate">{track.album_name}</p>
              </div>
              <span className="text-white/30 text-xs">{formatDuration(track.duration_ms)}</span>
            </Link>
          ))}
        </div>
      )}

      {activeTab === "discography" && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {albums.map((album) => (
            <Link key={album.id} href={`/reviews/album/${album.id}`} className="group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={album.images?.[0]?.url || ""}
                alt={album.name}
                className="w-full aspect-square rounded-lg object-cover mb-2 group-hover:opacity-80 transition"
              />
              <p className="text-white text-sm font-medium truncate group-hover:text-[#FF4E27] transition">{album.name}</p>
              <p className="text-white/40 text-xs">{album.release_date?.split("-")[0]} · {album.album_type}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
