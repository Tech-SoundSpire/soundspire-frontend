"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
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
      try {
        await axios.post("/api/users/verifyemail", { token });
        setVerified(true);
        setError(false);
        toast.success("Email verified successfully!");

      } catch (err: any) {
        setError(true);
        const message = err?.response?.data?.message || "Verification failed!";
        toast.error(message);
        console.error(err);
      }
    };

    if (token) {
      verifyUserEmail();
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-semibold mb-4">Verify Email</h1>

      <h2 className="p-2 mb-2 bg-orange-500 text-white rounded">
        {token ? `Verifying token: ${token}` : "No token found in URL"}
      </h2>

      {verified && (
        <div className="text-green-500 mt-4">
          <h2>Email Verified Successfully!</h2>
          <p>Redirecting to login page...</p>
        </div>
      )}

      {error && (
        <div className="text-red-500 mt-4">
          <h2>Verification Failed!</h2>
          <p>Please check your link or request a new verification email.</p>
        </div>
      )}
    </div>
  );
}
