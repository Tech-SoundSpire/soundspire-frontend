"use client";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArtistData } from "@/app/(artist)/artist/dashboard/page";
import toast from "react-hot-toast";
import BaseText from "@/components/BaseText/BaseText";
export default function ArtistCommunityProfile() {
    const params = useParams();
    const slug = params.slug;
    const [artist, setArtist] = useState<ArtistData | null>(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!slug) return;
        (async () => {
            try {
                const res = await fetch(`/api/community/${slug}`);
                if (!res.ok) throw new Error("Error fetching Artist!!!!");
                const json = await res.json();
                setArtist(json.artist || json);
            } catch (err: any) {
                toast.error(err.message || "Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        })();
    }, [slug]);
    if (loading) {
        return (
            <div>
                <BaseHeading>Loading...</BaseHeading>
            </div>
        );
    }
    if (!artist) {
        return (
            <div className="min-h-screen bg-[#1a1625] text-white flex flex-col items-center justify-center">
                <BaseText>No artist data found.</BaseText>
            </div>
        );
    }
    return (
        <div>
            <BaseHeading fontSize="big heading">
                Hello {artist.artist_name}
            </BaseHeading>
        </div>
    );
}
