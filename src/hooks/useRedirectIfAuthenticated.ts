import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

//This will redirect if user session is still active to the feed page
const useRedirectIfAuthenticated = (redirectTo = "/feed") => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!user) return;

    if (pathname === redirectTo || pathname === "/artist/dashboard") return;

    const isAuthPage = [
      "/",
      "/login",
      "/signup",
      "/artist-onboarding",
      "/find-artist-profile",
      "/artist-details",
      "/payout"
    ].includes(pathname);

    if (isAuthPage) {
      if (user.role === "artist") {
        toast.success("Welcome back, Artist!");
        router.replace("/artist/dashboard");
      } else {
        toast.success("Welcome back!");
        router.replace(redirectTo);
      }
    }
  }, [user, isLoading, pathname, router, redirectTo]);
};

export default useRedirectIfAuthenticated;
