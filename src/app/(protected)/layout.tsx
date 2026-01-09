"use client";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import useCheckPreferencesOnRoute from "@/hooks/useCheckPreferencesOnRoute";
import useCheckCompleteProfileOnRoute from "@/hooks/useCheckCompleteProfileOnRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const { hasPreferences, isLoading: preferencesLoading } =
        useCheckPreferencesOnRoute();
    const { isProfileComplete, isLoading: profileLoading } =
        useCheckCompleteProfileOnRoute();

    useEffect(() => {
        if (isLoading || profileLoading || preferencesLoading) return;

        if (!user) {
            router.push("/");
            return;
        }

        if (!isProfileComplete) {
            router.push("/complete-profile");
            return;
        }

        if (!hasPreferences) {
            router.push("/PreferenceSelectionPage");
            return;
        }
    }, [
        user,
        isLoading,
        router,
        profileLoading,
        isProfileComplete,
        preferencesLoading,
        hasPreferences,
    ]);

    // Show loading while checking auth
    if (isLoading || preferencesLoading || profileLoading) {
        return (
            <div className="min-h-screen bg-[#1a1625] flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    // Block rendering if not authenticated
    if (!user || !isProfileComplete || !hasPreferences) {
        return null;
    }

    return (
        <>
            <Navbar />
            {children}
        </>
    );
}
