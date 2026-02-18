"use client";

import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useCheckCompleteProfileOnRoute from "@/hooks/useCheckCompleteProfileOnRoute";
import useCheckPreferencesOnRoute from "@/hooks/useCheckPreferencesOnRoute";
import { useAuth } from "@/context/AuthContext";
import { getLogoUrl } from "@/utils/userProfileImageUtils";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import BaseText from "@/components/BaseText/BaseText";

const fields = [
    {
        label: "Username*",
        name: "username",
        type: "text",
        placeholder: "Choose a username",
    },
    {
        label: "Email*",
        name: "email",
        type: "email",
        placeholder: "Enter your email",
    },
    {
        label: "Password*",
        name: "password_hash",
        type: "password",
        placeholder: "Create a password",
    },
    {
        label: "Confirm Password*",
        name: "confirm_password",
        type: "password",
        placeholder: "Confirm your password",
    },
];

export default function SignupPage() {
    const router = useRouter();
    const { user: authUser, isLoading: authLoading } = useAuth();
    const { isProfileComplete, isLoading: profileLoading } =
        useCheckCompleteProfileOnRoute();
    const { hasPreferences, isLoading: preferencesLoading } =
        useCheckPreferencesOnRoute();

    const [user, setUser] = useState({
        username: "",
        email: "",
        password_hash: "",
        confirm_password: "",
    });

    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string[] }>({});

    useEffect(() => {
        if (authLoading || profileLoading || preferencesLoading) return;

        if (!authUser) return;

        const shouldWaitForData =
            !isProfileComplete &&
            !hasPreferences &&
            profileLoading === false &&
            preferencesLoading === false;

        if (shouldWaitForData) {
            console.log(
                "Waiting for final values from profile/preferences APIs..."
            );
            return;
        }

        if (authUser.role === "artist") {
            router.push("/artist/dashboard");
            return;
        }

        if (isProfileComplete && hasPreferences) {
            router.push("/explore");
            return;
        }

        if (!isProfileComplete) {
            router.push("/complete-profile");
            return;
        }

        if (isProfileComplete && !hasPreferences) {
            router.push("/PreferenceSelectionPage");
            return;
        }
    }, [
        authUser,
        authLoading,
        profileLoading,
        preferencesLoading,
        isProfileComplete,
        hasPreferences,
        router,
    ]);

    const validateForm = () => {
        const errors: { [key: string]: string[] } = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (user.username.trim().length < 3) {
            errors.username = ["Username must be at least 3 characters"];
        }

        if (!emailRegex.test(user.email)) {
            errors.email = ["Invalid email format"];
        }

        const passwordErrors: string[] = [];
        if (user.password_hash.length < 8) {
            passwordErrors.push("Must include at least 8 characters long.");
        }
        if (!/(?=.*[a-z])/.test(user.password_hash)) {
            passwordErrors.push("Must include atleast one lowercase letter");
        }
        if (!/(?=.*[A-Z])/.test(user.password_hash)) {
            passwordErrors.push("Must include atleast one uppercase letter");
        }
        if (!/(?=.*\d)/.test(user.password_hash)) {
            passwordErrors.push("Must include atleast one number letter");
        }
        if (!/(?=.*[@$!%*?&])/.test(user.password_hash)) {
            passwordErrors.push("Must include atleast one special character like #,@,$,&.");
        }
        if (passwordErrors.length > 0) {
            errors.password_hash = passwordErrors;
        }

        if (user.password_hash !== user.confirm_password) {
            errors.confirm_password = ["Passwords do not match"];
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const onSignup = async () => {
        if (!validateForm()) {
            toast.error("Please fix the errors in the form.");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("/api/users/signup", {
                username: user.username,
                email: user.email,
                password_hash: user.password_hash,
            });

            if (response.data.success) {
                toast.success("Verification email sent! Please check your inbox and verify your email before logging in.");
                setUser({
                    username: "",
                    email: "",
                    password_hash: "",
                    confirm_password: "",
                });
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error.response?.data?.error || "Signup failed. Try again!"
                );
                const redirectPath = error.response?.data?.redirect;
                if (redirectPath) window.location.href = redirectPath;
            } else {
                toast.error("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            window.location.href = "/api/auth/google";
        } catch (error) {
            console.error("Google login failed:", error);
            toast.error("Google login failed");
        } finally {
            setIsGoogleLoading(false);
        }
    };

    useEffect(() => {
        const allFilled = Object.values(user).every(
            (val) => String(val).trim().length > 0
        );
        setButtonDisabled(!allFilled);
    }, [user]);

    return (
        <div className="min-h-screen flex bg-gradient-to-t from-gray-950 to-gray-900 text-white relative">
            {/* ✅ For Artists Button Added */}
            <div className="absolute top-4 right-4 z-10">
                <Link
                    href="/artist-onboarding"
                    className="px-6 py-2 bg-[#FA6400] hover:bg-[#e55a00] text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
                >
                    For Artists
                </Link>
            </div>

            {/* Left Side */}
            <div className="hidden md:flex w-1/2 p-8 flex-col justify-between" style={{ background: "linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 30%, #1a0a2e 70%, #0a0612 100%)" }}>
                <div>
                    <img
                        src={getLogoUrl()}
                        alt="SoundSpire logo"
                        width={200}
                        height={200}
                        className="mb-4"
                    />
                </div>
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

            {/* Right Side: Signup Form */}
            <div className="bg-white text-black flex flex-col justify-center items-center w-full md:w-1/2 p-8">
                <div className="w-full max-w-md space-y-4">
                    <BaseHeading
                        headingLevel="h2"
                        fontSize="large"
                        className="mb-4 self-start"
                        textColor="black"
                        textAlign="left"
                        fontName="montserrat"
                    >
                        {loading ? "Processing..." : "Sign Up"}
                    </BaseHeading>

                    {fields.map((field) => (
                        <div key={field.name} className="flex flex-col">
                            <label
                                htmlFor={field.name}
                                className="mb-1 text-sm font-medium"
                            >
                                {field.label}
                            </label>
                            <input
                                id={field.name}
                                type={field.type}
                                value={user[field.name as keyof typeof user]}
                                placeholder={field.placeholder}
                                onChange={(e) => {
                                    setUser((prev) => ({
                                        ...prev,
                                        [field.name]: e.target.value,
                                    }));
                                    // Clear errors for this field
                                    setFormErrors((prev) => ({
                                        ...prev,
                                        [field.name]: [],
                                    }));
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !buttonDisabled && !loading) {
                                        onSignup();
                                    }
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FF4E27]"
                                style={{ borderRadius: "8px" }}
                            />
                            {formErrors[field.name] && formErrors[field.name].length > 0 && (
                                <div className="mt-1">
                                    {formErrors[field.name].map((error, index) => (
                                        <div key={index} className="flex items-center">
                                            <span className="mr-2">
                                                {/* <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg> */}
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0,0,256,256">
                                                    <g
                                                        fill="#dc0000"
                                                        fillRule="nonzero"
                                                        stroke="none"
                                                        strokeWidth="1"
                                                        strokeLinecap="butt"
                                                        strokeLinejoin="miter"
                                                        strokeMiterlimit="10"
                                                        strokeDasharray=""
                                                        strokeDashoffset="0"
                                                        fontFamily="none"
                                                        fontWeight="none"
                                                        fontSize="none"
                                                        className="mix-blend-normal"
                                                    ><g transform="scale(5.33333,5.33333)"><path d="M24,4c-11.02793,0 -20,8.97207 -20,20c0,11.02793 8.97207,20 20,20c11.02793,0 20,-8.97207 20,-20c0,-11.02793 -8.97207,-20 -20,-20zM24,7c9.40662,0 17,7.59339 17,17c0,9.40661 -7.59338,17 -17,17c-9.40661,0 -17,-7.59339 -17,-17c0,-9.40661 7.59339,-17 17,-17zM30.48633,15.97852c-0.39614,0.00935 -0.77249,0.17506 -1.04687,0.46094l-5.43945,5.43945l-5.43945,-5.43945c-0.28248,-0.2909 -0.67069,-0.45506 -1.07617,-0.45508c-0.61065,0.00015 -1.16026,0.37042 -1.38978,0.93629c-0.22952,0.56587 -0.09314,1.21439 0.34486,1.63988l5.43945,5.43945l-5.43945,5.43945c-0.39185,0.37623 -0.54969,0.9349 -0.41265,1.46055c0.13704,0.52565 0.54754,0.93616 1.07319,1.07319c0.52565,0.13704 1.08432,-0.0208 1.46055,-0.41265l5.43945,-5.43945l5.43945,5.43945c0.37623,0.39185 0.9349,0.54969 1.46055,0.41265c0.52565,-0.13704 0.93616,-0.54754 1.07319,-1.07319c0.13704,-0.52565 -0.0208,-1.08432 -0.41265,-1.46055l-5.43945,-5.43945l5.43945,-5.43945c0.44646,-0.42851 0.58398,-1.08719 0.34628,-1.65854c-0.2377,-0.57135 -0.80184,-0.93811 -1.4205,-0.92349z"></path></g></g>
                                                </svg>
                                                {/* <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0,0,256,256">
                                                    <g fill="#dc0000" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.33333,5.33333)"><path d="M24,4c-11.02793,0 -20,8.97207 -20,20c0,11.02793 8.97207,20 20,20c11.02793,0 20,-8.97207 20,-20c0,-11.02793 -8.97207,-20 -20,-20zM24,7c9.40662,0 17,7.59339 17,17c0,9.40661 -7.59338,17 -17,17c-9.40661,0 -17,-7.59339 -17,-17c0,-9.40661 7.59339,-17 17,-17zM30.48633,15.97852c-0.39614,0.00935 -0.77249,0.17506 -1.04687,0.46094l-5.43945,5.43945l-5.43945,-5.43945c-0.28248,-0.2909 -0.67069,-0.45506 -1.07617,-0.45508c-0.61065,0.00015 -1.16026,0.37042 -1.38978,0.93629c-0.22952,0.56587 -0.09314,1.21439 0.34486,1.63988l5.43945,5.43945l-5.43945,5.43945c-0.39185,0.37623 -0.54969,0.9349 -0.41265,1.46055c0.13704,0.52565 0.54754,0.93616 1.07319,1.07319c0.52565,0.13704 1.08432,-0.0208 1.46055,-0.41265l5.43945,-5.43945l5.43945,5.43945c0.37623,0.39185 0.9349,0.54969 1.46055,0.41265c0.52565,-0.13704 0.93616,-0.54754 1.07319,-1.07319c0.13704,-0.52565 -0.0208,-1.08432 -0.41265,-1.46055l-5.43945,-5.43945l5.43945,-5.43945c0.44646,-0.42851 0.58398,-1.08719 0.34628,-1.65854c-0.2377,-0.57135 -0.80184,-0.93811 -1.4205,-0.92349z"></path></g></g>
                                                </svg> */}
                                            </span>
                                            <BaseText

                                                textColor="#ef4444"
                                                fontSize="small"
                                                className="block"
                                            >
                                                {error}
                                            </BaseText>
                                        </div>

                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={onSignup}
                        disabled={buttonDisabled || loading}
                        className="w-full py-3 my-2 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                        style={{ backgroundColor: "#FF4E27", borderRadius: "8px" }}
                    >
                        {loading ? "Signing Up..." : "Sign Up  →"}
                    </button>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={isGoogleLoading}
                        className="w-full py-3 flex justify-center items-center bg-gray-900 hover:bg-gray-800 border-2 border-[#FF4E27] rounded-lg text-white font-semibold transition"
                        style={{ borderRadius: "8px" }}
                    >
                        <FcGoogle className="mr-2 w-5 h-5" />
                        {isGoogleLoading
                            ? "Signing in with Google..."
                            : "Continue with Google"}
                    </button>

                    <BaseHeading
                        headingLevel="h4"
                        fontSize="small"
                        textAlign="center"
                        textColor="black"
                        className="mt-4"
                        fontWeight={400}
                    >
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-[#FF4E27] hover:text-[#e5431f]"
                        >
                            Login
                        </Link>
                    </BaseHeading>

                    <BaseText
                        textAlign="center"
                        fontSize="very small"
                        textColor="#9ca3af"
                        className="mt-4"
                    >
                        By continuing, you agree to SoundSpire&apos;s{" "}
                        <a href="#" className="text-primary hover:underline">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-primary hover:underline">
                            Privacy Policy
                        </a>
                        .
                    </BaseText>
                </div>
            </div>
        </div>
    );
}
