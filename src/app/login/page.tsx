"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import useRedirectIfAuthenticated from "@/hooks/useRedirectIfAuthenticated";
import { FaGoogle } from "react-icons/fa";
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
        name: "password_hash",
        type: "password",
        placeholder: "Enter your password",
    },
];

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPageInner />
        </Suspense>
    );
}

function LoginPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshUser } = useAuth();

    useRedirectIfAuthenticated(); //Session checker hook

    const [user, setUser] = useState({
        email: "",
        password_hash: "",
    });

    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const onLogin = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/login", user);

            if (response.data.message === "Logged In Success") {
                toast.success("Login successful!");

                await refreshUser();
                // router.replace(response.data.redirect || "/feed");
                // Redirect based on preferences
                // const redirectPath =
                //   response.data.user?.role === "artist"
                //     ? "/artist/dashboard"
                //     : response.data.redirect || "/PreferenceSelectionPage";

                // router.replace(redirectPath);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Something went wrong during login.";
                toast.error(message);
                console.error("Login failed:", error);
            } else {
                toast.error("unexpected error occured!");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const info = searchParams.get("info");
        if (info === "account_exists") {
            toast("This email is already registered. Please login!", {
                icon: "🔒",
                style: {
                    borderRadius: "8px",
                    background: "#333",
                    color: "#fff",
                },
            });
            // Remove the query param after showing message
            const params = new URLSearchParams(window.location.search);
            params.delete("info");
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            router.replace(newUrl);
        }
    }, [searchParams, router]);

    useEffect(() => {
        const allFilled = Object.values(user).every(
            (val) => val.trim().length > 0
        );
        setButtonDisabled(!allFilled);
    }, [user]);

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            console.log("Google login clicked");
            window.location.href = "/api/auth/google";
        } catch (error) {
            console.error("Google login failed:", error);
            toast.error("Google login failed");
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-t from-gray-950 to-gray-900 text-white">
            {/* Left Side: Branding & Welcome */}
            <div className="hidden md:flex w-1/2 bg-gradient-to-bt from-[#0f0c29] via-[#302b63] to-[#24243e] p-8 flex-col justify-between">
                {/* Logo at Top */}
                <Link href="/">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={getLogoUrl()}
                        alt="SoundSpire logo"
                        width={200}
                        height={200}
                        className="mb-4 cursor-pointer"
                    />
                </Link>

                {/* Welcome Text at Bottom */}
                <div className="mb-12">
                    <BaseHeading
                        className="bg-gradient-to-b from-orange-500 to-orange-700 bg-clip-text"
                        headingLevel="h1"
                        fontSize="heading"
                        fontWeight={600}
                        textColor="transparent"
                        fontName="arial"
                        textAlign="left"
                        fontStyle="italic"
                    >
                        Welcome Back
                    </BaseHeading>
                    <BaseHeading
                        className="bg-clip-text bg-gradient-to-t from-gray-400 to-gray-50 "
                        fontWeight={300}
                        headingLevel="h2"
                        fontSize="sub heading"
                        textColor="transparent"
                        textAlign="left"
                        fontStyle="italic"
                        style={{ lineHeight: 1.1 }}
                        fontName="arial"
                    >
                        Your Vibe, <br></br>
                        Your Beats, <br></br>
                        Your World Awaits.
                    </BaseHeading>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white text-black">
                <div className="w-full max-w-md space-y-6">
                    {/* Page Title */}
                    <div className="text-center mb-8">
                        <BaseHeading
                            fontWeight={700}
                            fontSize="large"
                            headingLevel="h2"
                            textColor="#111827"
                            textAlign="center"
                        >
                            {loading ? "Logging you in..." : "Login"}
                        </BaseHeading>

                        <BaseText
                            className="mt-2"
                            textColor="#4b5563"
                            fontSize="small"
                            textAlign="center"
                        >
                            Welcome back to SoundSpire
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
                                    value={user[name as keyof typeof user]}
                                    placeholder={placeholder}
                                    onChange={(e) =>
                                        setUser((prev) => ({
                                            ...prev,
                                            [name]: e.target.value,
                                        }))
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !buttonDisabled && !loading) {
                                            onLogin();
                                        }
                                    }}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                />
                            </div>
                        ))}

                        {/* Forgot Password Link */}
                        <div className="flex justify-start pl-1">
                            <Link
                                href="/forgot-password"
                                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        onClick={onLogin}
                        disabled={buttonDisabled || loading}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                                or continue with
                            </BaseText>
                        </div>
                    </div>

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold rounded-lg transition-colors duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
                    >
                        <FaGoogle className="w-5 h-5" />
                        <BaseText wrapper="span" fontName="arial">
                            {googleLoading
                                ? "Signing in with Google..."
                                : "Continue with Google"}
                        </BaseText>
                    </button>

                    {/* Sign Up Link */}
                    <div className="text-center pt-4">
                        <BaseText
                            fontSize="very small"
                            textColor="#4b5563"
                            textAlign="center"
                        >
                            Don&apos;t have an account yet?{" "}
                            <Link
                                href="/"
                                className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors duration-200"
                            >
                                Sign up
                            </Link>
                        </BaseText>
                    </div>
                </div>
            </div>
        </div>
    );
}
