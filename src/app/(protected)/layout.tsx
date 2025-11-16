'use client';
import Navbar from "@/components/Navbar";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useCheckPreferencesOnRoute from '@/hooks/useCheckPreferencesOnRoute';
import useCheckCompleteProfileOnRoute from "@/hooks/useCheckCompleteProfileOnRoute";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const {
    hasPreferences,
    isLoading: preferencesLoading
  } = useCheckPreferencesOnRoute();
  const {
    isProfileComplete,
    isLoading: profileLoading
  } = useCheckCompleteProfileOnRoute();

  const checksLoading =
    !!user && (profileLoading || preferencesLoading);
  const allLoading = authLoading || checksLoading;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      console.log("No user found → redirecting to /login");
      router.replace("/login");
      return;
    }

    if (profileLoading || preferencesLoading) return;

    if (user.role === "artist") {
      router.replace("/artist/dashboard");
      return;
    }

    if (!isProfileComplete) {
      router.push('/complete-profile');
      return;
    }

    if (!hasPreferences) {
      router.push('/PreferenceSelectionPage');
      return;
    }
  }, [
    user, authLoading, profileLoading, preferencesLoading, isProfileComplete, hasPreferences, router
  ]);

  // Show loading while checking preferences
  if (allLoading) {
    return (
      <div className="min-h-screen bg-[#120B1A] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  // If user doesn't have preferences, they will be redirected by the hook
  if (!isProfileComplete || !hasPreferences) {
    return null; // Will redirect to preference selection
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
