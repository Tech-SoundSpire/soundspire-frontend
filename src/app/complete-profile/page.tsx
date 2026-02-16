"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import {
    getImageUrl,
    DEFAULT_PROFILE_IMAGE,
} from "@/utils/userProfileImageUtils";
import useCheckCompleteProfileOnRoute from "@/hooks/useCheckCompleteProfileOnRoute";
import useCheckPreferencesOnRoute from "@/hooks/useCheckPreferencesOnRoute";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import BaseText from "@/components/BaseText/BaseText";
import { sanitizeURL } from "@/utils/sanitizeURL";
import { City, Country, ICity, ICountry } from "country-state-city";
import { getPhoneLength } from "@/lib/countryPhoneLength";

interface FormData {
    full_name: string;
    gender: string;
    date_of_birth: string;
    city: string;
    country: string;
    country_code: string;
    phone_number: string;
    profile_picture_url?: string | null;
}

export default function CompleteProfilePage() {
    const { user, setUser, refreshUser, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { isProfileComplete, isLoading: profileLoading } =
        useCheckCompleteProfileOnRoute();
    const { hasPreferences, isLoading: preferencesLoading } =
        useCheckPreferencesOnRoute();

    const [form, setForm] = useState<FormData>({
        full_name: "",
        gender: "",
        date_of_birth: "",
        city: "",
        country: "",
        country_code: "",
        phone_number: "",
        profile_picture_url: null,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // Detect if this is an artist switching to fan mode (has some fields filled already)
    const isArtistSwitching = !!(user?.isAlsoArtist && user?.role === "user");

    // City search state
    const [cityQuery, setCityQuery] = useState("");
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const cityDropdownRef = useRef<HTMLDivElement>(null);

    // All cities (loaded once)
    const allCities = useMemo(() => City.getAllCities(), []);

    // Filtered cities based on search query
    const filteredCities = useMemo(() => {
        if (cityQuery.length < 2) return [];
        const q = cityQuery.toLowerCase();
        return allCities
            .filter((c) => c.name.toLowerCase().startsWith(q))
            .slice(0, 50);
    }, [cityQuery, allCities]);

    // Selected country info (derived from city selection)
    const selectedCountry: ICountry | undefined = useMemo(() => {
        if (!form.country_code) return undefined;
        return Country.getCountryByCode(form.country_code) || undefined;
    }, [form.country_code]);

    // Phone length for selected country
    const phoneLen = useMemo(
        () => (form.country_code ? getPhoneLength(form.country_code) : null),
        [form.country_code]
    );

    // Close city dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
                setShowCityDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        // Wait for all checks to complete
        if (authLoading || profileLoading || preferencesLoading) {
            return;
        }

        // If no user, redirect to login
        if (!user) {
            router.replace("/login");
            return;
        }

        // If artist, redirect to artist dashboard
        if (user.role === "artist") {
            router.replace("/artist/dashboard");
            return;
        }

        // If profile is already complete and has preferences, redirect to explore
        if (isProfileComplete && hasPreferences) {
            router.replace("/explore");
            return;
        }

        // If profile is complete but no preferences, redirect to preferences page
        if (isProfileComplete && !hasPreferences) {
            router.replace("/PreferenceSelectionPage");
            return;
        }

        // Otherwise, stay on this page (profile is incomplete)
    }, [
        authLoading,
        profileLoading,
        preferencesLoading,
        user,
        isProfileComplete,
        hasPreferences,
        router,
    ]);

    // Load user data for the form
    useEffect(() => {
        if (!user) {
            refreshUser();
            return;
        }
        // Pre-fill form from existing profile data (e.g. artist switching to fan)
        const loadExistingProfile = async () => {
            try {
                const res = await axios.get(`/api/profile?email=${encodeURIComponent(user.email)}`);
                const p = res.data;
                if (p) {
                    setForm((prev) => ({
                        ...prev,
                        full_name: p.full_name || prev.full_name,
                        gender: p.gender || prev.gender,
                        date_of_birth: p.date_of_birth || prev.date_of_birth,
                        city: p.city || prev.city,
                        country: p.country || prev.country,
                        phone_number: p.mobile_number?.replace(/^\+\d+-/, "") || prev.phone_number,
                        profile_picture_url: p.profile_picture_url || prev.profile_picture_url,
                    }));
                    if (p.city) setCityQuery(p.city);
                    // Try to derive country_code from country name
                    if (p.country) {
                        const allCountries = Country.getAllCountries();
                        const match = allCountries.find((c) => c.name === p.country);
                        if (match) {
                            setForm((prev) => ({ ...prev, country_code: match.isoCode }));
                        }
                    }
                }
            } catch {
                // ignore — form stays empty
            }
        };
        loadExistingProfile();
    }, [user, refreshUser]);

    // Validation functions
    const validateFullName = (name: string) =>
        /^[A-Za-z\s]+$/.test(name)
            ? ""
            : "Full name should contain only letters.";
    const validatePhoneNumber = (phone: string) => {
        if (!phone) return "Phone number is required.";
        if (!/^\d+$/.test(phone)) return "Phone number must contain only digits.";
        if (phoneLen) {
            if (phone.length < phoneLen.min || phone.length > phoneLen.max) {
                return phoneLen.min === phoneLen.max
                    ? `Phone number must be exactly ${phoneLen.min} digits for this country.`
                    : `Phone number must be ${phoneLen.min}-${phoneLen.max} digits for this country.`;
            }
        }
        return "";
    };
    const validateDOB = (dob: string) => {
        const birthDate = new Date(dob);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        return age >= 13 ? "" : "You must be at least 13 years old.";
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        let error = "";
        if (name === "full_name") error = validateFullName(value);
        if (name === "phone_number") error = validatePhoneNumber(value);
        if (name === "date_of_birth") error = validateDOB(value);

        setForm({ ...form, [name]: value });
        setErrors({ ...errors, [name]: error });
    };

    const handleCitySelect = (city: ICity) => {
        const country = Country.getCountryByCode(city.countryCode);
        setCityQuery(city.name);
        setForm({
            ...form,
            city: city.name,
            country: country?.name || "",
            country_code: city.countryCode,
            phone_number: "", // reset phone when country changes
        });
        setErrors({ ...errors, city: "", country: "", phone_number: "" });
        setShowCityDropdown(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB");
            return;
        }
        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
    };

    const uploadImageToS3 = async (): Promise<string | null> => {
        if (!selectedFile || !user?.email) return null;

        try {
            const extension = selectedFile.name.split(".").pop();
            const fileName = `images/users/${user.email.split("@")[0]}-${
                user.id || "unknown"
            }.${extension}`;

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

            return `s3://soundspirewebsiteassets/${fileName}`;
        } catch (error) {
            console.error(error);
            toast.error("Image upload failed");
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent submission if not authenticated
        if (!user) {
            toast.error("Please log in to continue");
            router.replace("/login");
            return;
        }

        const newErrors: Partial<Record<keyof FormData, string>> = {
            full_name: validateFullName(form.full_name),
            phone_number: validatePhoneNumber(form.phone_number),
            date_of_birth: validateDOB(form.date_of_birth),
            city: form.city ? "" : "Please select a city.",
            country: form.country ? "" : "Please select a city first.",
        };

        if (Object.values(newErrors).some((err) => err)) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            let profilePictureUrl = form.profile_picture_url;

            if (selectedFile) {
                const uploadedPath = await uploadImageToS3();
                if (uploadedPath) profilePictureUrl = uploadedPath;
            }

            const res = await axios.post("/api/users/complete-profile", {
                ...form,
                phone_number: selectedCountry
                    ? `+${selectedCountry.phonecode}-${form.phone_number}`
                    : form.phone_number,
                profile_picture_url: profilePictureUrl,
            });

            await refreshUser();
            toast.success("Profile completed successfully!");
            setTimeout(() => router.push("/PreferenceSelectionPage"), 2000);
        } catch (error: any) {
            console.error(error);
            toast.error(
                error.response?.data?.error || "Failed to complete profile"
            );
        } finally {
            setLoading(false);
        }
    };

    // Show loading screen while checking authentication
    if (authLoading || profileLoading || preferencesLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-400 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-white text-xl">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render form if user is not authenticated (will redirect)
    if (!user) {
        return null;
    }

    // Don't render form if user is an artist (will redirect)
    if (user.role === "artist") {
        return null;
    }

    // Don't render form if profile is already complete (will redirect)
    if (isProfileComplete) {
        return null;
    }
    const rawProfileImage =
        preview ||
        (form.profile_picture_url && getImageUrl(form.profile_picture_url)) ||
        getImageUrl(DEFAULT_PROFILE_IMAGE);
    const safeProfileImage = sanitizeURL(rawProfileImage);
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700 backdrop-blur-sm">
                <BaseHeading
                    fontSize="large"
                    fontWeight={700}
                    textAlign="center"
                    textColor="#fb923c"
                    className="mb-2"
                >
                    Complete Your Profile
                </BaseHeading>
                {isArtistSwitching && (
                    <p className="text-center text-gray-400 text-sm mb-6">
                        Just need your gender and date of birth to continue as a fan.
                    </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Picture Upload */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group">
                            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-600 border-3 border-orange-400 shadow-lg shadow-orange-400/20">
                                <img
                                    src={safeProfileImage}
                                    alt="Profile Preview"
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>
                        <BaseText
                            textColor="#9ca3af"
                            fontSize="small"
                            textAlign="center"
                            className="mt-3"
                        >
                            Click to upload profile picture
                            <br />
                            <BaseText
                                textColor="#6b7280"
                                fontSize="very small"
                                wrapper="span"
                            >
                                Max size: 5MB • JPG, PNG, GIF
                            </BaseText>
                        </BaseText>
                    </div>

                    {/* Full Name */}
                    <div>
                        <input
                            type="text"
                            name="full_name"
                            placeholder="Full Name"
                            value={form.full_name}
                            onChange={handleChange}
                            readOnly={isArtistSwitching && !!form.full_name}
                            className={`w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-gray-100 ${
                                isArtistSwitching && form.full_name ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                        />
                        {errors.full_name && (
                            <BaseText textColor="#f87171" fontSize="small">
                                {errors.full_name}
                            </BaseText>
                        )}
                    </div>

                    {/* Gender */}
                    <div>
                        <select
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-gray-100"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male" className="bg-gray-800">
                                Male
                            </option>
                            <option value="Female" className="bg-gray-800">
                                Female
                            </option>
                            <option value="Other" className="bg-gray-800">
                                Other
                            </option>
                        </select>
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={form.date_of_birth}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-gray-100"
                        />
                        {errors.date_of_birth && (
                            <BaseText textColor="#f87171" fontSize="small">
                                {errors.date_of_birth}
                            </BaseText>
                        )}
                    </div>

                    {/* City - searchable dropdown */}
                    <div ref={cityDropdownRef} className="relative">
                        <input
                            type="text"
                            placeholder="Search for your city..."
                            value={cityQuery}
                            onChange={(e) => {
                                if (isArtistSwitching && form.city) return;
                                setCityQuery(e.target.value);
                                setShowCityDropdown(true);
                                if (!e.target.value) {
                                    setForm({ ...form, city: "", country: "", country_code: "", phone_number: "" });
                                }
                            }}
                            onFocus={() => !(isArtistSwitching && form.city) && cityQuery.length >= 2 && setShowCityDropdown(true)}
                            readOnly={isArtistSwitching && !!form.city}
                            className={`w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-gray-100 ${
                                isArtistSwitching && form.city ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                        />
                        {showCityDropdown && filteredCities.length > 0 && (
                            <ul className="absolute z-50 w-full mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-600 bg-gray-800 shadow-lg">
                                {filteredCities.map((city, i) => {
                                    const country = Country.getCountryByCode(city.countryCode);
                                    return (
                                        <li
                                            key={`${city.name}-${city.stateCode}-${city.countryCode}-${i}`}
                                            onClick={() => handleCitySelect(city)}
                                            className="px-4 py-2 cursor-pointer hover:bg-gray-700 text-gray-100 text-sm"
                                        >
                                            {city.name}, {city.stateCode} — {country?.flag} {country?.name}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                        {errors.city && (
                            <BaseText textColor="#f87171" fontSize="small">
                                {errors.city}
                            </BaseText>
                        )}
                    </div>

                    {/* Country - auto-filled, read-only */}
                    <div>
                        <input
                            type="text"
                            placeholder="Country (auto-filled from city)"
                            value={selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : ""}
                            readOnly
                            className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/30 text-gray-400 cursor-not-allowed"
                        />
                        {errors.country && (
                            <BaseText textColor="#f87171" fontSize="small">
                                {errors.country}
                            </BaseText>
                        )}
                    </div>

                    {/* Phone Number with country code */}
                    <div>
                        <div className="flex gap-2">
                            <div className="w-24 flex-shrink-0">
                                <input
                                    type="text"
                                    value={selectedCountry ? `+${selectedCountry.phonecode}` : ""}
                                    readOnly
                                    placeholder="+__"
                                    className="w-full px-3 py-3 rounded-xl border border-gray-600 bg-gray-900/30 text-gray-400 text-center cursor-not-allowed"
                                />
                            </div>
                            <input
                                type="tel"
                                name="phone_number"
                                placeholder={
                                    phoneLen
                                        ? phoneLen.min === phoneLen.max
                                            ? `Phone (${phoneLen.min} digits)`
                                            : `Phone (${phoneLen.min}-${phoneLen.max} digits)`
                                        : "Select a city first"
                                }
                                value={form.phone_number}
                                onChange={handleChange}
                                disabled={!form.country_code}
                                readOnly={isArtistSwitching && !!form.phone_number}
                                className={`flex-1 px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-gray-100 disabled:bg-gray-900/30 disabled:text-gray-500 disabled:cursor-not-allowed ${
                                    isArtistSwitching && form.phone_number ? "opacity-60 cursor-not-allowed" : ""
                                }`}
                            />
                        </div>
                        {errors.phone_number && (
                            <BaseText textColor="#f87171" fontSize="small">
                                {errors.phone_number}
                            </BaseText>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-xl font-semibold"
                    >
                        {loading ? "Saving..." : "Save & Continue"}
                    </button>
                </form>
            </div>
        </div>
    );
}
