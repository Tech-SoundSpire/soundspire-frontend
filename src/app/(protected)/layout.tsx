"use client";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useCheckPreferencesOnRoute from "@/hooks/useCheckPreferencesOnRoute";
import useCheckCompleteProfileOnRoute from "@/hooks/useCheckCompleteProfileOnRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, switchRole } = useAuth();
    const router = useRouter();

    const { hasPreferences, isLoading: preferencesLoading } = useCheckPreferencesOnRoute();
    const { isProfileComplete, isLoading: profileLoading } = useCheckCompleteProfileOnRoute();

    // Auto-switch artist to fan when accessing fan routes
    useEffect(() => {
        if (!isLoading && user?.role === "artist") switchRole("user");
    }, [user, isLoading]);

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
    }, [user, isLoading, router, profileLoading, isProfileComplete, preferencesLoading, hasPreferences]);

    if (isLoading || preferencesLoading || profileLoading) {
        return (
            <div className="min-h-screen bg-[#1a1625] flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!user || !isProfileComplete || !hasPreferences) {
        return null;
    }

    return (
        <div className="min-h-screen pb-16 md:pb-0" style={{ background: "linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 30%, #1a0a2e 70%, #0a0612 100%)" }}>
            <div className="hidden md:block"><Navbar /></div>
            <MobileNav />
            {children}
        </div>
    );
}
