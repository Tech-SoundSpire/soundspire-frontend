"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import BaseHeading from "@/components/BaseHeading/BaseHeading";
import BaseText from "@/components/BaseText/BaseText";

export default function VerifyEmailPage() {
    const [token, setToken] = useState("");
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Extract and set the token from the URL
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");
        if (urlToken) setToken(urlToken);
    }, []);

    // Automatically verify once token is available
    useEffect(() => {
        const verifyUserEmail = async () => {
            setLoading(true);
            try {
                await axios.post(
                    "/api/users/verifyemail",
                    { token },
                    { withCredentials: true }
                );

                setVerified(true);
                setError(false);

                toast.success("Email verified successfully! Redirecting...");
                setTimeout(() => {
                    // ✅ Redirect to profile completion form
                    router.replace("/complete-profile");
                }, 2000);
            } catch (err) {
                setError(true);
                if (axios.isAxiosError(err)) {
                    const message =
                        err?.response?.data?.message || "Verification failed!";
                    toast.error(message);
                } else {
                    toast.error("Unexpected error occurred!");
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            verifyUserEmail();
        }
    }, [token, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2 text-white">
            <BaseHeading
                fontWeight={600}
                className="mb-4"
                headingLevel="h1"
                fontSize="sub heading"
            >
                Verify Email
            </BaseHeading>

            {loading && (
                <div className="mt-4 flex items-center space-x-2">
                    <div className="w-6 h-6 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                    <BaseText
                        wrapper="span"
                        textColor="#fdba74"
                        fontSize="small"
                    >
                        Verifying your email...
                    </BaseText>
                </div>
            )}

            {!loading && verified && (
                <div className="text-green-500 mt-4">
                    <BaseHeading headingLevel="h2" className="mt-4">
                        Email Verified Successfully!
                    </BaseHeading>
                    <BaseText>
                        Redirecting you to complete your profile...
                    </BaseText>
                </div>
            )}

            {!loading && error && (
                <div className="text-red-500 mt-4">
                    <BaseHeading headingLevel="h2">
                        Verification Failed!
                    </BaseHeading>
                    <BaseText>
                        Please check your link or request a new verification
                        email.
                    </BaseText>
                </div>
            )}
        </div>
    );
}
