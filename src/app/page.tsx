"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

const fields = [
  {
    label: "Name*",
    name: "full_name",
    type: "text",
    placeholder: "Enter your full name",
  },
  {
    label: "Username*",
    name: "username",
    type: "text",
    placeholder: "Choose a username",
  },
  {
    label: "Email*",
    name: "email",
    type: "email",
    placeholder: "Enter your email",
  },
  {
    label: "Password*",
    name: "password_hash",
    type: "password",
    placeholder: "Create a password",
  },
  {
    label: "Gender*",
    name: "gender",
    type: "text",
    placeholder: "Enter your gender",
  },
  {
    label: "Mobile Number*",
    name: "mobile_number",
    type: "text",
    placeholder: "Enter your mobile number",
  },
  {
    label: "Date of Birth*",
    name: "date_of_birth",
    type: "date",
    placeholder: "dd/mm/yyyy",
  },
  {
    label: "City*",
    name: "city",
    type: "text",
    placeholder: "Enter your city",
  },
];

export default function SignupPage() {
  const router = useRouter();

  const [user, setUser] = useState({
    full_name: "",
    username: "",
    email: "",
    password_hash: "",
    gender: "",
    mobile_number: "",
    date_of_birth: "",
    city: "",
  });

  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);

  const onSignup = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/users/signup", user);
      console.log("Signup successful", response.data);
      toast.success("Signup successful!");
      router.push("/login");
    } catch (error: any) {
      console.log("Signup failed!");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      console.log("Google login clicked");
      // Simulate login logic
      setTimeout(() => {
        router.push("/explore");
      }, 1000);
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Google login failed");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    const allFilled = Object.values(user).every((val) => val.trim().length > 0);
    setButtonDisabled(!allFilled);
  }, [user]);

  return (
    <div className="min-h-screen flex bg-gray-900 text-white">
      {/* Left Side: Image or Branding */}
      <div className="hidden md:flex w-1/2 bg-cover bg-center items-center justify-center p-8">
        <div className=" bg-opacity-50 p-8 rounded-lg">
          <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-lg text-gray-300">
            Log in to access your dashboard, connect with others, and explore
            more.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="bg-white text-black flex flex-col justify-center items-center w-full md:w-1/2 p-8">
        <div className="w-full max-w-md space-y-4">
          <h1 className="text-2xl mb-4 self-start">
            {loading ? "Processing..." : "Sign Up"}
          </h1>

          {fields.map((field) => (
            <div key={field.name} className="flex flex-col">
              <label htmlFor={field.name} className="mb-1 text-sm font-medium">
                {field.label}
              </label>
              <input
                id={field.name}
                type={field.type}
                value={user[field.name as keyof typeof user]}
                placeholder={field.placeholder}
                onChange={(e) =>
                  setUser((prev) => ({
                    ...prev,
                    [field.name]:
                      field.name === "gender"
                        ? e.target.value.toLowerCase()
                        : e.target.value,
                  }))
                }
                className="w-full px-4 py-2 rounded-md border border-blue-400/75 placeholder-gray-400 focus:outline-none focus:ring-1  focus:ring-blue-400"
              />
            </div>
          ))}

          <button
            onClick={onSignup}
            disabled={buttonDisabled || loading}
            className="w-full py-3 my-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold disabled:opacity-85 disabled:cursor-not-allowed transition"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="w-full py-3 flex justify-center items-center bg-red-600 hover:bg-red-700 rounded text-white font-semibold opacity-85 transition"
          >
            <FaGoogle className="mr-2" />
            {isGoogleLoading
              ? "Signing in with Google..."
              : "Continue with Google"}
          </button>

          {/* Login redirect */}
          <h4 className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-orange-400 hover:text-orange-300"
            >
              Login
            </Link>
          </h4>

          {/* Terms and Privacy */}
          <div className="mt-4 text-center text-xs text-gray-400">
            By continuing, you agree to SoundSpire&apos;s{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
