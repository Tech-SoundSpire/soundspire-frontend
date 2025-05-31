"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

// export default function LoginPage() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [user, setUser] = useState(null); // Temporary local user (optional)

//   useEffect(() => {
//     // Example: If user is already "logged in", redirect them
//     if (user) {
//       router.push('/explore');
//     }
//   }, [user, router]);

//   const handleGoogleLogin = async () => {
//     setIsLoading(true);
//     try {
//       // Placeholder for actual login logic
//       console.log('Google login clicked');

//       // Simulate successful login
//       setTimeout(() => {
//         setUser({ name: 'Sample User' }); // Set fake user
//         router.push('/explore'); // Navigate after login
//       }, 1000);
//     } catch (error) {
//       console.error('Google login failed:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen">
//       {/* For Artists Button */}
//       <div className="absolute top-4 right-4">
//         <button className="px-6 py-2 rounded-full bg-[#FF2800] hover:bg-[#00BFFF] text-white font-semibold transition-colors duration-200">
//           For Artists
//         </button>
//       </div>

//       <div className="flex flex-col items-center justify-center min-h-screen p-4">
//         {/* Logo and Title */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl font-bold text-white mb-2">
//             <Image
//               src="/images/logo-Photoroom.png"
//               alt="SoundSpire Logo"
//               className="inline-block"
//               width={500}
//               height={500}
//             />
//           </h1>
//           <p className="text-white">The SuperFandom platform</p>
//         </div>

//         {/* Login Options */}
//         <div className="w-full max-w-md space-y-4">
//           <button
//             onClick={handleGoogleLogin}
//             disabled={isLoading}
//             className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-white hover:bg-gray-50 text-black font-semibold border border-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <FaGoogle className="text-xl" />
//             {isLoading ? 'Loading...' : 'Continue with Google'}
//           </button>
//         </div>

//         {/* Terms and Privacy */}
//         <div className="mt-8 text-center text-sm text-white">
//           By continuing, you agree to SoundSpire&apos;s{' '}
//           <a href="#" className="text-primary hover:underline">Terms of Service</a>{' '}
//           and{' '}
//           <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
//         </div>
//       </div>
//     </div>
//   );
// }

const fields = [
  {
    label: "Name",
    name: "full_name",
    type: "text",
    placeholder: "Enter your full name",
  },
  {
    label: "Username",
    name: "username",
    type: "text",
    placeholder: "Choose a username",
  },
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
    placeholder: "Create a password",
  },
  {
    label: "Gender",
    name: "gender",
    type: "text",
    placeholder: "Enter your gender",
  },
  {
    label: "Mobile Number",
    name: "mobile_number",
    type: "text",
    placeholder: "Enter your mobile number",
  },
  {
    label: "Date of Birth",
    name: "date_of_birth",
    type: "date",
    placeholder: "",
  },
  { label: "City", name: "city", type: "text", placeholder: "Enter your city" },
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

  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [loading, setLoading] = useState(false);

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
      setLoading(false);
    }
  };

  //for monitoring any state
  useEffect(() => {
    const allFilled = Object.values(user).every((val) => val.trim().length > 0);
    setButtonDisabled(!allFilled);
    // if (
    //   user.username.length > 0 &&
    //   user.email.length > 0 &&
    //   user.password_hash.length > 0 &&
    //   user.full_name.length > 0 &&
    //   user.gender.length > 0 &&
    //   user.mobile_number.length > 0 &&
    //   user.date_of_birth.length > 0 &&
    //   user.city.length > 0
    // ) {
    //   setButtonDisabled(false);
    // } else {
    //   setButtonDisabled(true);
    // }
  }, [user]);

  return (
    <div className="text-white flex flex-col items-center justify-center min-h-screen py-2">
      <h1>{loading ? "Processing" : "Signup"}</h1>
      <hr />
      <div className="w-full max-w-md space-y-4">
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
              className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <button
          onClick={onSignup}
          disabled={buttonDisabled || loading}
          className="w-full py-3 my-4 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition "
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
        <h4 className="text-center text-sm mt-2">
          Already have an account ? {" "}
          <Link
            href="/login"
            className="text-orange-400 hover:text-orange-300"
          >
          Login
          </Link>
        </h4>
      </div>
    </div>
  );
}
