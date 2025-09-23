"use client";

// import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import useRedirectIfAuthenticated from "@/hooks/useRedirectIfAuthenticated";
import Image from "next/image";
import { getImageUrl } from "@/utils/userProfileImageUtils";


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
  // const router = useRouter();

  useRedirectIfAuthenticated();

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

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;

    if (user.full_name.trim().length < 3) {
      errors.full_name = "Name must be at least 3 characters";
    }

    if (user.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!emailRegex.test(user.email)) {
      errors.email = "Invalid email format";
    }

    if (user.password_hash.length < 6) {
      errors.password_hash = "Password must be at least 6 characters";
    }

    if (!["Male", "Female", "Other"].includes(user.gender)) {
      errors.gender = "Gender must be Male, Female or Other";
    }

    if (!mobileRegex.test(user.mobile_number)) {
      errors.mobile_number = "Mobile number must be 10 digits";
    }

    if (!user.date_of_birth) {
      errors.date_of_birth = "Date of Birth is required";
    } else {
      const birthDate = new Date(user.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();

      const isBirthdayPassedThisYear =
        monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0);
      const actualAge = isBirthdayPassedThisYear ? age : age - 1;

      if (actualAge < 13) {
        errors.date_of_birth = "You must be at least 13 years old";
      }
    }

    if (user.city.trim() === "") {
      errors.city = "City is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSignup = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    try {
      setLoading(true);
      const response = await axios.post("/api/users/signup", user);

      if (response.data.success) {
        toast.success("Verification email sent! Check your inbox.");

        // Clear form
        setUser({
          username: "",
          email: "",
          password_hash: "",
          full_name: "",
          gender: "",
          mobile_number: "",
          date_of_birth: "",
          city: "",
        });

        // Redirect to preference selection
        if (response.data.redirect) {
          window.location.href = response.data.redirect;
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Signup failed. Try again!");
        const redirectPath = error.response?.data?.redirect;
        if (redirectPath) {
          window.location.href = redirectPath;
        }
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      console.log("Google login clicked");
      // Simulate login logic
      // setTimeout(() => {
      //   router.push("/explore");
      // }, 1000);
      window.location.href = "/api/auth/google";
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
    <div className="min-h-screen flex bg-gradient-to-t from-gray-950 to-gray-900 text-white relative">

      {/* For Artists Button */}
      <div className="absolute top-4 right-4 z-10">
        <Link
          href="/artist-onboarding"
          className="px-6 py-2 bg-[#FA6400] hover:bg-[#e55a00] text-white font-bold rounded-lg transition-colors duration-200 shadow-lg"
        >
          For Artists
        </Link>
      </div>
      <div className="hidden md:flex w-1/2 bg-gradient-to-bt from-[#0f0c29] via-[#302b63] to-[#24243e] p-8 flex-col justify-between">
        {/* Logo at Top */}
        <div>
          <Image
            src={getImageUrl("s3://soundspirewebsiteassets/assets/ss_logo.png")} //logo-Photoroom.png
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
              {field.name === "gender" ? (
                <select
                  id={field.name}
                  value={user.gender}
                  onChange={(e) =>
                    setUser((prev) => ({
                      ...prev,
                      gender: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 rounded-md border border-blue-400/75 placeholder-gray-400 focus:outline-none focus:ring-1  focus:ring-blue-400 bg-white"
                >
                  <option value="" disabled>
                    Select gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <input
                  id={field.name}
                  type={field.type}
                  value={user[field.name as keyof typeof user]}
                  placeholder={field.placeholder}
                  onChange={(e) =>
                    setUser((prev) => ({
                      ...prev,
                      [field.name]: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 rounded-md border border-blue-400/75 placeholder-gray-400 focus:outline-none focus:ring-1  focus:ring-blue-400"
                />
              )}
              {formErrors[field.name] && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors[field.name]}
                </p>
              )}
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
