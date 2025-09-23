import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";

//This will redirect if user session is still active to the feed page
const useRedirectIfAuthenticated = (redirectTo = "/feed") => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && user && (pathname === "/" || pathname === "/login")) {
      router.push(redirectTo);
    }
  }, [user, isLoading, pathname, router, redirectTo]);
};

export default useRedirectIfAuthenticated;
