'use client'
import Navbar from "@/components/Navbar";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import useCheckPreferencesOnRoute from '@/hooks/useCheckPreferencesOnRoute';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
     const { user, isLoading } = useAuth();
  const router = useRouter();
  const { hasPreferences, isLoading: preferencesLoading } = useCheckPreferencesOnRoute();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  // Show loading while checking preferences
  if (isLoading || preferencesLoading) {
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
  if (!hasPreferences) {
    return null; // Will redirect to preference selection
  }

  return (
    <>
        <Navbar/>
          {children}
    </>
  );
}
