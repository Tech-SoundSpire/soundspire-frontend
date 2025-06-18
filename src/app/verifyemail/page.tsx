"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
// import Link from "next/link";
import { useRouter } from "next/navigation";

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
        await axios.post("/api/users/verifyemail", { token }, {withCredentials: true});
        setVerified(true);
        setError(false);
        // setLoadding(false);
        
        toast.success("Email verified successfully! Redirecting....");
        setTimeout(() => {
          // router.replace("/explore");
          window.location.href = "/explore";
        },3000);

      } catch (err) {
        // setLoadding(false);
        setError(true);
        if(axios.isAxiosError(err)){
          const message = err?.response?.data?.message || "Verification failed!";
          toast.error(message);
        }else{
          toast.error("unexpected error occured!");
          console.error(err);
        }
      }finally{
        setLoading(false);
      }
    };

    if (token) {
      verifyUserEmail();
    }
  }, [token,router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 text-white">
      <h1 className="text-4xl font-semibold mb-4">Verify Email</h1>

       {loading && (
        <div className="mt-4 flex items-center space-x-2">
          <div className="w-6 h-6 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-orange-300">Verifying your email...</span>
        </div>
      )}

      {!loading && verified && (
        <div className="text-green-500 mt-4">
          <h2>Email Verified Successfully!</h2>
          <p>Redirecting to your dashboard...</p>
        </div>
      )}

      {!loading && error && (
        <div className="text-red-500 mt-4">
          <h2>Verification Failed!</h2>
          <p>Please check your link or request a new verification email.</p>
        </div>
      )}
    </div>
  );
}
