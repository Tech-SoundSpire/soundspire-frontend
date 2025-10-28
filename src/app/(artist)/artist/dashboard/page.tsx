"use client";
import { useEffect, useState } from "react";

export default function ArtistDashboard() {
    const [artistId, setArtistId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/artist-session/me");
            if (res.ok) {
                const data = await res.json();
                setArtistId(data.artist_id ?? null);
            }
        })();
    }, []);

    return (
        <div className="min-h-screen text-white p-8">
            <h1 className="text-3xl font-bold">Artist Dashboard</h1>
            <p className="mt-2 text-gray-300">Current artist: {artistId ?? "not set"}</p>
        </div>
    );
}
