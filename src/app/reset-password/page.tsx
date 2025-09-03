"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import toast from "react-hot-toast";
import { getLogoUrl } from "@/utils/userProfileImageUtils";

export default function ResetPassword() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing token.");
      router.push("/login");
    }
  }, [token, router]);

  const handleReset = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (!password || !confirmPassword) {
      toast.error("Both the Fileds are required.");
      return;
    }
    if (password != confirmPassword) {
      toast.error("Password do not match.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/users/reset-password", { token, password });
      toast.success("password Updates!");
      router.push("/login");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err?.response?.data?.message || "Error resetting password.",
        );
      } else {
        toast.error("unexpected error occured!");
      }
    } finally {
      setLoading(false);
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
          <h1 className="text-6xl font-semibold mb-4 bg-gradient-to-b from-orange-500 to-orange-700 bg-clip-text text-transparent italic">
            Welcome Back
          </h1>
          <div className="text-5xl bg-gradient-to-t from-gray-400 to-gray-50 font-light bg-clip-text text-transparent space-y-2 italic">
            <h2>Your Vibe,</h2>
            <h2>Your Beats,</h2>
            <h2>Your World Awaits.</h2>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white text-black">
        <div className="bg-slate-100 p-6 rounded shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Reset Password
          </h2>
          <span className="text-sm font-light mb-8">
            Password <span className="text-red-600">*</span>
          </span>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <span className="text-sm font-light mb-8">
            Re-Enter Password <span className="text-red-600">*</span>
          </span>
          <input
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleReset}
            disabled={loading || !password}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
