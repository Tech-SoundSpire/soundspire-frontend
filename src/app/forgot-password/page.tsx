"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import BaseText from "@/components/BaseText/BaseText";
import { getLogoUrl } from "@/utils/userProfileImageUtils";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");

    const handleSubmit = async () => {
        try {
            const res = await axios.post("/api/users/forgot-password", {
                email,
            });
            toast.success(
                res.data.message || "Reset link sent! Check your inbox."
            );
            setEmail("");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(
                    error?.response?.data?.message || "Something went wrong."
                );
            } else {
                toast.error("An unexpected error occurred.");
            }
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-t from-gray-950 to-gray-900">
            <div className="hidden md:flex w-1/2 bg-gradient-to-bt from-[#0f0c29] via-[#302b63] to-[#24243e] p-8 flex-col justify-between">
                {/* Logo at Top */}
                <div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={getLogoUrl()}
                        alt="SoundSpire logo"
                        width={200}
                        height={200}
                        className="mb-4"
                    />
                </div>

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

            {/* Right Side */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white text-black">
                <div className="bg-slate-100 p-6 rounded shadow-md w-full max-w-md">
                    <BaseHeading
                        fontSize="large"
                        fontWeight={500}
                        textAlign="center"
                        className="m-8"
                    >
                        Forgot Password
                    </BaseHeading>
                    <BaseText
                        fontSize="small"
                        textAlign="center"
                        className="m-8"
                    >
                        Enter the email address you use on SoundSpire.
                        We&apos;ll send you a link to reset your password.
                    </BaseText>
                    <BaseText wrapper="span" fontSize="normal" className="mb-8">
                        Email{" "}
                        <BaseText wrapper="span" textColor="#dc2626">
                            *
                        </BaseText>
                    </BaseText>
                    <input
                        type="email"
                        value={email}
                        placeholder="Enter your email"
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full mb-8 mt-2 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        Reset Password
                    </button>

                    <BaseText
                        textAlign="center"
                        fontSize="small"
                        className="mt-6"
                    >
                        Back to{" "}
                        <Link
                            href="/login"
                            className="text-orange-400 hover:text-orange-500"
                        >
                            Log in
                        </Link>
                    </BaseText>
                </div>
            </div>
        </div>
    );
}
