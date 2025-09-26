"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { getImageUrl, DEFAULT_PROFILE_IMAGE } from "@/utils/userProfileImageUtils";

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
  const { user, setUser, refreshUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!user) {
      refreshUser();
    }
  }, [user, refreshUser]);

  // Validation functions
  const validateFullName = (name: string) =>
    /^[A-Za-z\s]+$/.test(name) ? "" : "Full name should contain only letters.";
  const validatePhoneNumber = (phone: string) =>
    /^\+?[1-9]\d{9,14}$/.test(phone) ? "" : "Phone number must be valid.";
  const validateDOB = (dob: string) => {
    const birthDate = new Date(dob);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    return age >= 13 ? "" : "You must be at least 13 years old.";
  };
  const validateText = (value: string, field: string) =>
    /^[A-Za-z\s]+$/.test(value) ? "" : `${field} should contain only letters.`;

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
      const fileName = `${user.email.split("@")[0]}-${user.id || "unknown"}.${extension}`;

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

      return `s3://soundspirewebsiteassets/images/users/${fileName}`;
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
      toast.error(error.response?.data?.error || "Failed to complete profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-center text-orange-400 mb-8">
          Complete Your Profile
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-gray-700 to-gray-600 border-3 border-orange-400 shadow-lg shadow-orange-400/20">
                <img
                  src={preview || form.profile_picture_url || getImageUrl(DEFAULT_PROFILE_IMAGE)}
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
            <p className="text-gray-400 text-sm mt-3 text-center">
              Click to upload profile picture<br />
              <span className="text-xs text-gray-500">Max size: 5MB • JPG, PNG, GIF</span>
            </p>
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
            {errors.full_name && <p className="text-red-400 text-sm">{errors.full_name}</p>}
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
              <option value="Male" className="bg-gray-800">Male</option>
              <option value="Female" className="bg-gray-800">Female</option>
              <option value="Other" className="bg-gray-800">Other</option>
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
            {errors.date_of_birth && <p className="text-red-400 text-sm">{errors.date_of_birth}</p>}
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
            {errors.city && <p className="text-red-400 text-sm">{errors.city}</p>}
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
            {errors.country && <p className="text-red-400 text-sm">{errors.country}</p>}
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
            {errors.phone_number && <p className="text-red-400 text-sm">{errors.phone_number}</p>}
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
