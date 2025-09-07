"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { countriesWithCities } from "@/lib/locationData";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import {
    getImageUrl,
    getDefaultProfileImageUrl,
} from "@/utils/userProfileImageUtils";

interface ProfileData {
    full_name: string;
    gender: string;
    mobile_number: string;
    date_of_birth: string;
    city: string;
    country: string;
    profile_picture_url: string | null;
}

export default function CompleteProfilePage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const defaultCountry = "India";
    const defaultCities =
        countriesWithCities.find((c) => c.name === defaultCountry)?.cities || [];
    const defaultCity = defaultCities.length > 0 ? defaultCities[0] : "";

    const [profile, setProfile] = useState<ProfileData>({
        full_name: "",
        gender: "",
        mobile_number: "",
        date_of_birth: "",
        city: defaultCity,
        country: defaultCountry,
        profile_picture_url: null,
    });

    const [loading, setLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    const fetchProfile = async () => {
        if (!user?.email) return;
        try {
            setIsFetching(true);
            const res = await fetch(
                `/api/profile?email=${encodeURIComponent(user.email)}`
            );
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            const profileComplete =
                data.gender &&
                data.mobile_number &&
                data.date_of_birth &&
                data.city &&
                data.country;

            if (!profileComplete) {
                setProfile({
                    full_name: data.full_name || user?.name || "",
                    gender: data.gender || "",
                    mobile_number: data.mobile_number || "",
                    date_of_birth: data.date_of_birth
                        ? new Date(data.date_of_birth).toISOString().split("T")[0]
                        : "",
                    city: data.city || defaultCity,
                    country: data.country || defaultCountry,
                    profile_picture_url: data.profile_picture_url || null,
                });
            } else {
                const prefRes = await fetch(`/api/preferences/check?userId=${user.id}`);
                const { hasPreferences } = await prefRes.json();

                if (!hasPreferences) {
                    router.push("/PreferenceSelectionPage");
                } else {
                    router.push("/explore");
                }
            }
        } catch (err) {
            toast.error("Failed to load profile data");
            console.error(err);
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    const validateProfile = () => {
        if (
            !profile.full_name ||
            !profile.gender ||
            !profile.mobile_number ||
            !profile.date_of_birth ||
            !profile.country ||
            !profile.city
        ) {
            toast.error("All fields are required");
            return false;
        }
        if (!/^\d{10}$/.test(profile.mobile_number)) {
            toast.error("Mobile number must be exactly 10 digits");
            return false;
        }
        return true;
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const saveProfile = async () => {
        if (!validateProfile()) return;

        try {
            setLoading(true);

            let uploadedImagePath = profile.profile_picture_url;

            // upload file if selected
            if (selectedFile && user?.email) {
                const extension = selectedFile.name.split(".").pop();
                const fileName = `${user.email.split("@")[0]
                    }-${user.id || "unknown"}.${extension}`;

                const res = await fetch("/api/upload", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fileName, fileType: selectedFile.type }),
                });
                if (!res.ok) throw new Error("Failed to get upload URL");

                const { uploadUrl } = await res.json();

                const uploadRes = await fetch(uploadUrl, {
                    method: "PUT",
                    headers: { "Content-Type": selectedFile.type },
                    body: selectedFile,
                });
                if (!uploadRes.ok) throw new Error("Failed to upload image");

                uploadedImagePath = `s3://soundspirewebsiteassets/images/users/${fileName}`;
            }

            const emailToUse = user?.email || "";
            const fullNameToUse =
                user?.name || user?.email?.split("@")[0] || "User";
            const usernameToUse =
                user?.email?.split("@")[0]?.toLowerCase() || "user";

            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: emailToUse,
                    full_name: profile.full_name || fullNameToUse,
                    username: usernameToUse,
                    gender: profile.gender,
                    mobile_number: profile.mobile_number,
                    date_of_birth: profile.date_of_birth,
                    city: profile.city,
                    country: profile.country,
                    profile_picture_url: uploadedImagePath,
                    spotify_linked: false,
                }),
            })

            if (!res.ok) throw new Error("Failed to update profile");

            toast.success("Profile updated!");
            router.push("/explore");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || isFetching) {
        return (
            <div className="bg-[#120B1A] text-white min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) return null;

    const countries = countriesWithCities.map((c) => c.name);
    const availableCities =
        countriesWithCities.find((c) => c.name === profile.country)?.cities || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#120B1A] via-[#1b0f27] to-[#24123a] flex items-center justify-center p-6 text-white">
            <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-10 space-y-8 border border-white/10">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-extrabold">Complete Your Profile</h1>
                </div>

                {/* Profile Image */}
                <div className="flex justify-center">
                    <div
                        className="relative w-28 h-28 rounded-full overflow-hidden cursor-pointer"
                        onClick={handleImageClick}
                    >
                        <Image
                            src={
                                previewUrl
                                    ? previewUrl
                                    : profile.profile_picture_url
                                        ? getImageUrl(profile.profile_picture_url)
                                        : getDefaultProfileImageUrl()
                            }
                            alt="Profile"
                            width={112}
                            height={112}
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity duration-200">
                            <span>Change</span>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                        <label className="block mb-2 text-sm font-semibold">Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={profile.full_name}
                            onChange={(e) =>
                                setProfile((p) => ({ ...p, full_name: e.target.value }))
                            }
                            className="w-full px-4 py-3 rounded-md bg-[#2a2435] text-white border border-gray-700 
    placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                    </div>
                    {/* Gender */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold">Gender</label>
                        <div className="w-full py-3 rounded-md bg-[#2a2435] border border-gray-700 flex justify-between items-center">
                            <select
                                value={profile.gender}
                                onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}
                                className="appearance-none bg-transparent outline-none w-full text-white text-sm px-4"
                            >
                                <option value="" className="bg-[#2a2435] text-white">Select</option>
                                <option value="Male" className="bg-[#2a2435] text-white">Male</option>
                                <option value="Female" className="bg-[#2a2435] text-white">Female</option>
                                <option value="Other" className="bg-[#2a2435] text-white">Other</option>
                            </select>
                            <svg
                                className="w-5 h-5 ml-2 text-gray-400 pointer-events-none"
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
                    </div>

                    {/* Mobile */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold">Mobile Number</label>
                        <input
                            type="text"
                            placeholder="10-digit number"
                            value={profile.mobile_number}
                            onChange={(e) => setProfile((p) => ({ ...p, mobile_number: e.target.value }))}
                            maxLength={10}
                            className="w-full px-4 py-3 rounded-md bg-[#2a2435] text-white border border-gray-700 
                 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                    </div>

                    {/* DOB */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold">Date of Birth</label>
                        <input
                            type="date"
                            value={profile.date_of_birth}
                            onChange={(e) => setProfile((p) => ({ ...p, date_of_birth: e.target.value }))}
                            className="w-full px-4 py-3 rounded-md bg-[#2a2435] text-white border border-gray-700 
                 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                    </div>

                    {/* Country */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold">Country</label>
                        <div className="w-full py-3 rounded-md bg-[#2a2435] border border-gray-700 flex justify-between items-center">
                            <select
                                value={profile.country}
                                onChange={(e) => {
                                    const selectedCountry = e.target.value;
                                    const cities =
                                        countriesWithCities.find((c) => c.name === selectedCountry)?.cities || [];
                                    const firstCity = cities.length > 0 ? cities[0] : "";
                                    setProfile((p) => ({ ...p, country: selectedCountry, city: firstCity }));
                                }}
                                className="appearance-none px-4 bg-transparent outline-none w-full text-white"
                            >
                                {countries.map((c) => (
                                    <option key={c} value={c} className="bg-[#2a2435] text-white">
                                        {c}
                                    </option>
                                ))}
                            </select>
                            <svg
                                className="w-5 h-5 ml-2 text-gray-400 pointer-events-none"
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
                    </div>

                    {/* City */}
                    <div className="sm:col-span-2">
                        <label className="block mb-2 text-sm font-semibold">City</label>
                        <div className="w-full py-3 rounded-md bg-[#2a2435] border border-gray-700 flex justify-between items-center">
                            <select
                                value={profile.city}
                                onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                                className="appearance-none px-4 bg-transparent outline-none w-full text-white"
                            >
                                {availableCities.map((city) => (
                                    <option key={city} value={city} className="bg-[#2a2435] text-white">
                                        {city}
                                    </option>
                                ))}
                            </select>
                            <svg
                                className="w-5 h-5 ml-2 text-gray-400 pointer-events-none"
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
                    </div>
                </div>

                {/* CTA Button */}
                <div className="flex justify-center">
                    <button
                        onClick={saveProfile}
                        disabled={loading}
                        className="bg-orange-500 hover:bg-orange-600 font-bold py-3 px-8 rounded-xl shadow-lg flex items-center gap-2 
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                        ) : (
                            <>
                                Save & Continue <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
