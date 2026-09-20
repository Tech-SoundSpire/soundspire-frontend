"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getImageUrl, DEFAULT_PROFILE_IMAGE } from "@/utils/userProfileImageUtils";
import { genreEmoji } from "@/utils/genreVisuals";

interface GenreArtist {
    artist_id: string;
    name: string;
    imageUrl: string | null;
    slug: string | null;
    onSoundSpire: boolean;
    soundcharts_uuid: string | null;
    subscriberCount: number;
}

export default function GenreArtistsPage() {
    const { genreId } = useParams() as { genreId: string };
    const [genreName, setGenreName] = useState("");
    const [artists, setArtists] = useState<GenreArtist[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/explore/genres/${genreId}/artists`);
                if (res.ok) {
                    const data = await res.json();
                    setGenreName(data.genre?.name || "");
                    setArtists(data.artists || []);
                }
            } finally { setLoading(false); }
        })();
    }, [genreId]);

    // Community for onboarded artists; vote page for off-platform ones (mirrors Explore).
    const hrefFor = (a: GenreArtist) =>
        a.onSoundSpire === false
            ? (a.soundcharts_uuid ? `/community/sc/${a.soundcharts_uuid}` : null)
            : (a.slug ? `/community/${a.slug}/` : null);

    return (
        <div className="md:ml-[54px] px-4 md:px-8 py-6 text-white">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/explore" className="text-gray-400 hover:text-white text-2xl">←</Link>
                <span className="text-3xl">{genreEmoji(genreName)}</span>
                <h1 className="text-2xl md:text-4xl font-bold text-[#FFD3C9]">{genreName}</h1>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FA6400]" /></div>
            ) : artists.length === 0 ? (
                <p className="text-gray-500 py-12">No artists in this genre yet.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {artists.map((a) => {
                        const href = hrefFor(a);
                        const card = (
                            <div className="flex flex-col items-center text-center bg-[#1a1625] hover:bg-[#241f30] transition rounded-xl p-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={getImageUrl(a.imageUrl || DEFAULT_PROFILE_IMAGE)} alt={a.name}
                                    className="w-24 h-24 rounded-full object-cover bg-gray-700" />
                                <span className="mt-3 font-semibold text-sm line-clamp-1">{a.name}</span>
                                {a.onSoundSpire
                                    ? <span className="text-xs text-gray-400 mt-0.5">{a.subscriberCount} {a.subscriberCount === 1 ? "member" : "members"}</span>
                                    : <span className="text-xs text-[#FF4E27] mt-0.5">Vote to bring them in</span>}
                            </div>
                        );
                        return href
                            ? <Link key={a.artist_id} href={href}>{card}</Link>
                            : <div key={a.artist_id} className="opacity-60">{card}</div>;
                    })}
                </div>
            )}
        </div>
    );
}
