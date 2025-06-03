
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

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
  const router = useRouter();

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
      const { data } = await axios.post("/api/users/login", user);
      toast.success("Login successful!");
      router.push("/explore");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong during login.";
      toast.error(message);
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      // Replace with actual OAuth logic
      const { data } = await axios.get("/api/auth/google");
      toast.success("Redirecting to Google...");
      window.location.href = data.url;
    } catch (error: any) {
      toast.error("Google login failed. Try again later.");
      console.error("Google login error:", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const allFilled = Object.values(user).every((val) => val.trim().length > 0);
    setButtonDisabled(!allFilled);
  }, [user]);

  return (
    <div className="min-h-screen flex bg-gradient-to-t from-gray-950 to-gray-900 text-white">
         {/* Left Side: Branding & Welcome */}
  <div className="hidden md:flex w-1/2 bg-gradient-to-bt from-[#0f0c29] via-[#302b63] to-[#24243e] p-8 flex-col justify-between">
    
    {/* Logo at Top */}
    <div>
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

          <div className="text-center text-sm text-gray-400">or</div>

          <button
            onClick={onGoogleLogin}
            disabled={googleLoading}
            className="w-full py-3 flex justify-center items-center bg-red-600 hover:bg-red-700 rounded text-white font-semibold opacity-85 transition"
          >
            {googleLoading ? (
              "Redirecting to Google..."
            ) : (
              <>
                <FaGoogle className="mr-2" /> Login with Google
              </>
            )}
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
