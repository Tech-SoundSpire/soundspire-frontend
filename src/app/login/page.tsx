// "use client";

// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { FaGoogle } from "react-icons/fa";
// import axios from "axios";
// import toast from "react-hot-toast";
// import Link from "next/link";

// const fields = [
//   {
//     label: "Email",
//     name: "email",
//     type: "email",
//     placeholder: "Enter your email",
//   },
//   {
//     label: "Password",
//     name: "password_hash",
//     type: "password",
//     placeholder: "Enter your password",
//   },
// ];

// export default function LoginPage() {
//   const router = useRouter();

//   const [user, setUser] = useState({
//     email: "",
//     password_hash: "",
//   });

//   const [buttonDisabled, setButtonDisabled] = useState(true);
//   const [loading, setLoading] = useState(false);

//   const onLogin = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.post("/api/users/login", user);
//       toast.success("Login successful!");
//       router.push("/explore");
//     } catch (error: any) {
//       const message =
//         error?.response?.data?.message ||
//         error?.message ||
//         "Something went wrong during login.";
//       toast.error(message);
//       console.error("Login failed:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const allFilled = Object.values(user).every((val) => val.trim().length > 0);
//     setButtonDisabled(!allFilled);
//   }, [user]);

//   return (
//     <div className="text-white flex flex-col items-center justify-center min-h-screen py-2">
//       <h1 className="text-3xl font-semibold mb-4">
//         {loading ? "Logging you in..." : "Login"}
//       </h1>

//       <div className="w-full max-w-md space-y-4">
//         {fields.map(({ label, name, type, placeholder }) => (
//           <div key={name} className="flex flex-col">
//             <label
//               htmlFor={name}
//               className="mb-1 text-sm font-medium text-gray-300"
//             >
//               {label}
//             </label>
//             <input
//               id={name}
//               type={type}
//               value={user[name as keyof typeof user]}
//               placeholder={placeholder}
//               onChange={(e) =>
//                 setUser((prev) => ({
//                   ...prev,
//                   [name]: e.target.value,
//                 }))
//               }
//               className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         ))}

//         <button
//           onClick={onLogin}
//           disabled={buttonDisabled || loading}
//           className="w-full py-3 my-4 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>

//         {/* Optional Google Login placeholder */}
//         <button
//           className="w-full py-3 my-2 flex justify-center items-center bg-red-600 hover:bg-red-700 rounded text-white font-semibold disabled:opacity-50 transition"
//         >
//           <FaGoogle className="mr-2" /> Login with Google
//         </button>

//         <h4 className="text-center text-sm mt-4">
//           Don&apos;t have an account yet?{" "}
//           <Link href="/" className="text-orange-400 hover:text-orange-300">
//             Sign up
//           </Link>
//         </h4>
//       </div>
//     </div>
//   );
// }


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
    <div className="flex min-h-screen text-white">
      {/* Left Side: Image or Branding */}
      <div className="hidden md:flex w-1/2 bg-cover bg-center items-center justify-center p-8" >
        <div className="bg-black bg-opacity-50 p-8 rounded-lg">
          <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-lg text-gray-300">
            Log in to access your dashboard, connect with others, and explore more.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-gray-900">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-semibold text-center">
            {loading ? "Logging you in..." : "Login"}
          </h2>

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
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center text-sm text-gray-400">or</div>

          <button
            onClick={onGoogleLogin}
            disabled={googleLoading}
            className="w-full py-3 flex justify-center items-center bg-red-600 hover:bg-red-700 rounded text-white font-semibold disabled:opacity-50 transition"
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
