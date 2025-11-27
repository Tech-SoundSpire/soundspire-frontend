"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import { FaArrowLeft } from "react-icons/fa";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import BaseText from "@/components/BaseText/BaseText";

// const DEFAULT_PLACEHOLDER = "https://soundspirewebsiteassets.s3.amazonaws.com/images/placeholder.jpg";
const DEFAULT_PLACEHOLDER = getImageUrl(DEFAULT_PROFILE_IMAGE);

function ArtistDetailsContent() {
    const router = useRouter();
    const params = useSearchParams();
    const artistId = params.get("artistId");

    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const profileFileRef = useRef<HTMLInputElement>(null);
    const coverFileRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<any>({
        artist_name: "",
        username: "",
        bio: "",
        password_hash: "",
        confirm_password: "",
        email: "",
        phone: "",
        distribution_company: "",
        city: "",
        country: "",
        acceptTerms: false,
        profile_photo: "",
        cover_photo: "",
        community_name: "",
        community_description: "",
    });

    const [socialFields, setSocialFields] = useState([
        "facebook",
        "instagram",
        "youtube",
        "x",
    ]);
    const [newSocial, setNewSocial] = useState("");

    const [profilePreview, setProfilePreview] = useState<string | null>(null);
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [selectedProfileFile, setSelectedProfileFile] = useState<File | null>(
        null
    );
    const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(
        null
    );
    const [genreInput, setGenreInput] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => setMounted(true), []);

    // Determine if user is already logged in (so we can hide account inputs)
    useEffect(() => {
        (async () => {
            try {
                const s = await fetch("/api/auth/session");
                if (s.ok) {
                    const j = await s.json();
                    setIsLoggedIn(Boolean(j?.user));
                }
            } catch {
                setIsLoggedIn(false);
            }
        })();
    }, []);

    // Ensure artistId exists
    useEffect(() => {
        if (!artistId) {
            toast.error("Please select an artist from the list first.");
            router.replace("/find-artist-profile");
        }
    }, [artistId, router]);

    // Fetch artist details + identifiers
    useEffect(() => {
        if (!artistId) return;

        const fetchArtistDetails = async () => {
            try {
                setLoading(true);
                const [artistRes, identifiersRes] = await Promise.all([
                    fetch(`/api/artists/${artistId}`),
                    fetch(`/api/artists/${artistId}/identifiers`),
                ]);

                if (!artistRes.ok || !identifiersRes.ok)
                    throw new Error("Failed to fetch artist data");

                const artistData = await artistRes.json();
                const identifiersData = await identifiersRes.json();
                const artist = artistData?.object;
                const identifiers = identifiersData?.items || [];

                const mapPlatform = (p: string) => {
                    const k = (p || "").toLowerCase();
                    if (k === "x") return "twitter";
                    if (k.includes("apple")) return "apple_music";
                    return k;
                };

                const socialsFromIds = identifiers.map((id: any) => ({
                    platform: mapPlatform(id.platformName || id.platform),
                    url: id.url || "",
                }));

                // Deduplicate socials
                const socialsDedup = Object.values(
                    socialsFromIds.reduce((acc: any, s: any) => {
                        if (!s.platform) return acc;
                        const exist = acc[s.platform];
                        if (!exist || (s.url && !exist.url))
                            acc[s.platform] = s;
                        return acc;
                    }, {})
                );

                // Store Soundcharts socials separately (don’t modify visible fields yet)
                const soundchartsSocials = identifiers.map((id: any) => ({
                    platform: (
                        id.platformName ||
                        id.platform ||
                        ""
                    ).toLowerCase(),
                    url: id.url || "",
                }));

                setFormData((prev: any) => ({
                    ...prev,
                    _soundcharts: soundchartsSocials,
                }));

                const getIdentifierUrl = (platform: string) => {
                    const lower = platform.toLowerCase();

                    // STRICT match for X/Twitter
                    const twitterMatch = identifiers.find((id: any) => {
                        const name = (
                            id.platformName ||
                            id.platform ||
                            ""
                        ).toLowerCase();
                        return name === "twitter" || name === "x";
                    });

                    if (lower === "x" || lower === "twitter") {
                        return twitterMatch?.url || "";
                    }

                    // EXACT match for all other platforms
                    const exact = identifiers.find((id: any) => {
                        const name = (
                            id.platformName ||
                            id.platform ||
                            ""
                        ).toLowerCase();
                        return name === lower;
                    });

                    return exact?.url || "";
                };

                setFormData((prev: any) => ({
                    ...prev,
                    artist_name: artist?.name || "",
                    username: artist?.slug || "",
                    bio: artist?.biography || "",
                    // profile_photo: artist?.imageUrl || DEFAULT_PLACEHOLDER,
                    // cover_photo: artist?.imageUrl || DEFAULT_PLACEHOLDER,
                    profile_photo: artist?.imageUrl
                        ? getImageUrl(artist.imageUrl)
                        : getImageUrl(DEFAULT_PROFILE_IMAGE),
                    cover_photo: artist?.imageUrl
                        ? getImageUrl(artist.imageUrl)
                        : getImageUrl(DEFAULT_PROFILE_IMAGE),
                    socials: socialsDedup,
                    ...Object.fromEntries(
                        socialFields.map((s) => [s, getIdentifierUrl(s) || ""])
                    ),
                }));

                // Genre setup
                const genresArray =
                    artist?.genres
                        ?.flatMap((g: any) => [g?.root, ...(g?.sub || [])])
                        .filter(Boolean)
                        .map(
                            (g: string) =>
                                g.charAt(0).toUpperCase() +
                                g.slice(1).toLowerCase()
                        ) || [];
                setGenreInput([...new Set(genresArray)].join(", "));

                // setProfilePreview(artist?.imageUrl || DEFAULT_PLACEHOLDER);
                // setCoverPreview(artist?.imageUrl || DEFAULT_PLACEHOLDER);
                setProfilePreview(
                    artist?.imageUrl
                        ? getImageUrl(artist.imageUrl)
                        : getImageUrl(DEFAULT_PROFILE_IMAGE)
                );
                setCoverPreview(
                    artist?.imageUrl
                        ? getImageUrl(artist.imageUrl)
                        : getImageUrl(DEFAULT_PROFILE_IMAGE)
                );
            } catch (err) {
                console.error(err);
                toast.error("Failed to load artist details");
            } finally {
                setLoading(false);
            }
        };

        fetchArtistDetails();
    }, [artistId]);

    const handleChange = (e: any) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleImageChange = (e: any, type: "profile" | "cover") => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) return toast.error("File too large");
        if (!file.type.startsWith("image/"))
            return toast.error("Invalid image");

        if (type === "profile") {
            setSelectedProfileFile(file);
            setProfilePreview(URL.createObjectURL(file));
        } else {
            setSelectedCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const uploadImageToS3 = async (file: File, folder: string) => {
        try {
            const ext = file.name.split(".").pop();
            const fileName = `${folder}/${Date.now()}.${ext}`;
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName, fileType: file.type }),
            });
            if (!res.ok) throw new Error("Upload URL error");
            const { uploadUrl } = await res.json();
            const put = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!put.ok) throw new Error("Upload failed");

            return `s3://soundspirewebsiteassets/${fileName}`;
        } catch (e) {
            toast.error("Image upload failed");
            return null;
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!formData.acceptTerms) return toast.error("Please accept terms");
        if (
            !isLoggedIn &&
            formData.password_hash !== formData.confirm_password
        ) {
            return toast.error("Passwords do not match");
        }
        if (!artistId) return toast.error("Artist not selected");

        setLoading(true);
        try {
            let profileUrl =
                formData.profile_photo ||
                getImageUrl(DEFAULT_PROFILE_IMAGE) ||
                DEFAULT_PLACEHOLDER;
            let coverUrl = formData.cover_photo || DEFAULT_PLACEHOLDER;

            if (selectedProfileFile) {
                const uploaded = await uploadImageToS3(
                    selectedProfileFile,
                    "images/artists/profile"
                );
                if (uploaded) profileUrl = uploaded;
            }
            if (selectedCoverFile) {
                const uploaded = await uploadImageToS3(
                    selectedCoverFile,
                    "images/artists/cover"
                );
                if (uploaded) coverUrl = uploaded;
            }

            const socialsFromInputs = socialFields
                .map((p) => {
                    const url = (formData as any)[p] || "";
                    return url ? { platform: p, url } : null;
                })
                .filter(Boolean);

            const artistRes = await fetch("/api/artist-signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    socials: socialsFromInputs,
                    profile_picture_url: profileUrl,
                    cover_photo_url: coverUrl,
                    genre_names: genreInput
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                }),
            });

            const artistData = await artistRes.json();
            if (!artistRes.ok) {
                throw new Error(artistData.error || "Failed to create artist");
            }

            const artistId = artistData.artist.artist_id;
            toast.success("Artist created successfully!");

            const communityName =
                formData.community_name?.trim() ||
                `${formData.artist_name?.trim() || "My"}'s Community`;
            const communityDescription =
                formData.community_description?.trim() ||
                `Welcome to ${
                    formData.artist_name || "this artist"
                }'s official community!`;

            const communityRes = await fetch("/api/community", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    artist_id: artistId,
                    name: communityName,
                    description: communityDescription,
                }),
            });

            const communityData = await communityRes.json();
            if (!communityRes.ok)
                throw new Error(
                    communityData.error || "Community creation failed"
                );

            toast.success("Community created successfully!");

            router.push(`/payout?artistId=${artistId}`);
        } catch (err: any) {
            toast.error(err.message || "Submission failed");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => router.back();

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#1a1625] text-white p-8 relative">
            {/* Floating back button */}
            {typeof document !== "undefined" &&
                document.getElementById("header-actions") &&
                createPortal(
                    <button
                        onClick={handleBack}
                        className="w-[50px] h-[50px] bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition"
                    >
                        <FaArrowLeft className="text-black text-xl" />
                    </button>,
                    document.getElementById("header-actions") as HTMLElement
                )}

            <form
                onSubmit={handleSubmit}
                className="max-w-3xl mx-auto space-y-8 bg-[#241e33] p-8 rounded-2xl shadow-lg"
            >
                {/* Artist Name + Username */}
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        { name: "artist_name", label: "Artist Name" },
                        { name: "username", label: "Username" },
                    ].map((field) => (
                        <div key={field.name}>
                            <label className="block mb-2 text-sm font-semibold text-gray-300">
                                {field.label}
                            </label>
                            <input
                                type="text"
                                name={field.name}
                                value={(formData as any)[field.name]}
                                onChange={handleChange}
                                className="w-full p-3 bg-[#2d2838] rounded-lg text-white focus:ring-2 focus:ring-[#FA6400]"
                            />
                        </div>
                    ))}
                </div>

                {/* Bio */}
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-300">
                        Bio
                    </label>
                    <textarea
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleChange}
                        className="w-full p-3 bg-[#2d2838] rounded-lg text-white focus:ring-2 focus:ring-[#FA6400]"
                    />
                </div>

                {/* Genres */}
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-300">
                        Genres (comma separated)
                    </label>
                    <input
                        type="text"
                        value={genreInput}
                        onChange={(e) => setGenreInput(e.target.value)}
                        placeholder="e.g. Hip Hop, Pop"
                        className="w-full p-3 bg-[#2d2838] rounded-lg text-white focus:ring-2 focus:ring-[#FA6400]"
                    />
                </div>

                {/* Profile & Cover Upload */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-300">
                            Profile Photo
                        </label>
                        <div className="w-60 h-40 rounded-xl overflow-hidden bg-[#2d2838] relative group mx-auto">
                            <img
                                src={
                                    profilePreview ||
                                    getImageUrl(DEFAULT_PROFILE_IMAGE)
                                }
                                alt="Profile Preview"
                                className="object-cover w-full h-full"
                            />
                            <input
                                type="file"
                                ref={profileFileRef}
                                accept="image/*"
                                onChange={(e) =>
                                    handleImageChange(e, "profile")
                                }
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-semibold text-gray-300">
                            Cover Photo
                        </label>
                        <div className="w-60 h-40 rounded-xl overflow-hidden bg-[#2d2838] relative group mx-auto">
                            <img
                                src={coverPreview || DEFAULT_PLACEHOLDER}
                                alt="Cover Preview"
                                className="object-cover w-full h-full"
                            />
                            <input
                                type="file"
                                ref={coverFileRef}
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, "cover")}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div>
                    <h2 className="text-xl font-semibold text-[#FA6400] mb-4">
                        Social Links
                    </h2>

                    <div className="flex items-center gap-3 mb-4">
                        <input
                            type="text"
                            placeholder="Add new social platform (e.g. TikTok)"
                            value={newSocial}
                            onChange={(e) => setNewSocial(e.target.value)}
                            className="flex-1 p-3 bg-[#2d2838] rounded-lg text-white focus:ring-2 focus:ring-[#FA6400]"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const name = newSocial
                                    .trim()
                                    .toLowerCase()
                                    .replace(/\s+/g, "_");
                                if (!name)
                                    return toast.error("Enter a platform name");
                                if (socialFields.includes(name))
                                    return toast.error("Field already exists!");

                                // Check if Soundcharts had this platform
                                const match = formData._soundcharts?.find(
                                    (s: any) => s.platform === name
                                );

                                setSocialFields([...socialFields, name]);

                                // Pre-fill its URL if available
                                setFormData((prev: any) => ({
                                    ...prev,
                                    [name]: match?.url || "",
                                }));

                                setNewSocial("");
                            }}
                            className="bg-[#FA6400] px-4 py-2 rounded-lg hover:bg-[#ff7f32] transition"
                        >
                            Add
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {socialFields.map((platform) => (
                            <div key={platform} className="relative">
                                <label className="block mb-2 text-sm font-semibold text-gray-300 capitalize">
                                    {platform.replace("_", " ")}
                                </label>
                                <input
                                    type="text"
                                    name={platform}
                                    value={formData[platform] || ""}
                                    onChange={handleChange}
                                    placeholder={`Enter ${platform.replace(
                                        "_",
                                        " "
                                    )} link`}
                                    className="w-full p-3 bg-[#2d2838] rounded-lg text-white focus:ring-2 focus:ring-[#FA6400]"
                                />
                                {/* Remove button for dynamic fields only */}
                                {![
                                    "facebook",
                                    "instagram",
                                    "youtube",
                                    "x",
                                ].includes(platform) && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSocialFields(
                                                socialFields.filter(
                                                    (f) => f !== platform
                                                )
                                            )
                                        }
                                        className="absolute right-3 top-9 text-gray-400 hover:text-red-500"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Info */}
                <div>
                    <BaseHeading
                        headingLevel="h2"
                        fontSize="normal"
                        fontWeight={600}
                        textColor="#FA6400"
                        className="mb-4"
                    >
                        Contact Information
                    </BaseHeading>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            "email",
                            "phone",
                            "distribution_company",
                            "city",
                            "country",
                        ].map((field) => (
                            <div key={field}>
                                <label className="block mb-2 text-sm font-semibold text-gray-300 capitalize">
                                    {field.replace("_", " ")}
                                </label>
                                <input
                                    type={field === "email" ? "email" : "text"}
                                    name={field}
                                    value={(formData as any)[field]}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-[#2d2838] rounded-lg text-white focus:ring-2 focus:ring-[#FA6400]"
                                />
                            </div>
                        ))}

                        {/* Only show password if user not logged in */}
                        {!isLoggedIn && (
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-semibold text-gray-300">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    name="password_hash"
                                    value={
                                        (formData as any).password_hash || ""
                                    }
                                    onChange={handleChange}
                                    className="w-full p-3 bg-[#2d2838] rounded-lg text-white focus:ring-2 focus:ring-[#FA6400]"
                                />
                            </div>
                        )}

                        {!isLoggedIn && (
                            <div className="md:col-span-2">
                                <label className="block mb-2 text-sm font-semibold text-gray-300">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={
                                        (formData as any).confirm_password || ""
                                    }
                                    onChange={handleChange}
                                    className="w-full p-3 bg-[#2d2838] rounded-lg text-white focus:ring-2 focus:ring-[#FA6400]"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Community Setup  */}
                <BaseHeading
                    fontSize="normal"
                    fontWeight={600}
                    textColor="#FA6400"
                    className="mb-4"
                >
                    Community Setup
                </BaseHeading>

                <div className="space-y-4">
                    <label className="text-sm text-gray-400">
                        Community Name{" "}
                        <BaseText wrapper="span" textColor="#6b7280">
                            (auto-generated if left empty)
                        </BaseText>
                    </label>
                    <input
                        type="text"
                        name="community_name"
                        placeholder="Community Name"
                        value={formData.community_name || ""}
                        onChange={handleChange}
                        className="w-full p-3 bg-[#2d2838] rounded-lg text-white focus:ring-2 focus:ring-[#FA6400]"
                    />

                    <textarea
                        name="community_description"
                        placeholder="Describe your community (optional)"
                        value={formData.community_description || ""}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-3 bg-[#2d2838] rounded-lg text-white focus:ring-2 focus:ring-[#FA6400]"
                    />
                </div>

                {/* Terms & Conditions */}
                <div className="border-t border-gray-700 pt-6">
                    <BaseHeading
                        headingLevel="h2"
                        fontSize="normal"
                        fontWeight={600}
                        textColor="#FA6400"
                        className="mb-3"
                    >
                        Terms & Conditions
                    </BaseHeading>

                    <div className="bg-[#2d2838] rounded-lg p-4 h-48 overflow-y-scroll text-sm text-gray-300 mb-4 space-y-3">
                        <BaseText>
                            By creating an account, you agree that all provided
                            information is accurate and up to date. You
                            authorize our platform to manage and display your
                            profile.
                        </BaseText>
                        <BaseText>
                            You agree not to upload or distribute any content
                            that infringes on intellectual property rights or
                            promotes illegal activity.
                        </BaseText>
                        <BaseText>
                            Payments and royalties are subject to verification
                            and compliance with financial regulations.
                        </BaseText>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-[#FA6400] text-sm underline mb-4 block"
                    >
                        View in full window
                    </button>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                            className="w-4 h-4 accent-[#FA6400]"
                        />
                        <span>I accept the Terms and Conditions</span>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FA6400] py-3 rounded-lg font-semibold text-lg mt-4 hover:bg-[#ff7f32] transition"
                >
                    {loading ? "Creating..." : "Create Account"}
                </button>
            </form>

            {/* Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#241e33] rounded-xl max-w-2xl w-full p-6 relative overflow-y-auto max-h-[80vh]">
                        <button
                            type="button"
                            onClick={() => setShowTermsModal(false)}
                            className="absolute top-4 right-4 text-gray-300 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                        <BaseHeading
                            headingLevel="h2"
                            fontSize="normal"
                            fontWeight={700}
                            textColor="#FA6400"
                            className="mb-4"
                        >
                            Full Terms & Conditions
                        </BaseHeading>
                        <div className="text-gray-300 text-sm leading-relaxed space-y-3">
                            <BaseText>
                                Welcome to our artist distribution platform. By
                                using our services, you agree to comply with all
                                applicable laws and respect intellectual
                                property rights of other creators.
                            </BaseText>
                            <BaseText>
                                You grant us a worldwide, non-exclusive license
                                to promote and distribute your submitted works.
                            </BaseText>
                            <BaseText>
                                Any disputes will be resolved under your
                                country’s jurisdiction.
                            </BaseText>
                        </div>
                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setShowTermsModal(false)}
                                className="bg-[#FA6400] px-4 py-2 rounded-lg font-medium hover:bg-[#ff7f32] transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ArtistDetailsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#1a1625] text-white p-8 flex items-center justify-center">
                    Loading...
                </div>
            }
        >
            <ArtistDetailsContent />
        </Suspense>
    );
}
