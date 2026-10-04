import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getCommunityArtist } from "@/lib/communityArtist";
import { getImageUrl } from "@/utils/userProfileImageUtils";
import CommunityClient from "./CommunityClient";

// Server entry for /community/[slug]: loads the artist once (shared by metadata and page),
// so titles, share cards and the public About content are in the HTML for crawlers.
const loadArtist = cache((slug: string) => getCommunityArtist(slug));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const artist = await loadArtist(slug);
    if (!artist) return { title: "Community not found", robots: { index: false } };

    const name = artist.artist_name;
    const title = `${name} Community`;
    const bio = (artist.bio || "").replace(/\s+/g, " ").trim();
    const description = bio
        ? bio.length > 155 ? `${bio.slice(0, 152).trimEnd()}...` : bio
        : `Join ${name}'s official fan community on SoundSpire: chat with fans, share fan art, and get closer to ${name}.`;
    const image = getImageUrl(artist.profile_picture_url || artist.cover_photo_url);
    const path = `/community/${slug}`;

    return {
        title,
        description,
        alternates: { canonical: path },
        openGraph: { type: "profile", title: `${title} | SoundSpire`, description, url: path, images: [image] },
        twitter: { card: "summary_large_image", title: `${title} | SoundSpire`, description, images: [image] },
    };
}

export default async function CommunityPage({ params }: Props) {
    const { slug } = await params;
    const artist = await loadArtist(slug);
    if (!artist) notFound();
    return <CommunityClient slug={slug} initialArtist={artist as any} />;
}
