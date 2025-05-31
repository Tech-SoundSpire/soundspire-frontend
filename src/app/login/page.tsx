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

  useEffect(() => {
    const allFilled = Object.values(user).every((val) => val.trim().length > 0);
    setButtonDisabled(!allFilled);
  }, [user]);

  return (
    <div className="text-white flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-3xl font-semibold mb-4">
        {loading ? "Logging you in..." : "Login"}
      </h1>

      <div className="w-full max-w-md space-y-4">
        {fields.map(({ label, name, type, placeholder }) => (
          <div key={name} className="flex flex-col">
            <label
              htmlFor={name}
              className="mb-1 text-sm font-medium text-gray-300"
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
              className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        <button
          onClick={onLogin}
          disabled={buttonDisabled || loading}
          className="w-full py-3 my-4 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Optional Google Login placeholder */}
        <button
          className="w-full py-3 my-2 flex justify-center items-center bg-red-600 hover:bg-red-700 rounded text-white font-semibold disabled:opacity-50 transition"
        >
          <FaGoogle className="mr-2" /> Login with Google
        </button>

        <h4 className="text-center text-sm mt-4">
          Don&apos;t have an account yet?{" "}
          <Link href="/" className="text-orange-400 hover:text-orange-300">
            Sign up
          </Link>
        </h4>
      </div>
    </div>
  );
}
