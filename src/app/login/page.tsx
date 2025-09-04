"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
// import { FaGoogle } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import useRedirectIfAuthenticated from "@/hooks/useRedirectIfAuthenticated";
import { FaGoogle } from "react-icons/fa";

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

        // Redirect based on preferences
        if (response.data.redirect) {
          window.location.href = response.data.redirect;
        } else {
          window.location.href = "/explore";
        }
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
    const allFilled = Object.values(user).every((val) => val.trim().length > 0);
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
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-Photoroom.png"
            alt="SoundSpire logo"
            width={200}
            height={200}
            className="mb-4"
          />
        </div>

        {/* Welcome Text at Bottom */}
        <div className="mb-12">
          <h1 className="text-6xl font-semibold mb-4 bg-gradient-to-b from-orange-500 to-orange-700 bg-clip-text text-transparent italic">
            Welcome Back_
          </h1>
          <div className="text-5xl bg-gradient-to-t from-gray-400 to-gray-50 font-light bg-clip-text text-transparent space-y-2 italic">
            <h2>Your Vibe,</h2>
            <h2>Your Beats,</h2>
            <h2>Your World Awaits.</h2>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white text-black">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-3xl self-start">
            {loading ? "Logging you in..." : "Login"}
          </h2>

          {fields.map(({ label, name, type, placeholder }) => (
            <div key={name} className="flex flex-col">
              <label
                htmlFor={name}
                className="mb-1 text-sm font-medium text-black"
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
                className="w-full px-4 py-2 rounded-md border border-blue-400/75 placeholder-gray-400 focus:outline-none focus:ring-1  focus:ring-blue-400"
              />
            </div>
          ))}

          <button
            onClick={onLogin}
            disabled={buttonDisabled || loading}
            className="w-full py-3 my-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold disabled:opacity-85 disabled:cursor-not-allowed transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <Link
            href="/forgot-password"
            className="text-center block text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </Link>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-3 flex justify-center items-center bg-red-600 hover:bg-red-700 rounded text-white font-semibold transition"
          >
            <FaGoogle className="mr-2" />
            {googleLoading
              ? "Signing in with Google..."
              : "Continue with Google"}
          </button>

          <p className="text-center text-sm mt-6 text-gray-400">
            Don&apos;t have an account yet?{" "}
            <Link href="/" className="text-orange-400 hover:text-orange-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
