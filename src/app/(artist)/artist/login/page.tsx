"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import BaseText from "@/components/BaseText/BaseText";
import { getLogoUrl } from "@/utils/userProfileImageUtils";

const fields = [
    {
        label: "Email",
        name: "email",
        type: "email",
        placeholder: "Enter your email",
    },
    {
        label: "Password",
        name: "password",
        type: "password",
        placeholder: "Enter your password",
    },
];

export default function ArtistLoginPage() {
    const router = useRouter();
    const { user: authUser, isLoading: authLoading, refreshUser, logout } = useAuth();

    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    });

    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [loading, setLoading] = useState(false);

    // Redirect if already authenticated as artist
    useEffect(() => {
        if (!authLoading && authUser?.role === "artist") {
            router.push("/artist/dashboard");
        }
    }, [authUser, authLoading, router]);

    useEffect(() => {
        const allFilled = Object.values(credentials).every(
            (val) => val.trim().length > 0
        );
        setButtonDisabled(!allFilled);
    }, [credentials]);

    const handleLogin = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/login", {
                email: credentials.email,
                password_hash: credentials.password,
            });

            if (response.data.message === "Logged In Success") {
                toast.success("Login successful!");
                await refreshUser();
                
                // Check if user is actually an artist
                if (response.data.user?.role === "artist") {
                    router.push("/artist/dashboard");
                } else {
                    toast.error("This account is not registered as an artist.");
                    await logout();
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Login failed. Please check your credentials.";
                toast.error(message);
                console.error("Artist login failed:", error);
            } else {
                toast.error("An unexpected error occurred!");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !buttonDisabled && !loading) {
            handleLogin();
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-t from-gray-950 to-gray-900 text-white">
            {/* Left Side: Artist Branding */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#1a1625] via-[#2d2838] to-[#1a1625] p-8 flex-col justify-between relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="grid grid-cols-6 gap-2 transform rotate-12 scale-110">
                        {Array.from({ length: 36 }, (_, i) => (
                            <div
                                key={i}
                                className="w-12 h-12 rounded-lg"
                                style={{
                                    background: `linear-gradient(45deg, 
                                        hsl(${Math.random() * 360}, 70%, 60%), 
                                        hsl(${Math.random() * 360}, 70%, 40%))`,
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Logo */}
                <div className="relative z-10">
                    <img
                        src={getLogoUrl()}
                        alt="SoundSpire logo"
                        width={200}
                        height={200}
                        className="mb-4"
                    />
                </div>

                {/* Welcome Text */}
                <div className="mb-12 relative z-10">
                    <BaseHeading
                        className="bg-gradient-to-b from-orange-400 to-orange-600 bg-clip-text"
                        headingLevel="h1"
                        fontSize="heading"
                        fontWeight={700}
                        textColor="transparent"
                        fontName="arial"
                        textAlign="left"
                        fontStyle="italic"
                    >
                        Welcome Back, Artist
                    </BaseHeading>
                    <BaseHeading
                        className="bg-clip-text bg-gradient-to-t from-gray-400 to-gray-50"
                        fontWeight={300}
                        headingLevel="h2"
                        fontSize="sub heading"
                        textColor="transparent"
                        textAlign="left"
                        fontStyle="italic"
                        style={{ lineHeight: 1.1 }}
                        fontName="arial"
                    >
                        Your Stage<br />
                        Your Voice<br />
                        Your Community
                    </BaseHeading>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white text-black">
                <div className="w-full max-w-md space-y-6">
                    {/* Back Button */}
                    <Link
                        href="/artist-onboarding"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[#FA6400] transition-colors duration-200"
                    >
                        <FaArrowLeft />
                        <BaseText fontSize="small">Back to Onboarding</BaseText>
                    </Link>

                    {/* Page Title */}
                    <div className="text-center mb-8">
                        <BaseHeading
                            fontWeight={700}
                            fontSize="large"
                            headingLevel="h2"
                            textColor="#111827"
                            textAlign="center"
                        >
                            {loading ? "Logging you in..." : "Artist Login"}
                        </BaseHeading>

                        <BaseText
                            className="mt-2"
                            textColor="#4b5563"
                            fontSize="small"
                            textAlign="center"
                        >
                            Access your artist dashboard
                        </BaseText>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {fields.map(({ label, name, type, placeholder }) => (
                            <div key={name} className="space-y-1">
                                <label
                                    htmlFor={name}
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    {label}
                                </label>
                                <input
                                    id={name}
                                    type={type}
                                    value={credentials[name as keyof typeof credentials]}
                                    placeholder={placeholder}
                                    onChange={(e) =>
                                        setCredentials((prev) => ({
                                            ...prev,
                                            [name]: e.target.value,
                                        }))
                                    }
                                    onKeyPress={handleKeyPress}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FA6400] focus:border-transparent transition-all duration-200"
                                />
                            </div>
                        ))}

                        {/* Forgot Password Link */}
                        <div className="flex justify-start pl-1">
                            <Link
                                href="/forgot-password"
                                className="text-sm text-[#FA6400] hover:text-[#e55a00] hover:underline transition-colors duration-200"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        onClick={handleLogin}
                        disabled={buttonDisabled || loading}
                        className="w-full py-3 px-4 bg-[#FA6400] hover:bg-[#e55a00] disabled:bg-orange-300 text-white font-semibold rounded-lg transition-colors duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#FA6400] focus:ring-offset-2"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <BaseText
                                wrapper="span"
                                textColor="#6b7280"
                                className="px-4 bg-white"
                                fontSize="very small"
                            >
                                New Artist?
                            </BaseText>
                        </div>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center">
                        <BaseText
                            fontSize="small"
                            textColor="#4b5563"
                            textAlign="center"
                        >
                            <Link
                                href="/artist-onboarding"
                                className="text-[#FA6400] hover:text-[#e55a00] font-medium hover:underline transition-colors duration-200"
                            >
                                Create your artist profile
                            </Link>
                        </BaseText>
                    </div>
                </div>
            </div>
        </div>
    );
}