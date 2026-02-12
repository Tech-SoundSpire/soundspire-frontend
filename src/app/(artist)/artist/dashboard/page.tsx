/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
    getLogoUrl,
} from "@/utils/userProfileImageUtils";
import { FaYoutube, FaInstagram, FaFacebook, FaTiktok, FaPen, FaTimes, FaCheck } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import BaseText from "@/components/BaseText/BaseText";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import CommunityHeader from "@/components/CommunityHeader";

interface CommunityData {
    community_id: string;
    name: string;
    description?: string | null;
    subscription_fee: number;
    subscription_interval: string;
}

export interface ArtistData {
    artist_id: string;
    artist_name: string;
    bio: string;
    profile_picture_url: string;
    cover_photo_url: string;
    slug: string;
    socials?: { platform: string; url: string }[];
    community?: CommunityData | null;
}

const SOCIAL_ICONS: Record<string, any> = {
    youtube: FaYoutube,
    instagram: FaInstagram,
    twitter: FaXTwitter,
    x: FaXTwitter,
    facebook: FaFacebook,
    tiktok: FaTiktok,
};

export default function ArtistDashboard() {
    const router = useRouter();
    const { logout, switchRole } = useAuth();
    const [artist, setArtist] = useState<ArtistData | null>(null);
    const [loading, setLoading] = useState(true);

    // Edit state
    const [editing, setEditing] = useState(false);
    const [editBio, setEditBio] = useState("");
    const [editSocials, setEditSocials] = useState<{ platform: string; url: string }[]>([]);
    const [saving, setSaving] = useState(false);
    const profileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/artist/me");
                if (!res.ok) throw new Error("Unable to fetch artist data");
                const data = await res.json();
                setArtist(data.artist);
            } catch (err: any) {
                toast.error(err.message || "Failed to load dashboard");
                router.replace("/find-artist-profile");
            } finally {
                setLoading(false);
            }
        })();
    }, [router]);

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("Logged out successfully");
            setTimeout(() => router.push("/artist-onboarding"), 2000);
        } catch {
            toast.error("Failed to logout");
        }
    };

    const startEditing = () => {
        if (!artist) return;
        setEditBio(artist.bio || "");
        setEditSocials(artist.socials?.map((s) => ({ ...s })) || []);
        setEditing(true);
    };

    const uploadImage = async (file: File, type: "profile" | "cover"): Promise<string | null> => {
        try {
            const ext = file.name.split(".").pop();
            const fileName = `images/artists/${artist!.artist_id}-${type}.${ext}`;
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName, fileType: file.type }),
            });
            if (!res.ok) throw new Error();
            const { uploadUrl } = await res.json();
            const up = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
            if (!up.ok) throw new Error();
            return `s3://soundspirewebsiteassets/${fileName}`;
        } catch {
            toast.error(`Failed to upload ${type} image`);
            return null;
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "profile" | "cover") => {
        const file = e.target.files?.[0];
        if (!file || !artist) return;
        if (file.size > 5 * 1024 * 1024) { toast.error("Max 5MB"); return; }

        const s3Path = await uploadImage(file, type);
        if (!s3Path) return;

        const body = type === "profile" ? { profile_picture_url: s3Path } : { cover_photo_url: s3Path };
        const res = await fetch("/api/artist/me/edit", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            setArtist({ ...artist, ...(type === "profile" ? { profile_picture_url: s3Path } : { cover_photo_url: s3Path }) });
            toast.success(`${type === "profile" ? "Profile" : "Cover"} photo updated`);
        }
    };

    const saveEdits = async () => {
        if (!artist) return;
        setSaving(true);
        try {
            const res = await fetch("/api/artist/me/edit", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bio: editBio, socials: editSocials.filter((s) => s.url) }),
            });
            if (!res.ok) throw new Error();
            setArtist({ ...artist, bio: editBio, socials: editSocials.filter((s) => s.url) });
            setEditing(false);
            toast.success("Profile updated");
        } catch {
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1625] flex items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
            </div>
        );
    }

    if (!artist) {
        return (
            <div className="min-h-screen bg-[#1a1625] text-white flex flex-col items-center justify-center">
                <BaseText>No artist data found.</BaseText>
                <button onClick={() => router.push("/find-artist-profile")} className="mt-4 px-4 py-2 bg-[#FA6400] rounded-lg">
                    Go Back
                </button>
            </div>
        );
    }

    const profileImg = artist.profile_picture_url ? getImageUrl(artist.profile_picture_url) : getImageUrl(DEFAULT_PROFILE_IMAGE);
    const coverImg = artist.cover_photo_url ? getImageUrl(artist.cover_photo_url) : getImageUrl(DEFAULT_PROFILE_IMAGE);

    return (
        <div className="min-h-screen bg-[#1a1625] text-white flex flex-col">
            {/* Hidden file inputs */}
            <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "profile")} />
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, "cover")} />

            {/* HEADER */}
            <CommunityHeader
                slug={artist.slug}
                communityName={artist.community?.name}
                isSubscribed={true}
                isArtist={true}
                currentPage="about"
                onLogout={handleLogout}
                onSwitchToFan={async () => { await switchRole("user"); router.push("/explore"); }}
            />

            {/* COVER + PROFILE (LinkedIn-style) */}
            <div className="mt-16 relative">
                {/* Cover image */}
                <div className="relative w-full h-56 md:h-72 overflow-hidden cursor-pointer group" onClick={() => coverInputRef.current?.click()}>
                    <img src={coverImg} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                        <FaPen className="text-white text-2xl opacity-0 group-hover:opacity-100 transition" />
                    </div>
                </div>
                {/* Profile photo overlapping bottom of cover */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 z-10">
                    <div
                        className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-[#1a1625] overflow-hidden bg-gray-700 shadow-xl cursor-pointer group relative"
                        onClick={() => profileInputRef.current?.click()}
                    >
                        <img src={profileImg} alt={artist.artist_name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition rounded-full flex items-center justify-center">
                            <FaPen className="text-white opacity-0 group-hover:opacity-100 transition" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Name + Community badge */}
            <div className="mt-20 text-center">
                <BaseHeading fontSize="large" fontWeight={700}>{artist.artist_name}</BaseHeading>
                {artist.community?.name && (
                    <BaseText textColor="#9ca3af" fontSize="small" fontStyle="italic" className="mt-1">{artist.community.name}</BaseText>
                )}
            </div>

            {/* Edit toggle */}
            <div className="flex justify-end max-w-4xl w-full mx-auto px-6 mt-4">
                {!editing ? (
                    <button onClick={startEditing} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">
                        <FaPen size={12} /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => setEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">
                            <FaTimes size={14} /> Cancel
                        </button>
                        <button onClick={saveEdits} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-[#FA6400] hover:bg-[#e55a00] rounded-lg text-sm font-bold transition disabled:opacity-50">
                            <FaCheck size={14} /> {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                )}
            </div>

            {/* MAIN CONTENT */}
            <div className="max-w-4xl w-full mx-auto px-6 py-8 space-y-8">
                {/* About */}
                <div className="p-6 rounded-2xl bg-[#221c2f] border border-gray-800">
                    <BaseHeading fontWeight={600} fontSize="normal" className="mb-3">About</BaseHeading>
                    {editing ? (
                        <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={5}
                            className="w-full p-3 bg-[#1a1625] text-gray-200 rounded-lg border border-gray-700 focus:ring-2 focus:ring-[#FA6400] focus:outline-none resize-none" />
                    ) : artist.bio ? (
                        <div className="text-gray-300 leading-relaxed prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: artist.bio }} />
                    ) : (
                        <BaseText textColor="#6b7280">No bio yet. Click Edit Profile to add one.</BaseText>
                    )}
                </div>

                {/* Social Links */}
                <div className="p-6 rounded-2xl bg-[#221c2f] border border-gray-800">
                    <BaseHeading fontWeight={600} fontSize="normal" className="mb-3">Social Links</BaseHeading>
                    {editing ? (
                        <div className="space-y-3">
                            {editSocials.map((s, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <select value={s.platform} onChange={(e) => { const n = [...editSocials]; n[i].platform = e.target.value; setEditSocials(n); }}
                                        className="px-3 py-2 bg-[#1a1625] text-white rounded-lg border border-gray-700 text-sm">
                                        {["youtube", "instagram", "twitter", "facebook", "tiktok"].map((p) => (
                                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                                        ))}
                                    </select>
                                    <input value={s.url} onChange={(e) => { const n = [...editSocials]; n[i].url = e.target.value; setEditSocials(n); }}
                                        placeholder="https://..." className="flex-1 px-3 py-2 bg-[#1a1625] text-white rounded-lg border border-gray-700 text-sm" />
                                    <button onClick={() => setEditSocials(editSocials.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300"><FaTimes /></button>
                                </div>
                            ))}
                            <button onClick={() => setEditSocials([...editSocials, { platform: "instagram", url: "" }])} className="text-sm text-[#FA6400] hover:underline">+ Add Link</button>
                        </div>
                    ) : artist.socials && artist.socials.length > 0 ? (
                        <div className="flex gap-4">
                            {artist.socials.map((s, i) => {
                                const Icon = SOCIAL_ICONS[s.platform.toLowerCase()];
                                if (!Icon) return null;
                                return <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#FA6400] transition text-2xl"><Icon /></a>;
                            })}
                        </div>
                    ) : (
                        <BaseText textColor="#6b7280">No social links. Click Edit Profile to add some.</BaseText>
                    )}
                </div>

                {/* Community Highlights */}
                {artist.community && (
                    <div className="p-6 rounded-2xl bg-[#221c2f] border border-gray-800">
                        <BaseHeading fontSize="normal" fontWeight={600} className="mb-3">Community Highlights</BaseHeading>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {["Be a part of the TRIBE", "Get Access to the Screens", "Tap into the Global Community"].map((title, idx) => (
                                <div key={idx} className="relative h-40 rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-[#1a1625] border border-gray-700 flex items-end p-4">
                                    <BaseText fontWeight={600} fontSize="small">{title}</BaseText>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <div className="p-6 rounded-2xl bg-[#221c2f] border border-gray-800">
                    <BaseHeading headingLevel="h2" fontSize="normal" fontWeight={600} className="mb-6">Reviews by the SoundSpire Team</BaseHeading>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-[#1a1625] border border-gray-700 rounded-xl p-5 shadow-lg hover:shadow-xl transition space-y-3">
                                <div className="w-full h-32 rounded-lg overflow-hidden">
                                    <img src={profileImg} alt="Artist" className="w-full h-full object-cover" />
                                </div>
                                <BaseText textColor="#d1d5db" fontSize="small">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed feugiat nunc vitae mi facilisis.
                                </BaseText>
                                <BaseText textColor="#fa6400" fontSize="very small" fontWeight={500}>
                                    Ashish Paul • 20 Dec
                                </BaseText>
                                <button className="bg-[#FA6400] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#ff832e] transition">
                                    Read More
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
