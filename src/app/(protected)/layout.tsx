'use client'
import Navbar from "@/components/Navbar";
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import useCheckPreferencesOnRoute from '@/hooks/useCheckPreferencesOnRoute';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { hasPreferences, isLoading: preferencesLoading } = useCheckPreferencesOnRoute();

  // Allow profile page access without preferences
  const isProfilePage = pathname === '/(protected)/profile';
  const skipPreferenceCheck = isProfilePage;

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  // Show loading while checking auth
  if (isLoading) {
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

  // Show loading while checking preferences (only if not skipping preference check)
  if (!skipPreferenceCheck && preferencesLoading) {
    return (
      <div className="min-h-screen bg-[#120B1A] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  // If user doesn't have preferences and we're not on profile page, redirect
  if (!skipPreferenceCheck && !hasPreferences) {
    return null; // Will redirect to preference selection
  }

  return (
    <>
      <Navbar/>
      {children}
    </>
  );
}
