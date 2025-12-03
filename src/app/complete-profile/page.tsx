"use client";

import React, { useState, useRef, useEffect } from "react";
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

interface FormData {
    full_name: string;
    gender: string;
    date_of_birth: string;
    city: string;
    country: string;
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
        phone_number: "",
        profile_picture_url: null,
    });

    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

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
        }
    }, [user, refreshUser]);

    // Validation functions
    const validateFullName = (name: string) =>
        /^[A-Za-z\s]+$/.test(name)
            ? ""
            : "Full name should contain only letters.";
    const validatePhoneNumber = (phone: string) =>
        /^\d{10}$/.test(phone) ? "" : "Phone number must be exactly 10 digits.";
    const validateDOB = (dob: string) => {
        const birthDate = new Date(dob);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        return age >= 13 ? "" : "You must be at least 13 years old.";
    };
    const validateText = (value: string, field: string) =>
        /^[A-Za-z\s]+$/.test(value)
            ? ""
            : `${field} should contain only letters.`;

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        let error = "";
        if (name === "full_name") error = validateFullName(value);
        if (name === "phone_number") error = validatePhoneNumber(value);
        if (name === "date_of_birth") error = validateDOB(value);
        if (name === "city") error = validateText(value, "City");
        if (name === "country") error = validateText(value, "Country");

        setForm({ ...form, [name]: value });
        setErrors({ ...errors, [name]: error });
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

        const newErrors: Partial<FormData> = {
            full_name: validateFullName(form.full_name),
            phone_number: validatePhoneNumber(form.phone_number),
            date_of_birth: validateDOB(form.date_of_birth),
            city: validateText(form.city, "City"),
            country: validateText(form.country, "Country"),
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
                profile_picture_url: profilePictureUrl,
            });

            setUser(res.data.user);
            toast.success("Profile completed successfully!");
            router.push("/PreferenceSelectionPage");
        } catch (error: any) {
            console.error(error);
            toast.error(
                error.response?.data?.error || "Failed to complete profile"
            );
        } finally {
            setLoading(false);
        }
    };
    const rawProfileImage =
        preview ||
        form.profile_picture_url ||
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
                    className="mb-8"
                >
                    Complete Your Profile
                </BaseHeading>
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
                            className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-gray-100"
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

                    {/* City */}
                    <div>
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={form.city}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-gray-100"
                        />
                        {errors.city && (
                            <BaseText textColor="#f87171" fontSize="small">
                                {errors.city}
                            </BaseText>
                        )}
                    </div>

                    {/* Country */}
                    <div>
                        <input
                            type="text"
                            name="country"
                            placeholder="Country"
                            value={form.country}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-gray-100"
                        />
                        {errors.country && (
                            <BaseText textColor="#f87171" fontSize="small">
                                {errors.country}
                            </BaseText>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <input
                            type="tel"
                            name="phone_number"
                            placeholder="Phone Number"
                            value={form.phone_number}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900/50 text-gray-100"
                        />
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
