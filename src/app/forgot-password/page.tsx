"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    try {
      await axios.post("/api/users/forgot-password", { email });
      toast.success("Reset link sent! Check your inbox.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-3xl  font-medium m-8 text-center">Forgot Password</h2>
        <p className="text-sm m-8 text-center">Enter the email address you use on SoundSpire. We'll send you a link to reset your password.</p>
        <span className="text-lg mb-8">Email <span className="text-red-600">*</span></span>
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

        <p className="text-center text-sm mt-6">
            Back to{" "}
            <Link href="/login" className="text-orange-400 hover:text-orange-500">
              Log in
            </Link>
          </p>
      </div>
    </div>
  );
}
