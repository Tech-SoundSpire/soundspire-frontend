"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { countriesWithCities } from "@/lib/locationData";
import { toast } from "react-toastify";
import styles from "./profile.module.css";
import "react-toastify/dist/ReactToastify.css";
import {
    getImageUrl,
    getDefaultProfileImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import BaseText from "@/components/BaseText/BaseText";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
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
    const { user, logout } = useAuth();
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

    if (!user) {
        return (
            <div className="min-h-screen bg-[#1a1625] flex items-center justify-center">
                <BaseText textColor="#ffffff" fontSize="normal">
                    Loading profile...
                </BaseText>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1625]">
            <Navbar />
            <main className="ml-16 px-8 py-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <BaseHeading
                            headingLevel="h1"
                            fontSize="sub heading"
                            fontWeight={700}
                            textColor="#ffffff"
                        >
                            Profile
                        </BaseHeading>
                        <div className="flex space-x-4">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-6 py-2 bg-[#ff5733] hover:bg-[#e64a2e] text-white rounded-md transition-colors duration-200 flex items-center"
                                        disabled={
                                            isLoading || isValidatingUsername
                                        }
                                    >
                                        {isLoading
                                            ? "Saving..."
                                            : isValidatingUsername
                                              ? "Validating..."
                                              : "Save Edits"}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={handleLogout}
                                        className="px-6 py-2 rounded-md bg-gray-600 text-white transition-colors duration-200 hover:bg-gray-700"
                                    >
                                        Logout
                                    </button>
                                    <button
                                        onClick={toggleEdit}
                                        className="px-6 py-2 bg-[#ff5733] hover:bg-[#e64a2e] text-white rounded-md transition-colors duration-200 flex items-center"
                                    >
                                        Edit Profile
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Profile Image with Username and Full Name */}
                    <div className="mb-12">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            <div className="w-full md:w-auto flex flex-col items-center">
                                <div
                                    className={`relative w-28 h-28 rounded-full overflow-hidden mb-4 ${
                                        isEditing
                                            ? "cursor-pointer relative"
                                            : ""
                                    }`}
                                    onClick={handleImageClick}
                                >
                                    <img
                                        src={
                                            isEditing
                                                ? editableProfile.profileImage
                                                    ? getImageUrl(
                                                          editableProfile.profileImage,
                                                      )
                                                    : profile.profileImage
                                                      ? getImageUrl(
                                                            profile.profileImage,
                                                        )
                                                      : getDefaultProfileImageUrl()
                                                : profile.profileImage
                                                  ? getImageUrl(
                                                        profile.profileImage,
                                                    )
                                                  : getDefaultProfileImageUrl()
                                        }
                                        alt="Profile picture"
                                        width={112}
                                        height={112}
                                        className="object-cover w-full h-full"
                                    />
                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity duration-200">
                                            <BaseText wrapper="span">
                                                Change
                                            </BaseText>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </div>

                                {/* Full Name and Username below profile image */}
                                <div className="w-full max-w-xs">
                                    {/* Full Name (non-editable) */}
                                    <div className="mb-4">
                                        <label className="block text-gray-400 mb-1">
                                            Full Name
                                        </label>
                                        <div className="px-4 py-2 bg-[#1a1625] text-white border border-gray-800 rounded-md">
                                            {profile.fullName}
                                        </div>
                                    </div>

                                    {/* Username (editable) */}
                                    <div className="mb-4">
                                        <label className="block text-gray-400 mb-1">
                                            Username
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="userName"
                                                value={editableProfile.userName}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 bg-[#2a2435] text-white border border-gray-700 rounded-md"
                                                placeholder="Username"
                                            />
                                        ) : (
                                            <div className="px-4 py-2 bg-[#1a1625] text-white border border-gray-800 rounded-md">
                                                @{profile.userName}
                                            </div>
                                        )}
                                        {usernameError && (
                                            <BaseText
                                                textColor="#ef4444"
                                                fontSize="small"
                                                className="mt-1"
                                            >
                                                {usernameError}
                                            </BaseText>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-gray-400 mb-2">
                                        Gender
                                    </label>
                                    {isEditing ? (
                                        <select
                                            name="gender"
                                            value={editableProfile.gender}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-md bg-[#2a2435] text-white border border-gray-700"
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">
                                                Female
                                            </option>
                                            <option value="Other">Other</option>
                                            {/* <option value="primary">primary</option> */}
                                        </select>
                                    ) : (
                                        <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800">
                                            {profile.gender || "Other"}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-400 mb-2">
                                        Email Address
                                    </label>
                                    <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800">
                                        {profile.email || "Not provided"}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-400 mb-2">
                                        Phone Number
                                    </label>
                                    <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800">
                                        {profile.phoneNumber || "Not provided"}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-400 mb-2">
                                        DOB
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            name="dob"
                                            value={editableProfile.dob}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-md bg-[#2a2435] text-white border border-gray-700"
                                        />
                                    ) : (
                                        <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800">
                                            {profile.dob
                                                ? new Date(
                                                      profile.dob,
                                                  ).toLocaleDateString(
                                                      "en-GB",
                                                      {
                                                          day: "2-digit",
                                                          month: "2-digit",
                                                          year: "numeric",
                                                      },
                                                  )
                                                : "Not provided"}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-400 mb-2">
                                        City
                                    </label>
                                    {isEditing ? (
                                        <select
                                            name="city"
                                            value={editableProfile.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-md bg-[#2a2435] text-white border border-gray-700"
                                        >
                                            {editableCities.map((city) => (
                                                <option key={city} value={city}>
                                                    {city}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800 flex justify-between items-center">
                                            {profile.city || "Not provided"}
                                            <svg
                                                className="w-5 h-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-400 mb-2">
                                        Country
                                    </label>
                                    {isEditing ? (
                                        <select
                                            name="country"
                                            value={editableProfile.country}
                                            onChange={(e) => {
                                                const newCountry =
                                                    e.target.value;
                                                setEditableProfile((prev) => {
                                                    const countryData =
                                                        countriesWithCities.find(
                                                            (c) =>
                                                                c.name ===
                                                                newCountry,
                                                        );
                                                    const defaultCity =
                                                        countryData &&
                                                        countryData.cities
                                                            .length > 0
                                                            ? countryData
                                                                  .cities[0]
                                                            : "";
                                                    return {
                                                        ...prev,
                                                        country: newCountry,
                                                        city: defaultCity,
                                                    };
                                                });
                                            }}
                                            className="w-full px-4 py-3 rounded-md bg-[#2a2435] text-white border border-gray-700"
                                        >
                                            {countries.map((country) => (
                                                <option
                                                    key={country}
                                                    value={country}
                                                >
                                                    {country}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="w-full px-4 py-3 rounded-md bg-[#1a1625] text-white border border-gray-800 flex justify-between items-center">
                                            {profile.country || "Not provided"}
                                            <svg
                                                className="w-5 h-5"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="6 9 12 15 18 9" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscriptions from File B */}
                    <hr className="border-gray-800 my-8" />
                    <div className="mb-12">
                        <BaseHeading
                            headingLevel="h2"
                            fontSize="large"
                            fontWeight={700}
                            textColor="#ffffff"
                            textAlign="left"
                            className="mb-8"
                        >
                            My Subscriptions
                        </BaseHeading>
                        {isSubscriptionsLoading ? (
                            <BaseText
                                wrapper="span"
                                fontSize="small"
                                textColor="#ffffff"
                            >
                                Loading subscriptions...
                            </BaseText>
                        ) : subscriptions.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                {subscriptions.map((subscription) => (
                                    <Link
                                        href={`/community/${subscription.artist_slug}`}
                                        key={subscription.artist_slug}
                                        className={`${styles["subscription"]}`}
                                    >
                                        <div
                                            className={`w-24 h-24 rounded-full overflow-hidden mb-2 ${styles.image}`}
                                        >
                                            <img
                                                src={
                                                    getImageUrl(
                                                        subscription.artist_profile_picture_url,
                                                    ) ||
                                                    getImageUrl(
                                                        subscription.artist_cover_photo_url,
                                                    ) ||
                                                    getImageUrl(
                                                        DEFAULT_PROFILE_IMAGE,
                                                    )
                                                }
                                                alt={
                                                    subscription.name ||
                                                    undefined
                                                }
                                                width={96}
                                                height={96}
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className={styles.text}>
                                            <BaseText
                                                wrapper="span"
                                                textColor="#ffffff"
                                                textAlign="center"
                                                fontSize="normal"
                                            >
                                                {subscription.name}
                                            </BaseText>
                                            <div
                                                className={styles.separator}
                                            ></div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <BaseText textColor="#9ca3af">
                                No subscriptions found.
                            </BaseText>
                        )}
                    </div>

                    {/* Spotify Integration from File B */}
                    <hr className="border-gray-800 my-8" />
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <BaseHeading
                                fontSize="large"
                                fontWeight={700}
                                textColor="#ffffff"
                                className="text-2xl font-bold text-white"
                            >
                                Link your{" "}
                                <BaseText wrapper="span" textColor="#1DB954">
                                    SPOTIFY
                                </BaseText>
                                !
                            </BaseHeading>
                        </div>
                        <button
                            onClick={syncSpotify}
                            className={`px-6 py-2 ${
                                profile.spotifyLinked
                                    ? "bg-[#1DB954]"
                                    : "bg-[#ff5733] hover:bg-[#e64a2e]"
                            } text-white rounded-md transition-colors duration-200`}
                            disabled={isLoading || profile.spotifyLinked}
                        >
                            {isLoading
                                ? "Connecting..."
                                : profile.spotifyLinked
                                  ? "Connected"
                                  : "Sync Now"}
                        </button>
                    </div>

                    {/* Delete Account */}
                    <hr className="border-gray-800 my-8" />
                    <div>
                        <BaseHeading fontSize="large" fontWeight={700} textColor="#ef4444" className="mb-2">
                            Danger Zone
                        </BaseHeading>
                        <BaseText textColor="#9ca3af" fontSize="small" className="mb-4">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </BaseText>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                        >
                            Delete My Account
                        </button>
                    </div>

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full mx-4 space-y-4">
                                <BaseHeading fontSize="normal" fontWeight={700} textColor="#ef4444">
                                    Are you sure?
                                </BaseHeading>
                                <BaseText textColor="#d1d5db" fontSize="small">
                                    This will permanently delete your account, preferences, reviews, comments, votes, and all associated data. This cannot be undone.
                                </BaseText>

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
                                        <BaseText textColor="#f87171" fontSize="small" fontWeight={600}>
                                            Type &quot;confirm delete&quot; below to proceed:
                                        </BaseText>
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
