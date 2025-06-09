"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ResetPassword() {
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
  }, [token]);

  const handleReset = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if(!password || !confirmPassword){
      toast.error("Both the Fileds are required.");
      return;
    }
    if(password!= confirmPassword) {
      toast.error("Password do not match.");
      return;

    }

    try {
      setLoading(true);
      await axios.post("/api/users/reset-password", { token, password });
      toast.success("password Updates!");
      router.push("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error resetting password.");
    } finally {
      setLoading(false);
    }
  };
  return (<div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Reset Password</h2>
        <span className="text-sm font-light mb-8">Password <span className="text-red-600">*</span></span> 
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
     
        <span className="text-sm font-light mb-8">Re-Enter Password <span className="text-red-600">*</span></span>
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
    </div>);
}
