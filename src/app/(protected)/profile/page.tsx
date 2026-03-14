"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { countriesWithCities } from "@/lib/locationData";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    getImageUrl,
    getDefaultProfileImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import { getFontClass } from "@/utils/getFontClass";
import { FaArrowLeftLong, FaPen } from "react-icons/fa6";
import Link from "next/link";
import { communityDataFromAPI } from "@/types/communityGetAllAPIData";

interface ProfileData {
    fullName: string;
    userName: string;
    gender: string;
    email: string;
    phoneNumber: string;
    dob: string;
    city: string;
    country: string;
    profileImage: string | null;
    spotifyLinked: boolean;
}

export default function ProfilePage() {
    const { user, logout, switchRole } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubscriptionsLoading, setIsSubscriptionsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [isValidatingUsername, setIsValidatingUsername] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmStep, setDeleteConfirmStep] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    const [profile, setProfile] = useState<ProfileData>({
        fullName: "",
        userName: "",
        gender: "Other",
        email: "",
        phoneNumber: "",
        dob: "2000-01-01",
        city: "New York",
        country: "United States",
        profileImage: null,
        spotifyLinked: false,
    });
    const [subscriptions, setSubscriptions] = useState<communityDataFromAPI[]>(
        [],
    );
    const [editableProfile, setEditableProfile] = useState<ProfileData>({
        ...profile,
    });

    useEffect(() => {
        if (!user || !user.email) {
            router.push("/login");
            return;
        }
        const fetchSubscriptions = async () => {
            try {
                const res = await fetch(
                    `/api/community/subscribe?user_id=${user.id}`,
                    { cache: 'no-store' }
                );
                if (!res.ok)
                    throw new Error(
                        "Error trying to receive response from subscriptions",
                    );
                const subscriptionData = await res.json();
                setSubscriptions(subscriptionData.communities);
            } catch (err) {
                toast.error("Failed to load subscriptions");
                console.error(err);
            } finally {
                setIsSubscriptionsLoading(false);
            }
        };
        const fetchProfile = async () => {
            try {
                const res = await fetch(
                    `/api/profile?email=${encodeURIComponent(user.email || "")}`,
                );

                const data = await res.json();

                if (data.error) throw new Error(data.error);

                setProfile({
                    fullName:
                        data.full_name ||
                        user.name ||
                        user.email?.split("@")[0] ||
                        "User",
                    userName:
                        data.username ||
                        user.email?.split("@")[0].toLowerCase() ||
                        "user",
                    email: data.email || user.email || "",
                    gender: data.gender || "Other",
                    phoneNumber: data.mobile_number || "",
                    dob: data.date_of_birth
                        ? new Date(data.date_of_birth)
                              .toISOString()
                              .split("T")[0]
                        : "2000-01-01",
                    city: data.city || "New York",
                    country: data.country || "United States",
                    profileImage:
                        data.profile_picture_url || user.photoURL || null,
                    spotifyLinked: data.spotify_linked || false,
                });
            } catch (err) {
                toast.error("Failed to load profile data");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
        fetchSubscriptions();
    }, [user, router]);

    useEffect(() => {
        setEditableProfile({ ...profile });
    }, [profile]);

    const countries = countriesWithCities.map((c) => c.name);
    const editableCities =
        countriesWithCities.find((c) => c.name === editableProfile.country)
            ?.cities || [];

    const handleLogout = async () => {
        try {
            await logout();
            router.push("/");
        } catch (error) {
            toast.error("Logout failed");
        }
    };

    const toggleEdit = () => {
        setUsernameError(null);
        setIsEditing((prev) => !prev);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditableProfile({ ...profile });
        setUsernameError(null);
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const checkUsernameUniqueness = async (
        username: string,
    ): Promise<boolean> => {
        setIsValidatingUsername(true);
        try {
            const res = await fetch(
                `/api/check-username?username=${encodeURIComponent(username)}`,
            );
            const data = await res.json();
            return data.isUnique;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setIsValidatingUsername(false);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        setUsernameError(null);
        try {
            if (!editableProfile.userName.trim()) {
                setUsernameError("Username cannot be empty");
                return;
            }

            if (!/^[a-zA-Z0-9_-]+$/.test(editableProfile.userName)) {
                setUsernameError(
                    "Username can only contain letters, numbers, underscores, or hyphens",
                );
                return;
            }

            if (editableProfile.userName !== profile.userName) {
                const isUnique = await checkUsernameUniqueness(
                    editableProfile.userName,
                );
                if (!isUnique) {
                    setUsernameError("This username is already taken");
                    return;
                }
            }

            const emailToUse =
                editableProfile.email || profile.email || user?.email || "";
            const fullNameToUse =
                editableProfile.fullName ||
                user?.name ||
                user?.email?.split("@")[0] ||
                "User";
            const usernameToUse =
                editableProfile.userName ||
                user?.email?.split("@")[0]?.toLowerCase() ||
                "user";

            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: emailToUse,
                    full_name: fullNameToUse,
                    username: usernameToUse,
                    gender: editableProfile.gender,
                    mobile_number: editableProfile.phoneNumber,
                    date_of_birth: editableProfile.dob,
                    city: editableProfile.city,
                    country: editableProfile.country,
                    profile_picture_url: editableProfile.profileImage,
                    spotify_linked: editableProfile.spotifyLinked,
                }),
            });

            if (!res.ok) throw new Error("Profile update failed");

            // Refetch profile from database to get updated data
            const updatedRes = await fetch(
                `/api/profile?email=${encodeURIComponent(emailToUse)}`,
            );
            if (updatedRes.ok) {
                const updatedData = await updatedRes.json();
                setProfile({
                    ...editableProfile,
                    profileImage:
                        updatedData.profile_picture_url ||
                        editableProfile.profileImage,
                });
            } else {
                setProfile({ ...editableProfile, fullName: profile.fullName });
            }

            setIsEditing(false);
            toast.success("Profile updated");
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        setEditableProfile((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // 1. Generate a unique filename
            const extension = file.name.split(".").pop();
            const fileName = `images/users/${profile.userName || "user"}-${
                user?.id || "unknown"
            }.${extension}`;

            // 2. Request a presigned URL from the backend
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName, fileType: file.type }),
            });
            if (!res.ok) throw new Error("Failed to get upload URL");
            const { uploadUrl } = await res.json();

            // 3. Upload the file directly to S3
            const uploadRes = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!uploadRes.ok) throw new Error("Failed to upload image to S3");

            // 4. Set the S3 path in the editableProfile state
            const s3Path = `s3://soundspirewebsiteassets/${fileName}`;
            setEditableProfile((prev) => ({ ...prev, profileImage: s3Path }));
        } catch (error) {
            toast.error("Image upload failed");
            console.error(error);
        }
    };

    const syncSpotify = async () => {
        try {
            setIsLoading(true);
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: profile.email,
                    spotify_linked: true,
                }),
            });
            if (!res.ok) throw new Error("Spotify sync failed");
            setProfile((prev) => ({ ...prev, spotifyLinked: true }));
            toast.success("Spotify linked");
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteInput !== "confirm delete") return;
        setIsDeletingAccount(true);
        try {
            const res = await fetch("/api/users/delete-account", { method: "DELETE", credentials: "include" });
            if (!res.ok) throw new Error("Failed to delete account");
            toast.success("Account deleted. Goodbye!");
            await logout();
            router.replace("/login");
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const montserrat = getFontClass("montserrat");
    const glassInput = "w-full h-[44px] px-4 py-1 rounded-lg border border-[#F7F7F7] text-white text-[16px] font-medium flex items-center";
    const glassInputBg = { background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(153,153,153,0.08) 100%)" };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className={`${montserrat} text-white`}>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <main className="md:ml-[54px] px-8 py-6">
                {/* Back button — outside centered container */}
                <button
                    onClick={() => router.back()}
                    className="p-3 flex items-center justify-center bg-[#1b1b1b] rounded-full border-[3px] border-[#ff4e50] text-white hover:bg-[#ff4e50] transition-colors duration-300 aspect-square w-fit mb-6"
                >
                    <FaArrowLeftLong />
                </button>
                <div className="max-w-[1100px] mx-auto">
                    {/* Header: title + edit button */}
                    <div className="flex items-center justify-between mb-8">
                        <h1 className={`${montserrat} text-[#FFD3C9] text-[28px] md:text-[47px] font-bold leading-[36px] md:leading-[56px]`}>
                            PROFILE
                        </h1>
                        <div className="flex gap-4">
                            {isEditing ? (
                                <>
                                    <button onClick={handleCancelEdit} className={`${montserrat} px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg`} disabled={isLoading}>Cancel</button>
                                    <button onClick={handleSave} className={`${montserrat} px-6 py-2 bg-[#FF4E27] hover:bg-[#e5431f] text-white rounded-lg font-bold`} disabled={isLoading || isValidatingUsername}>
                                        {isLoading ? "Saving..." : isValidatingUsername ? "Validating..." : "Save Edits"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleLogout} className={`${montserrat} px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg`}>Logout</button>
                                    <button onClick={toggleEdit} className={`${montserrat} px-6 py-2 bg-[#FF4E27] hover:bg-[#e5431f] text-white rounded-lg font-bold flex items-center gap-2`}>
                                        Edit Profile <FaPen className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Avatar + Name */}
                    <div className="flex items-center gap-4 mb-8">
                        <div
                            className={`relative w-[97px] h-[97px] rounded-[12px] overflow-hidden ${isEditing ? "cursor-pointer" : ""}`}
                            onClick={isEditing ? handleImageClick : undefined}
                        >
                            <img
                                src={isEditing
                                    ? (editableProfile.profileImage ? getImageUrl(editableProfile.profileImage) : profile.profileImage ? getImageUrl(profile.profileImage) : getDefaultProfileImageUrl())
                                    : (profile.profileImage ? getImageUrl(profile.profileImage) : getDefaultProfileImageUrl())}
                                alt="Profile picture"
                                className="object-cover w-full h-full"
                            />
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                                    <span className={montserrat}>Change</span>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageChange} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className={`${montserrat} text-white text-[28px] font-semibold leading-[34px]`}>{profile.fullName}</span>
                            <span className={`${montserrat} text-[#FFC8BC] text-[16px] font-medium`}>@{profile.userName}</span>
                        </div>
                    </div>

                    {/* Form Fields — 4 column grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-6 mb-8">
                        <div>
                            <label className={`${montserrat} text-[#F7F7F7] text-[18px] font-medium mb-2 block`}>Email</label>
                            <div className={`${montserrat} ${glassInput}`} style={glassInputBg}>{profile.email || "Not provided"}</div>
                        </div>
                        <div>
                            <label className={`${montserrat} text-[#F7F7F7] text-[18px] font-medium mb-2 block`}>Phone Number</label>
                            <div className={`${montserrat} ${glassInput}`} style={glassInputBg}>{profile.phoneNumber || "Not provided"}</div>
                        </div>
                        <div>
                            <label className={`${montserrat} text-[#F7F7F7] text-[18px] font-medium mb-2 block`}>DOB</label>
                            {isEditing ? (
                                <input type="date" name="dob" value={editableProfile.dob} onChange={handleChange} className={`${montserrat} ${glassInput} bg-transparent`} style={glassInputBg} />
                            ) : (
                                <div className={`${montserrat} ${glassInput}`} style={glassInputBg}>
                                    {profile.dob ? new Date(profile.dob).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }) : "Not provided"}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className={`${montserrat} text-[#F7F7F7] text-[18px] font-medium mb-2 block`}>Gender</label>
                            {isEditing ? (
                                <select name="gender" value={editableProfile.gender} onChange={handleChange} className={`${montserrat} ${glassInput} bg-transparent`} style={glassInputBg}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            ) : (
                                <div className={`${montserrat} ${glassInput}`} style={glassInputBg}>{profile.gender || "Other"}</div>
                            )}
                        </div>
                        <div>
                            <label className={`${montserrat} text-[#F7F7F7] text-[18px] font-medium mb-2 block`}>City</label>
                            {isEditing ? (
                                <select name="city" value={editableProfile.city} onChange={handleChange} className={`${montserrat} ${glassInput} bg-transparent`} style={glassInputBg}>
                                    {editableCities.map((city) => <option key={city} value={city}>{city}</option>)}
                                </select>
                            ) : (
                                <div className={`${montserrat} ${glassInput}`} style={glassInputBg}>{profile.city || "Not provided"}</div>
                            )}
                        </div>
                        <div>
                            <label className={`${montserrat} text-[#F7F7F7] text-[18px] font-medium mb-2 block`}>Country</label>
                            {isEditing ? (
                                <select name="country" value={editableProfile.country} onChange={(e) => {
                                    const newCountry = e.target.value;
                                    setEditableProfile((prev) => {
                                        const countryData = countriesWithCities.find((c) => c.name === newCountry);
                                        return { ...prev, country: newCountry, city: countryData?.cities?.[0] || "" };
                                    });
                                }} className={`${montserrat} ${glassInput} bg-transparent`} style={glassInputBg}>
                                    {countries.map((country) => <option key={country} value={country}>{country}</option>)}
                                </select>
                            ) : (
                                <div className={`${montserrat} ${glassInput}`} style={glassInputBg}>{profile.country || "Not provided"}</div>
                            )}
                        </div>
                        {isEditing && (
                            <div>
                                <label className={`${montserrat} text-[#F7F7F7] text-[18px] font-medium mb-2 block`}>Username</label>
                                <input type="text" name="userName" value={editableProfile.userName} onChange={handleChange} className={`${montserrat} ${glassInput} bg-transparent`} style={glassInputBg} placeholder="Username" />
                                {usernameError && <p className={`${montserrat} text-red-500 text-[12px] mt-1`}>{usernameError}</p>}
                            </div>
                        )}
                    </div>

                    <div className="w-full h-px bg-[#CCCACA]/50 my-8" />
                    <div className="mb-12">
                        <h2 className={`${montserrat} text-[#F7F7F7] text-[44px] font-bold leading-[53px] mb-6`}>My Subscriptions</h2>
                        {isSubscriptionsLoading ? (
                            <p className={`${montserrat} text-white text-[14px]`}>Loading subscriptions...</p>
                        ) : subscriptions.length > 0 ? (
                            <div className="flex gap-6 overflow-x-auto pb-4">
                                {subscriptions.map((subscription) => (
                                    <Link href={`/community/${subscription.artist_slug}`} key={subscription.artist_slug} className="flex-shrink-0 flex flex-col items-center gap-2">
                                        <div className="w-[98px] h-[98px] rounded-full overflow-hidden bg-white">
                                            <img src={getImageUrl(subscription.artist_profile_picture_url) || getImageUrl(subscription.artist_cover_photo_url) || getImageUrl(DEFAULT_PROFILE_IMAGE)} alt={subscription.name || undefined} className="w-full h-full object-cover" />
                                        </div>
                                        <span className={`${montserrat} text-white text-[16px] font-medium text-center w-[98px] truncate`}>{subscription.name}</span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className={`${montserrat} text-[#9ca3af]`}>No subscriptions found.</p>
                        )}
                    </div>

                    {/* Spotify section hidden - coming soon */}

                    {user.isAlsoArtist && user.role === "user" && (
                        <>
                            <div className="w-full h-px bg-[#CCCACA]/50 my-8" />
                            <div>
                                <h3 className={`${montserrat} text-purple-400 text-[20px] font-bold mb-2`}>Artist Mode</h3>
                                <p className={`${montserrat} text-[#9ca3af] text-[14px] mb-4`}>You have an artist profile. Switch to manage your community, posts, and fans.</p>
                                <button onClick={async () => { await switchRole("artist"); router.push("/artist/dashboard"); }} className={`${montserrat} px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg`}>
                                    Switch to Artist Dashboard
                                </button>
                            </div>
                        </>
                    )}

                    {!user.isAlsoArtist && (
                    <>
                    <div className="w-full h-px bg-[#CCCACA]/50 my-8" />
                    <div>
                        <h3 className={`${montserrat} text-red-500 text-[20px] font-bold mb-2`}>Danger Zone</h3>
                        <p className={`${montserrat} text-[#9ca3af] text-[14px] mb-4`}>Permanently delete your account and all associated data. This action cannot be undone.</p>
                        <button onClick={() => setShowDeleteModal(true)} className={`${montserrat} px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg`}>Delete My Account</button>
                    </div>
                    </>
                    )}

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 space-y-4">
                                <h3 className={`${montserrat} text-red-500 text-[18px] font-bold`}>Are you sure?</h3>
                                <p className={`${montserrat} text-[#d1d5db] text-[14px]`}>This will permanently delete your account, preferences, reviews, comments, votes, and all associated data. This cannot be undone.</p>

                                {!deleteConfirmStep ? (
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setShowDeleteModal(false)}
                                            className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                        >
                                            No, keep my account
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirmStep(true)}
                                            className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                                        >
                                            Yes, delete it
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3 pt-2">
                                        <p className={`${montserrat} text-red-400 text-[14px] font-semibold`}>
                                            Type &quot;confirm delete&quot; below to proceed:
                                        </p>
                                        <input
                                            type="text"
                                            value={deleteInput}
                                            onChange={(e) => setDeleteInput(e.target.value)}
                                            placeholder="confirm delete"
                                            className="w-full px-4 py-2 rounded-lg border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setShowDeleteModal(false);
                                                    setDeleteConfirmStep(false);
                                                    setDeleteInput("");
                                                }}
                                                className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDeleteAccount}
                                                disabled={deleteInput !== "confirm delete" || isDeletingAccount}
                                                className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                {isDeletingAccount ? "Deleting..." : "Delete!"}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
